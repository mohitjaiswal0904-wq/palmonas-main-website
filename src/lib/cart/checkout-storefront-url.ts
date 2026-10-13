import { env } from '@/lib/env';

/**
 * Returns the public storefront origin for this deploy (no trailing slash).
 */
export function getCheckoutStorefrontOrigin(): string {
  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
}

/**
 * Returns true when the hostname is a Shopify shop domain, not the hosted storefront.
 *
 * @param hostname - URL hostname.
 */
function isMyshopifyHost(hostname: string): boolean {
  return hostname.toLowerCase().endsWith('.myshopify.com');
}

/**
 * Resolves the storefront URL GoKwik should record as `full_url`.
 * Uses the live hosted origin (`window.location`); myshopify is rewritten to this deploy's app URL.
 *
 * @param currentHref - Page href to rewrite; defaults to `window.location.href`.
 * @returns Absolute storefront URL.
 */
export function resolveCheckoutFullUrl(currentHref?: string): string {
  const appOrigin = getCheckoutStorefrontOrigin();
  const href =
    currentHref ?? (typeof window !== 'undefined' ? window.location.href : `${appOrigin}/`);

  try {
    const current = new URL(href);
    if (isMyshopifyHost(current.hostname)) {
      return `${appOrigin}${current.pathname}${current.search}${current.hash}`;
    }

    return current.href;
  } catch {
    return `${appOrigin}/`;
  }
}
