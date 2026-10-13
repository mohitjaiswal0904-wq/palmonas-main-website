import type { CheckoutMerchantInfo, KwikpassMerchantInfo } from '@/infrastructure/gokwik/types';
import { env, getGokwikStoreId } from '@/lib/env';

/**
 * Builds KwikPass login fields for window.merchantInfo (doc fields on base type).
 */
export function buildKwikpassMerchantInfo(): KwikpassMerchantInfo {
  return {
    mid: env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID,
    environment: env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT,
    type: 'merchantInfo',
    integrationType: 'CUSTOM_SHOPIFY',
  };
}

/**
 * Builds GoKwik checkout merchantInfo (Scenario 2: mid, environment, type, storeId, fbPixel).
 */
export function buildCheckoutMerchantInfo(): CheckoutMerchantInfo {
  const storeId = getGokwikStoreId();
  const fbPixel = env.NEXT_PUBLIC_GOKWIK_FB_PIXEL.trim();

  return {
    mid: env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID,
    environment: env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT,
    type: 'merchantInfo',
    ...(storeId !== undefined ? { storeId } : {}),
    ...(fbPixel ? { fbPixel } : {}),
  };
}

/** @deprecated Use buildCheckoutMerchantInfo */
export const buildGokwikCheckoutMerchantInfo = buildCheckoutMerchantInfo;

/**
 * Builds checkout merchantInfo with cart and UTM for open-checkout (no login fields).
 */
export function buildActiveCheckoutMerchantInfo(
  cartId?: string,
  utmParams?: Record<string, string>,
): CheckoutMerchantInfo {
  return {
    ...buildCheckoutMerchantInfo(),
    ...(cartId ? { cart: { id: cartId } } : {}),
    ...(utmParams ? { utmParams } : {}),
  };
}

/**
 * Builds unified merchantInfo (login + checkout + shopDomain) — not used by checkout path.
 */
export function buildUnifiedMerchantInfo(): Record<string, unknown> {
  return {
    ...buildKwikpassMerchantInfo(),
    shopDomain: env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN,
    ...buildCheckoutMerchantInfo(),
  };
}

/** @deprecated Use buildUnifiedMerchantInfo */
export const buildPalmonasGokwikMerchantInfo = buildUnifiedMerchantInfo;

/**
 * Merges checkout fields onto window.merchantInfo before checkout script load.
 */
export function applyCheckoutMerchantInfo(): void {
  if (typeof window === 'undefined') return;

  window.merchantInfo = {
    ...(window.merchantInfo ?? {}),
    ...buildCheckoutMerchantInfo(),
  };
}

/** @deprecated Use applyCheckoutMerchantInfo */
export const applyGokwikCheckoutMerchantInfo = applyCheckoutMerchantInfo;

/**
 * Merges KwikPass login fields onto window.merchantInfo before script load.
 */
export function applyKwikpassMerchantInfo(): void {
  if (typeof window === 'undefined') return;

  window.merchantInfo = {
    ...(window.merchantInfo ?? {}),
    ...buildKwikpassMerchantInfo(),
  };
}

/** @deprecated Use buildUnifiedMerchantInfo only when both surfaces need shared fields */
export function applyPalmonasGokwikMerchantInfo(): void {
  if (typeof window === 'undefined') return;

  window.merchantInfo = {
    ...(window.merchantInfo ?? {}),
    ...buildUnifiedMerchantInfo(),
  };
}

/**
 * Inline script that sets login-only merchantInfo before KwikPass scripts execute.
 */
export function getKwikpassMerchantInfoInlineScript(): string {
  const merchantInfo = JSON.stringify(buildKwikpassMerchantInfo());
  return `window.merchantInfo = { ...(window.merchantInfo || {}), ...${merchantInfo} };`;
}

/**
 * Inline script that merges checkout merchantInfo before checkout script loads.
 */
export function getCheckoutMerchantInfoInlineScript(): string {
  const merchantInfo = JSON.stringify(buildCheckoutMerchantInfo());
  return `window.merchantInfo = { ...(window.merchantInfo || {}), ...${merchantInfo} };`;
}

/** @deprecated Use getCheckoutMerchantInfoInlineScript */
export const getGokwikCheckoutMerchantInfoInlineScript = getCheckoutMerchantInfoInlineScript;

/** @deprecated Unified inline — not used by checkout */
export function getPalmonasGokwikMerchantInfoInlineScript(): string {
  const merchantInfo = JSON.stringify(buildUnifiedMerchantInfo());
  return `window.merchantInfo = { ...(window.merchantInfo || {}), ...${merchantInfo} };`;
}
