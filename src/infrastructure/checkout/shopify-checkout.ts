import { cartMessages } from '@/config/cart/cart.config';
import type { CheckoutOpenParams } from '@/types/checkout/checkout-provider.port';

/**
 * Validates Shopify checkout URL is absolute HTTPS (rejects javascript:/data:/relative).
 *
 * @param checkoutUrl - Candidate redirect URL from cart API.
 * @returns Parsed URL when safe.
 * @throws Error when URL is missing or unsafe.
 */
export function assertSafeShopifyCheckoutUrl(checkoutUrl: string | undefined): URL {
  const raw = checkoutUrl?.trim();
  if (!raw) {
    throw new Error(cartMessages.errors.checkoutUrlMissing);
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(cartMessages.errors.checkoutUrlMissing);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(cartMessages.errors.checkoutUrlMissing);
  }

  return parsed;
}

/**
 * Merges UTM query params, always replacing checkout attribution source.
 *
 * @param checkoutUrl - Base Shopify checkout URL.
 * @param utmParams - Optional UTM map from cart config.
 * @returns URL string with merged query params.
 */
export function withCheckoutUtmParams(
  checkoutUrl: string,
  utmParams?: Record<string, string>,
): string {
  const url = assertSafeShopifyCheckoutUrl(checkoutUrl);
  if (utmParams) {
    for (const [key, value] of Object.entries(utmParams)) {
      if (value && (key === 'utm_source' || !url.searchParams.has(key))) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

export type ShopifyCheckoutRedirectDeps = {
  /** Toast before navigation. */
  onToast?: (message: string) => void;
  /** Navigation hook for tests. */
  assign?: (url: string) => void;
};

/**
 * Toasts then redirects the browser to Shopify hosted checkout.
 *
 * @param params - Checkout open params including `checkoutUrl`.
 * @param deps - Optional toast and assign overrides.
 * @throws Error when `checkoutUrl` is missing or unsafe.
 */
export async function openShopifyCheckout(
  params: Pick<CheckoutOpenParams, 'checkoutUrl' | 'utmParams'>,
  deps: ShopifyCheckoutRedirectDeps = {},
): Promise<void> {
  const href = withCheckoutUtmParams(params.checkoutUrl ?? '', params.utmParams);
  deps.onToast?.(cartMessages.toasts.openingShopifyCheckout);

  const assign =
    deps.assign ??
    ((url: string) => {
      window.location.assign(url);
    });

  assign(href);
}
