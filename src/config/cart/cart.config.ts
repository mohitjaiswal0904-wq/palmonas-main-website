import rawConfig from '@/config/cart/cart.config.json';
import { cartTokens } from '@/config/theme/cart.tokens';
import {
  CHECKOUT_UTM_SOURCE_PREFIX,
  getStoredLandingUtmParams,
  resolveOriginalUtmSource,
  toCheckoutUtmSource,
} from '@/lib/cart/checkout-utm-storage';
import {
  formatProductCartLineLabel,
  formatVariantLabel,
  getVariantDisplayLines,
  type VariantDisplayLine,
} from '@/lib/cart/variant-display';

export {
  formatProductCartLineLabel,
  formatVariantLabel,
  getVariantDisplayLines,
  type VariantDisplayLine,
};

export type CartConfig = typeof rawConfig;

export const cartConfig = rawConfig as CartConfig;

/** localStorage key for the last guest cart snapshot. */
export const GUEST_CART_STORAGE_KEY = cartConfig.constants.guestCartStorageKey;

/** localStorage key for persisted header cart/wishlist badge counts. */
export const CART_STATS_STORAGE_KEY = cartConfig.constants.cartStatsStorageKey;

/** localStorage key for landing-page UTM params replayed at cart checkout. */
export const LANDING_UTM_STORAGE_KEY = cartConfig.constants.landingUtmStorageKey;

/** Localization-ready user-facing copy for the cart feature. */
export const cartMessages = cartConfig.messages;

/** Cart UI color tokens from global theme config. */
export const cartTheme = cartTokens;

/** Static payment logos beside checkout CTA (Figma 3802:53794). */
export const cartCheckoutPaymentLogos = cartConfig.checkoutPaymentLogos;

export const CART_CACHE_MS = cartConfig.cartCacheMs;

export const CART_STATS_THROTTLE_MS = cartConfig.statsThrottleMs;

export const CART_STATS_SYNC_DEBOUNCE_MS = cartConfig.statsSyncDebounceMs;

export const CART_FOCUS_REFRESH_MS = cartConfig.cartFocusRefreshMs;

/**
 * Formats the cart header item-count suffix, e.g. `(3 items)`.
 *
 * @param count - Total units in the cart.
 * @returns Localised parenthetical count label.
 */
export function formatCartHeaderItemCount(count: number): string {
  const template = count === 1 ? cartMessages.itemCountOne : cartMessages.itemCount;
  return template.replace('{count}', String(count));
}

/**
 * Formats the "includes N free" subtitle for clubbed cart rows.
 *
 * @param count - Number of free units in the clubbed line.
 * @returns Localised subtitle string.
 */
export function formatIncludesFreeQuantity(count: number): string {
  return cartMessages.includesFreeQuantity.replace('{count}', String(count));
}

/**
 * Formats an applied line-discount badge (Figma “Flat 40% Off Applied”).
 *
 * @param title - Human title or coupon code.
 * @param percent - Optional percent-off to use the Flat N% template.
 * @returns Localised applied-discount label, or empty when title is blank.
 */
export function formatLineDiscountAppliedLabel(title: string, percent?: number): string {
  if (percent != null && percent > 0 && percent <= 100) {
    return cartMessages.lineDiscountPercentApplied.replace(
      '{percent}',
      String(Math.round(percent)),
    );
  }

  const trimmed = title.trim();
  if (!trimmed) {
    return '';
  }
  if (/\bapplied\b/i.test(trimmed)) {
    return trimmed;
  }
  return cartMessages.lineDiscountApplied.replace('{title}', trimmed);
}

/**
 * Formats the visible quantity label for free cart lines.
 *
 * @param count - Number of free units on the line.
 * @returns Localised quantity label.
 */
export function formatFreeItemQuantity(count: number): string {
  return cartMessages.freeQuantityLabel.replace('{count}', String(count));
}

/**
 * Formats the accessible quantity label for free cart lines.
 *
 * @param count - Number of free units on the line.
 * @returns Screen-reader quantity label.
 */
export function formatFreeItemQuantityA11y(count: number): string {
  return cartMessages.a11y.freeItemQuantity.replace('{count}', String(count));
}

/**
 * Formats the sticky PDP add-to-cart label, including in-cart quantity.
 *
 * @param quantity - Units of this product already in the cart.
 * @returns Add-to-cart copy, with a count when the product is in cart.
 */
export function formatStickyAddToCartLabel(quantity: number): string {
  if (quantity <= 0) {
    return cartMessages.addToCart;
  }
  return cartMessages.addToCartInCart.replace('{count}', String(quantity));
}

/**
 * Formats the sticky PDP add-to-cart accessible name.
 *
 * @param quantity - Units of this product already in the cart.
 * @returns Screen-reader add-to-cart label.
 */
export function formatStickyAddToCartA11y(quantity: number): string {
  if (quantity <= 0) {
    return cartMessages.a11y.addToCart;
  }
  return cartMessages.a11y.addToCartInCart.replace('{count}', String(quantity));
}

/**
 * Formats the quantity suffix on a remove-variant row.
 *
 * @param count - Units on that cart line.
 * @returns Localised quantity label.
 */
export function formatRemoveVariantQty(count: number): string {
  return cartMessages.removeVariantQty.replace('{count}', String(count));
}

/**
 * Formats the accessible label for a remove-variant row.
 *
 * @param label - Variant display name.
 * @param count - Units on that cart line.
 * @returns Screen-reader remove label.
 */
export function formatRemoveVariantA11y(label: string, count: number): string {
  return cartMessages.a11y.removeVariant
    .replace('{label}', label)
    .replace('{count}', String(count));
}

/**
 * Returns whether a cart sub-feature flag is enabled in config.
 *
 * @param feature - Feature key from `cart.config.json` features block.
 * @returns True when the feature is enabled.
 */
export function isCartFeatureEnabled(feature: keyof CartConfig['features']): boolean {
  return cartConfig.features[feature]?.enabled === true;
}

/**
 * Returns whether GoKwik checkout adapter is enabled (vs stub toast).
 *
 * @returns True when real checkout SDK should open.
 */
export function isCheckoutEnabled(): boolean {
  return cartConfig.checkout.enabled === true;
}

/** Checkout provider selected in cart config. */
export type CheckoutProviderId = CartConfig['checkout']['provider'];

/**
 * Returns configured checkout provider (`gokwik` or `shopify`).
 *
 * @returns Provider id from `cart.config.json`.
 */
export function getCheckoutProvider(): CheckoutProviderId {
  return cartConfig.checkout.provider;
}

/**
 * Returns whether Shopify `checkoutUrl` redirect is allowed when GoKwik fails.
 *
 * @returns True when auto-fallback is enabled.
 */
export function isShopifyCheckoutFallbackEnabled(): boolean {
  return cartConfig.checkout.shopifyFallback === true;
}

/** Default checkout utm_source when no landing attribution exists. */
export const CHECKOUT_UTM_SOURCE = CHECKOUT_UTM_SOURCE_PREFIX;

/**
 * Resolves checkout UTM params with config defaults and optional landing UTMs.
 * `utm_source` is always `new_website` or `new_website_{original}` for GoKwik.
 *
 * @param overrides - Optional per-call UTM overrides.
 * @param source - Checkout entry point; cart also merges stored landing UTMs.
 */
export function getCheckoutUtmParams(
  overrides?: Record<string, string>,
  source: 'cart' | 'buy_now' = 'buy_now',
): Record<string, string> {
  const storedLandingUtms = getStoredLandingUtmParams();
  const merged = {
    ...cartConfig.checkout.utmParams,
    ...(source === 'cart' ? storedLandingUtms : {}),
    ...overrides,
  };

  const originalSource =
    resolveOriginalUtmSource(overrides?.utm_source) ??
    resolveOriginalUtmSource(storedLandingUtms.utm_source);

  return {
    ...merged,
    utm_source: toCheckoutUtmSource(originalSource),
  };
}

/**
 * Returns UTM params for cart checkout with stored landing UTMs.
 */
export function getCartCheckoutUtmParams(
  overrides?: Record<string, string>,
): Record<string, string> {
  return getCheckoutUtmParams(overrides, 'cart');
}
