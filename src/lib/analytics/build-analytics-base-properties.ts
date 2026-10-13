import {
  analyticsPagePropertyKeys,
  type AnalyticsPageContext,
} from '@/config/analytics/analytics.config';
import { getAnalyticsAuthContext } from '@/lib/analytics/analytics-auth-context';
import { getAnalyticsPageContext } from '@/lib/analytics/analytics-page-context';
import type { AnalyticsPropertyValue } from '@/types/analytics';

const ANALYTICS_PLATFORM = 'web';

/**
 * Maps in-memory page context to flat analytics property keys.
 *
 * @param context - Collection/product page context from SSR sync.
 */
function pageContextToProperties(
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

/**
 * Builds base analytics properties merged into every tracked event.
 *
 * @param overrides - Event-specific properties; timestamp overrides the default when set.
 * @returns Sanitized base property map including auth and page context.
 */
export function buildAnalyticsEventProperties(
  overrides: Record<string, AnalyticsPropertyValue | undefined> = {},
): Record<string, AnalyticsPropertyValue> {
  const auth = getAnalyticsAuthContext();
  const page = getAnalyticsPageContext();
  const { timestamp: overrideTimestamp, ...eventProperties } = overrides;

  const properties: Record<string, AnalyticsPropertyValue> = {
    timestamp: typeof overrideTimestamp === 'number' ? overrideTimestamp : Date.now(),
    platform: ANALYTICS_PLATFORM,
    ...pageContextToProperties(page),
    ...sanitizeScalarProperties(eventProperties),
  };

  if (auth.userId) {
    properties.user_id = auth.userId;
  }

  // if (auth.sessionId) {
  //   properties.session_id = auth.sessionId;
  // }

  if (auth.isGuest !== undefined) {
    properties.is_guest = auth.isGuest;
  }

  return properties;
}

function sanitizeScalarProperties(
  properties: Record<string, AnalyticsPropertyValue | undefined>,
): Record<string, AnalyticsPropertyValue> {
  const sanitized: Record<string, AnalyticsPropertyValue> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Serializes checkout line items for analytics vendors that only accept scalars.
 *
 * @param products - Product line items from checkout or order payloads.
 */
export function serializeAnalyticsProducts(
  products: Array<{ product_id: string; quantity: number; price: number }>,
): string {
  return JSON.stringify(products);
}
