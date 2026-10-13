import {
  cartMessages,
  getCheckoutProvider,
  getCheckoutUtmParams,
  isCheckoutEnabled,
  isShopifyCheckoutFallbackEnabled,
} from '@/config/cart/cart.config';
import { openShopifyCheckout } from '@/infrastructure/checkout/shopify-checkout';
import { gokwikCheckoutAdapter } from '@/infrastructure/gokwik/checkout';
import { trackCheckoutStarted, trackPaymentInitiated } from '@/lib/analytics/analytics-trackers';
import type {
  CheckoutOpenParams,
  CheckoutProviderPort,
} from '@/types/checkout/checkout-provider.port';

let toastHandler: ((message: string) => void) | null = null;

/**
 * Registers app toast handler for checkout messages.
 */
export function registerCheckoutToast(handler: (message: string) => void): void {
  toastHandler = handler;
}

/** GoKwik checkout stub — shows coming-soon toast when checkout is disabled in config. */
export const gokwikCheckoutStub: CheckoutProviderPort = {
  async openCheckout(params: CheckoutOpenParams): Promise<void> {
    const message =
      params.source === 'buy_now'
        ? cartMessages.checkout.buyNowComingSoon
        : cartMessages.checkout.comingSoon;
    toastHandler?.(message);
    if (typeof window !== 'undefined' && !toastHandler) {
      console.info('[checkout stub]', message, params);
    }
  },
};

/**
 * Opens Shopify checkout with registered toast handler.
 *
 * @param params - Open params including checkoutUrl.
 */
async function redirectToShopifyCheckout(params: CheckoutOpenParams): Promise<void> {
  await openShopifyCheckout(params, {
    onToast: (message) => toastHandler?.(message),
  });
}

const gokwikCheckoutAdapterWithToast: CheckoutProviderPort = {
  async openCheckout(params: CheckoutOpenParams): Promise<void> {
    try {
      await gokwikCheckoutAdapter.openCheckout(params);
    } catch (err) {
      if (isShopifyCheckoutFallbackEnabled()) {
        try {
          await redirectToShopifyCheckout(params);
          return;
        } catch {
          // Fall through to original GoKwik error when Shopify URL also unusable.
        }
      }

      const message = err instanceof Error ? err.message : cartMessages.errors.checkoutSdkNotReady;
      toastHandler?.(message);
      throw err;
    }
  },
};

const shopifyCheckoutAdapter: CheckoutProviderPort = {
  async openCheckout(params: CheckoutOpenParams): Promise<void> {
    try {
      await redirectToShopifyCheckout(params);
    } catch (err) {
      const message = err instanceof Error ? err.message : cartMessages.errors.checkoutUrlMissing;
      toastHandler?.(message);
      throw err;
    }
  },
};

/**
 * Resolves active checkout provider from cart config flags.
 *
 * @returns Stub, Shopify redirect, or GoKwik (with optional Shopify fallback).
 */
function resolveCheckoutProvider(): CheckoutProviderPort {
  if (!isCheckoutEnabled()) {
    return gokwikCheckoutStub;
  }

  if (getCheckoutProvider() === 'shopify') {
    return shopifyCheckoutAdapter;
  }

  return gokwikCheckoutAdapterWithToast;
}

/** Checkout facade — import this, not vendor subfolders directly. */
export const checkoutProvider: CheckoutProviderPort = {
  async openCheckout(params: CheckoutOpenParams): Promise<void> {
    const resolved: CheckoutOpenParams = {
      ...params,
      utmParams: getCheckoutUtmParams(params.utmParams, params.source),
    };

    // Google Ads Begin Checkout + Add Payment Info (GoKwik hosts the payment step).
    trackCheckoutStarted(
      {
        items_count: 0,
        entry_point: resolved.source,
      },
      { value: 1, currency: 'INR' },
    );
    trackPaymentInitiated(
      {
        amount: 1,
        payment_method: 'gokwik',
        currency: 'INR',
      },
      { value: 1, currency: 'INR' },
    );

    return resolveCheckoutProvider().openCheckout(resolved);
  },
};

export {
  assertSafeShopifyCheckoutUrl,
  openShopifyCheckout,
  withCheckoutUtmParams,
} from '@/infrastructure/checkout/shopify-checkout';
export {
  assignGokwikCheckoutCart,
  applyCheckoutUtmToMerchantInfo,
  ensureGokwikCheckoutReady,
  gokwikCheckoutAdapter,
  isGokwikCheckoutReady,
  loadGokwikCheckoutScript,
  waitForGokwikCheckoutSdk,
} from '@/infrastructure/gokwik/checkout';
export {
  applyCheckoutMerchantInfo,
  applyCheckoutMerchantInfo as applyGokwikCheckoutMerchantInfo,
  buildCheckoutMerchantInfo,
  buildCheckoutMerchantInfo as buildGokwikCheckoutMerchantInfo,
  getCheckoutMerchantInfoInlineScript,
  getCheckoutMerchantInfoInlineScript as getGokwikCheckoutMerchantInfoInlineScript,
  getGokwikCheckoutScriptUrl,
} from '@/infrastructure/gokwik/checkout';
export { GokwikCheckout } from '@/infrastructure/gokwik/GokwikCheckout';
export { GokwikCheckoutEvents } from '@/infrastructure/gokwik/GokwikCheckoutEvents';
export {
  clearGokwikCheckoutIdentity,
  normalizePhoneForGokwikCheckout,
  syncGokwikCheckoutIdentity,
} from '@/infrastructure/gokwik/checkout-identity';
export type { GokwikCheckoutIdentity } from '@/infrastructure/gokwik/checkout-identity';
export type {
  CheckoutMerchantInfo,
  GokwikMerchantInfo,
  GokwikSdkInstance,
} from '@/infrastructure/gokwik/types';
