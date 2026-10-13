import '@/infrastructure/gokwik/types';

import { cartConfig, cartMessages, getCheckoutUtmParams } from '@/config/cart/cart.config';
import { syncGokwikCheckoutIdentity } from '@/infrastructure/gokwik/checkout-identity';
import {
  applyCheckoutMerchantInfo,
  applyCheckoutMerchantInfo as applyGokwikCheckoutMerchantInfo,
  buildCheckoutMerchantInfo,
  buildCheckoutMerchantInfo as buildGokwikCheckoutMerchantInfo,
  getCheckoutMerchantInfoInlineScript,
  getCheckoutMerchantInfoInlineScript as getGokwikCheckoutMerchantInfoInlineScript,
} from '@/infrastructure/gokwik/merchant-info';
import { getStoredAuthUser } from '@/lib/auth/auth.client';
import { resolveCheckoutFullUrl } from '@/lib/cart/checkout-storefront-url';
import {
  applyUtmParamsToPageUrl,
  persistCheckoutUtmCookies,
  toGokwikUtmQueryString,
} from '@/lib/cart/checkout-utm-storage';
import { getKwikpassBaseUrl } from '@/lib/env';
import { normalizeCartIdForGokwikCheckout } from '@/types/cart';
import type {
  CheckoutOpenParams,
  CheckoutProviderPort,
} from '@/types/checkout/checkout-provider.port';

export const GOKWIK_CHECKOUT_SCRIPT_ID = 'gokwik-checkout-integration';

/** sessionStorage key for checkout entry point (`cart` | `buy_now`). */
export const CHECKOUT_SOURCE_STORAGE_KEY = 'palmonas_checkout_source';

/** sessionStorage key for cart id used when checkout opened. */
export const CHECKOUT_CART_ID_STORAGE_KEY = 'palmonas_checkout_cart_id';

const DEFAULT_READY_TIMEOUT_MS = 20_000;

function persistCheckoutSession(params: CheckoutOpenParams): void {
  try {
    sessionStorage.setItem(CHECKOUT_SOURCE_STORAGE_KEY, params.source);
    sessionStorage.setItem(CHECKOUT_CART_ID_STORAGE_KEY, params.cartId);
  } catch {
    // sessionStorage may be unavailable in private mode or SSR guards.
  }
}

/** Clears checkout session keys after order success or abandonment. */
export function clearCheckoutSession(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_SOURCE_STORAGE_KEY);
    sessionStorage.removeItem(CHECKOUT_CART_ID_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * URL for GoKwik merchant integration script (custom storefront checkout).
 */
export function getGokwikCheckoutScriptUrl(): string {
  const baseUrl = getKwikpassBaseUrl().replace(/\/$/, '');
  const version = cartConfig.checkout.scriptVersion ?? 'v4';
  return `${baseUrl}/merchant-integration/build/merchant.integration.js?${version}`;
}

export {
  applyCheckoutMerchantInfo,
  applyGokwikCheckoutMerchantInfo,
  buildCheckoutMerchantInfo,
  buildGokwikCheckoutMerchantInfo,
  getCheckoutMerchantInfoInlineScript,
  getGokwikCheckoutMerchantInfoInlineScript,
};

/**
 * Maps checkout UTMs into the merchantInfo shapes GoKwik reads (nested, snake, camel).
 *
 * @param utmParams - Resolved checkout UTM map.
 */
function toGokwikUtmMerchantFields(utmParams: Record<string, string>): Record<string, unknown> {
  const fullUrl = resolveCheckoutFullUrl();
  const utmDetails = toGokwikUtmQueryString(utmParams);
  const noteAttributes = [
    ...Object.entries(utmParams)
      .filter(([, value]) => Boolean(value))
      .map(([name, value]) => ({ name, value })),
    { name: 'full_url', value: fullUrl },
  ];

  return {
    utmParams,
    ...utmParams,
    utm_details: utmDetails,
    note_attributes: noteAttributes,
    full_url: fullUrl,
    fullUrl,
    url: fullUrl,
    returnUrl: fullUrl,
    ...(utmParams.utm_source ? { utmSource: utmParams.utm_source } : {}),
    ...(utmParams.utm_medium ? { utmMedium: utmParams.utm_medium } : {}),
    ...(utmParams.utm_campaign ? { utmCampaign: utmParams.utm_campaign } : {}),
  };
}

function resolveCheckoutUtmEntrySource(): 'cart' | 'buy_now' {
  if (typeof window === 'undefined') {
    return 'buy_now';
  }

  return window.location.pathname.includes('/cart') ? 'cart' : 'buy_now';
}

/**
 * Attaches checkout UTMs to merchantInfo before GoKwik SDK init.
 *
 * @param source - Checkout entry point used to resolve landing vs default UTMs.
 */
export function applyCheckoutUtmToMerchantInfo(
  source: 'cart' | 'buy_now' = resolveCheckoutUtmEntrySource(),
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const utmParams = getCheckoutUtmParams(undefined, source);
  persistCheckoutUtmCookies(utmParams);
  window.merchantInfo = {
    ...(window.merchantInfo ?? {}),
    ...toGokwikUtmMerchantFields(utmParams),
  };
}

/**
 * Returns true when GoKwik checkout SDK globals are callable.
 */
export function isGokwikCheckoutReady(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    typeof window.gokwikSdk?.initCheckout === 'function' &&
    typeof window.triggerGokwikCustomCheckout === 'function',
  );
}

/**
 * Polls until GoKwik checkout SDK is available on window.
 */
export function waitForGokwikCheckoutSdk(maxMs = DEFAULT_READY_TIMEOUT_MS): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tick = (): void => {
      if (isGokwikCheckoutReady()) {
        applyCheckoutMerchantInfo();
        applyCheckoutUtmToMerchantInfo();
        window.gokwikSdk?.init?.();
        resolve(true);
        return;
      }
      if (Date.now() - startedAt >= maxMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, 50);
    };

    tick();
  });
}

/**
 * Injects GoKwik merchant integration script when not already present.
 */
export function loadGokwikCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  applyCheckoutMerchantInfo();
  applyCheckoutUtmToMerchantInfo();

  if (isGokwikCheckoutReady()) {
    return Promise.resolve();
  }

  const existing = document.getElementById(GOKWIK_CHECKOUT_SCRIPT_ID);
  if (existing) {
    return waitForGokwikCheckoutSdk().then((ready) => {
      if (!ready) throw new Error('sdk_timeout');
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOKWIK_CHECKOUT_SCRIPT_ID;
    script.src = getGokwikCheckoutScriptUrl();
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new Error('sdk_timeout'));
    }, DEFAULT_READY_TIMEOUT_MS);

    script.onload = () => {
      window.clearTimeout(timeoutId);
      void waitForGokwikCheckoutSdk().then((ready) => {
        if (ready) resolve();
        else reject(new Error('sdk_timeout'));
      });
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('script_load_error'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Ensures merchantInfo is set and the GoKwik integration script has loaded.
 */
export async function ensureGokwikCheckoutReady(): Promise<boolean> {
  applyCheckoutMerchantInfo();
  applyCheckoutUtmToMerchantInfo();

  if (isGokwikCheckoutReady()) {
    return true;
  }

  const existing = document.getElementById(GOKWIK_CHECKOUT_SCRIPT_ID);
  if (!existing) {
    try {
      await loadGokwikCheckoutScript();
      if (isGokwikCheckoutReady()) {
        return true;
      }
    } catch {
      // Script injection failed — fall through to SDK poll.
    }
  }

  return waitForGokwikCheckoutSdk();
}

/**
 * Assigns cart id and UTM params on window.merchantInfo for checkout.
 * Scenario 2 / gokwik_chekout: merge `cart` onto existing merchantInfo.
 * The buy-now `?key=` query is stripped — GoKwik derives `cart_token` from this id and
 * rejects the cart when the key is appended to the token.
 * UTM keys are set both nested (`utmParams`) and flat — GoKwik reads either shape.
 */
export function assignGokwikCheckoutCart(
  cartId: string,
  utmParams?: Record<string, string>,
  source: 'cart' | 'buy_now' = 'buy_now',
): void {
  if (typeof window === 'undefined') return;

  const resolvedUtm = getCheckoutUtmParams(utmParams, source);
  persistCheckoutUtmCookies(resolvedUtm);

  window.merchantInfo = {
    ...(window.merchantInfo ?? {}),
    cart: { id: normalizeCartIdForGokwikCheckout(cartId) },
    ...toGokwikUtmMerchantFields(resolvedUtm),
  };
}

/**
 * Pushes the latest merchantInfo (cart + UTMs) into the GoKwik SDK before checkout opens.
 */
export function syncGokwikCheckoutSession(): void {
  if (typeof window === 'undefined') return;

  if (typeof window.gokwikSdk?.initCheckout === 'function' && window.merchantInfo) {
    window.gokwikSdk.init?.();
    window.gokwikSdk.initCheckout(window.merchantInfo);
  }
}

/** GoKwik custom storefront checkout adapter. */
export const gokwikCheckoutAdapter: CheckoutProviderPort = {
  async openCheckout(params: CheckoutOpenParams): Promise<void> {
    if (typeof window === 'undefined') return;

    const ready = await ensureGokwikCheckoutReady();
    if (!ready || typeof window.triggerGokwikCustomCheckout !== 'function') {
      throw new Error(cartMessages.errors.checkoutSdkNotReady);
    }

    // Page URL + cookies first so merchantInfo `full_url` matches the storefront href GoKwik reads.
    const resolvedUtm = getCheckoutUtmParams(params.utmParams, params.source);
    applyUtmParamsToPageUrl(resolvedUtm);
    persistCheckoutUtmCookies(resolvedUtm);
    assignGokwikCheckoutCart(params.cartId, params.utmParams, params.source);
    syncGokwikCheckoutSession();
    persistCheckoutSession(params);

    const user = getStoredAuthUser();
    if (user && !user.isGuest && user.phoneNumber) {
      syncGokwikCheckoutIdentity({ phone: user.phoneNumber, email: user.email });
    }

    window.triggerGokwikCustomCheckout();
  },
};

export {};
