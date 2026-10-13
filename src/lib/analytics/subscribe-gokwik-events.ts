import { gokwikAnalyticsEvents } from '@/config/analytics/analytics.config';
import {
  parseGokwikAnalyticsEvent,
  type GokwikAnalyticsEvent,
} from '@/lib/analytics/parse-gokwik-analytics-event';

/**
 * Subscribes to Shopify-style `gokwik_events` plus `Order_Placed_GK` and postMessage.
 *
 * @param onEvent - Called for each parsed GoKwik event.
 * @returns Unsubscribe that removes the window listeners.
 */
export function subscribeGokwikAnalyticsEvents(
  onEvent: (event: GokwikAnalyticsEvent) => void,
): () => void {
  const emitFromRaw = (raw: unknown, fallbackName?: string): void => {
    const parsed = parseGokwikAnalyticsEvent(raw);
    if (parsed) {
      onEvent(parsed);
      return;
    }

    if (!fallbackName) {
      return;
    }

    const wrapped = parseGokwikAnalyticsEvent({
      eventName: fallbackName,
      data: raw && typeof raw === 'object' ? raw : {},
    });
    if (wrapped) {
      onEvent(wrapped);
    }
  };

  const onCustomEvent = (event: Event): void => {
    const detail = event instanceof CustomEvent ? event.detail : undefined;
    emitFromRaw(detail, event.type);
  };

  const onMessage = (event: MessageEvent): void => {
    emitFromRaw(event.data);
  };

  window.addEventListener(gokwikAnalyticsEvents.channel, onCustomEvent);
  window.addEventListener(gokwikAnalyticsEvents.orderPlaced, onCustomEvent);
  window.addEventListener('message', onMessage);

  return () => {
    window.removeEventListener(gokwikAnalyticsEvents.channel, onCustomEvent);
    window.removeEventListener(gokwikAnalyticsEvents.orderPlaced, onCustomEvent);
    window.removeEventListener('message', onMessage);
  };
}
