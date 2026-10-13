import {
  analyticsPagePropertyKeys,
  type AnalyticsPageContext,
} from '@/config/analytics/analytics.config';
import { getAnalyticsPageContext } from '@/lib/analytics/analytics-page-context';
import type { AnalyticsPropertyValue } from '@/types/analytics';

/**
 * Parses collection/product handles from a pathname when SSR context is unavailable.
 *
 * @param pathname - Current App Router pathname.
 * @returns Partial page context derived from the URL.
 */
export function parsePathnameAnalyticsContext(pathname: string): AnalyticsPageContext {
  const collectionMatch = pathname.match(/^\/collections\/([^/?#]+)/);

  if (collectionMatch?.[1]) {
    return {
      pageType: 'collection',
      collectionHandle: decodeURIComponent(collectionMatch[1]),
    };
  }

  const productMatch = pathname.match(/^\/products\/([^/?#]+)/);

  if (productMatch?.[1]) {
    return {
      pageType: 'product',
      productHandle: decodeURIComponent(productMatch[1]),
    };
  }

  if (pathname === '/search') {
    return { pageType: 'search' };
  }

  return {};
}

/**
 * Merges URL-derived and in-memory page context for analytics payloads.
 *
 * @param pathname - Current pathname.
 * @returns Resolved page context with SSR names when available.
 */
export function resolveAnalyticsPageContext(pathname: string): AnalyticsPageContext {
  return {
    ...parsePathnameAnalyticsContext(pathname),
    ...getAnalyticsPageContext(),
  };
}

/**
 * Maps page context to flat analytics event properties.
 *
 * @param context - Resolved collection/product page context.
 * @returns Sanitized property map for event payloads.
 */
export function buildAnalyticsPageProperties(
  context: AnalyticsPageContext,
): Record<string, AnalyticsPropertyValue> {
  const properties: Record<string, AnalyticsPropertyValue> = {};

  if (context.pageType) {
    properties[analyticsPagePropertyKeys.pageType] = context.pageType;
  }

  if (context.collectionName) {
    properties[analyticsPagePropertyKeys.collectionName] = context.collectionName;
  }

  if (context.collectionHandle) {
    properties[analyticsPagePropertyKeys.collectionHandle] = context.collectionHandle;
  }

  if (context.productName) {
    properties[analyticsPagePropertyKeys.productName] = context.productName;
  }

  if (context.productHandle) {
    properties[analyticsPagePropertyKeys.productHandle] = context.productHandle;
  }

  return properties;
}
