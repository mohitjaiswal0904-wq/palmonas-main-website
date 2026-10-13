'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { gokwikAnalyticsEvents } from '@/config/analytics/analytics.config';
import {
  CHECKOUT_SOURCE_STORAGE_KEY,
  clearCheckoutSession,
} from '@/infrastructure/gokwik/checkout';
import { trackOrderCompleted } from '@/lib/analytics/analytics-trackers';
import {
  readGokwikOrderId,
  type GokwikAnalyticsEvent,
} from '@/lib/analytics/parse-gokwik-analytics-event';
import { subscribeGokwikAnalyticsEvents } from '@/lib/analytics/subscribe-gokwik-events';
import { trackGokwikCheckoutEvent } from '@/lib/analytics/track-gokwik-events';
import { queryKeys } from '@/lib/query/keys';
import { clearCart, invalidateCartCache } from '@/repositories/cart/cart.repository';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';

const ORDER_SUCCESS_EVENTS = new Set([
  'orderSuccess',
  'order-placed',
  'order-complete',
  gokwikAnalyticsEvents.orderPlaced,
]);

/**
 * Reads a finite number from common order-total keys on a GoKwik payload.
 *
 * @param record - Order payload object.
 */
function readOrderAmount(record: Record<string, unknown>): number | undefined {
  const candidates = [
    record.total_price,
    record.totalPrice,
    record.order_total,
    record.orderTotal,
    record.amount,
    record.value,
    record.total,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string' && candidate.trim()) {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

/**
 * Reads optional customer contact fields for Enhanced Conversions via GTM.
 *
 * @param record - Order payload object.
 */
function readCustomerContact(record: Record<string, unknown>): {
  email?: string;
  phone?: string;
} {
  const customer =
    record.customer && typeof record.customer === 'object'
      ? (record.customer as Record<string, unknown>)
      : record;

  const email =
    typeof customer.email === 'string' && customer.email.trim() ? customer.email.trim() : undefined;
  const phoneRaw = customer.phone ?? customer.mobile ?? customer.phone_number;
  const phone =
    typeof phoneRaw === 'string' && phoneRaw.trim()
      ? phoneRaw.trim()
      : typeof phoneRaw === 'number'
        ? String(phoneRaw)
        : undefined;

  return { email, phone };
}

function extractOrderId(orderData: unknown): string | null {
  if (!orderData || typeof orderData !== 'object') return null;

  const data = orderData as Record<string, unknown>;
  const body =
    data.orderSuccessBody && typeof data.orderSuccessBody === 'object'
      ? (data.orderSuccessBody as Record<string, unknown>)
      : undefined;

  const fromBody = body ? readGokwikOrderId(body) : undefined;
  const fromRoot = readGokwikOrderId(data);
  return fromBody ?? fromRoot ?? null;
}

/**
 * Pushes a purchase dataLayer event for GTM Google Ads + GA4 tags.
 *
 * @param orderData - GoKwik order success payload.
 * @param orderId - Resolved order id / name.
 */
function trackPurchaseFromOrder(orderData: unknown, orderId: string): void {
  const root =
    orderData && typeof orderData === 'object' ? (orderData as Record<string, unknown>) : {};
  const body =
    root.orderSuccessBody && typeof root.orderSuccessBody === 'object'
      ? (root.orderSuccessBody as Record<string, unknown>)
      : root;

  const amount = readOrderAmount(body) ?? readOrderAmount(root) ?? 0;
  const { email, phone } = {
    ...readCustomerContact(root),
    ...readCustomerContact(body),
  };

  trackOrderCompleted(
    {
      order_id: orderId,
      total_amount: amount,
      payment_method: 'gokwik',
      items_count: 0,
      currency: 'INR',
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    },
    { value: amount, currency: 'INR' },
  );
}

function parseCheckoutMessage(data: unknown): { eventName: string; orderData: unknown } | null {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const eventName =
    (typeof record.eventname === 'string' && record.eventname) ||
    (typeof record.event === 'string' && record.event) ||
    (typeof record.eventName === 'string' && record.eventName);

  if (!eventName) return null;

  return {
    eventName,
    orderData: record.data ?? record.detail ?? record.payload ?? record,
  };
}

/**
 * Listens for GoKwik checkout completion events and routes to order-success.
 * Clears the long-term cart when checkout was opened from the cart page.
 */
export function GokwikCheckoutEvents() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);
  const handledRef = useRef(false);
  const trackedGkEventsRef = useRef(new Set<string>());

  useEffect(() => {
    const trackGokwikPixelEvent = (event: GokwikAnalyticsEvent): void => {
      const orderId = readGokwikOrderId(event.data);
      const dedupeKey = `${event.eventName}:${orderId ?? 'na'}`;
      if (trackedGkEventsRef.current.has(dedupeKey)) {
        return;
      }
      trackedGkEventsRef.current.add(dedupeKey);
      trackGokwikCheckoutEvent(event);
    };

    const handleOrderSuccess = async (orderData: unknown): Promise<void> => {
      if (handledRef.current) return;
      handledRef.current = true;

      const source = sessionStorage.getItem(CHECKOUT_SOURCE_STORAGE_KEY);
      const orderId = extractOrderId(orderData);
      const pixelRoot =
        orderData && typeof orderData === 'object' ? (orderData as Record<string, unknown>) : {};
      const pixelBody =
        pixelRoot.orderSuccessBody && typeof pixelRoot.orderSuccessBody === 'object'
          ? (pixelRoot.orderSuccessBody as Record<string, unknown>)
          : {};
      trackGokwikPixelEvent({
        eventName: gokwikAnalyticsEvents.orderPlaced,
        data: { ...pixelRoot, ...pixelBody },
      });
      clearCheckoutSession();

      if (orderId) {
        trackPurchaseFromOrder(orderData, orderId);
      }

      if (source === 'cart') {
        try {
          invalidateCartCache();
          const cart = await clearCart();
          setCart(cart);
          queryClient.setQueryData(queryKeys.cart.current(), cart);
          useCartStatsStore.getState().syncCartCountFromCart(cart);
        } catch {
          // Still navigate — order succeeded even if cart clear failed.
        }
      }

      const params = new URLSearchParams();
      if (orderId) params.set('orderId', orderId);
      const query = params.toString();
      router.push(query ? `/order-success?${query}` : '/order-success');
    };

    const onCustomEvent = (event: Event): void => {
      if (event.type === 'modal_closed') return;

      if (ORDER_SUCCESS_EVENTS.has(event.type)) {
        const detail = event instanceof CustomEvent ? event.detail : undefined;
        void handleOrderSuccess(detail);
      }
    };

    const onMessage = (event: MessageEvent): void => {
      const parsed = parseCheckoutMessage(event.data);
      if (!parsed) return;

      if (parsed.eventName === 'modal_closed') return;

      if (ORDER_SUCCESS_EVENTS.has(parsed.eventName)) {
        void handleOrderSuccess(parsed.orderData);
      }
    };

    for (const name of ORDER_SUCCESS_EVENTS) {
      window.addEventListener(name, onCustomEvent);
    }
    window.addEventListener('modal_closed', onCustomEvent);
    window.addEventListener('message', onMessage);
    const unsubscribeGokwikPixel = subscribeGokwikAnalyticsEvents((event) => {
      trackGokwikPixelEvent(event);
      if (ORDER_SUCCESS_EVENTS.has(event.eventName)) {
        void handleOrderSuccess(event.data);
      }
    });

    return () => {
      for (const name of ORDER_SUCCESS_EVENTS) {
        window.removeEventListener(name, onCustomEvent);
      }
      window.removeEventListener('modal_closed', onCustomEvent);
      window.removeEventListener('message', onMessage);
      unsubscribeGokwikPixel();
    };
  }, [queryClient, router, setCart]);

  return null;
}
