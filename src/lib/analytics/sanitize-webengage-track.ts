import type { AnalyticsPropertyValue } from '@/types/analytics';

const WEBENGAGE_MAX_NAME_LENGTH = 50;
const WEBENGAGE_MAX_STRING_LENGTH = 1000;

const WEBENGAGE_EVENT_PROPERTY_LABELS: Record<string, string> = {
  product_id: 'Product ID',
  product_name: 'Product Name',
  variant_id: 'Variant ID',
  variant_name: 'Variant Name',
  price: 'Price',
  quantity: 'Quantity',
  currency: 'Currency',
  category: 'Category',
  cart_value: 'Cart Value',
  order_id: 'Order ID',
  total_amount: 'Total Amount',
};

/**
 * Truncates a WebEngage custom event name to the documented limit.
 *
 * @param eventName - Provider-mapped event name.
 * @returns Sanitized event name for `webengage.track`.
 */
export function sanitizeWebEngageEventName(eventName: string): string {
  return eventName.trim().slice(0, WEBENGAGE_MAX_NAME_LENGTH);
}

/**
 * Sanitizes event attributes before `webengage.track` per WebEngage guidelines.
 *
 * @param properties - Transformed provider event properties.
 * @returns Payload safe for WebEngage custom events.
 */
export function sanitizeWebEngageTrackProperties(
  properties: Record<string, AnalyticsPropertyValue>,
): Record<string, AnalyticsPropertyValue> {
  const sanitized: Record<string, AnalyticsPropertyValue> = {};

  for (const [rawKey, rawValue] of Object.entries(properties)) {
    if (rawValue === null || rawValue === undefined) {
      continue;
    }

    const key = rawKey.trim().slice(0, WEBENGAGE_MAX_NAME_LENGTH);
    const mappedKey = WEBENGAGE_EVENT_PROPERTY_LABELS[key] ?? key;

    if (!key || key.toLowerCase().startsWith('we_')) {
      continue;
    }

    const outputKey = mappedKey.slice(0, WEBENGAGE_MAX_NAME_LENGTH);

    if (typeof rawValue === 'string') {
      sanitized[outputKey] = rawValue.slice(0, WEBENGAGE_MAX_STRING_LENGTH);
      continue;
    }

    if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      sanitized[outputKey] = rawValue;
    }
  }

  return sanitized;
}

/**
 * Builds the final WebEngage `track` payload from event name + properties.
 *
 * @param eventName - Provider-mapped event name.
 * @param properties - Transformed event properties.
 */
export function buildWebEngageTrackPayload(
  eventName: string,
  properties: Record<string, AnalyticsPropertyValue>,
): { eventName: string; properties: Record<string, AnalyticsPropertyValue> } {
  return {
    eventName: sanitizeWebEngageEventName(eventName),
    properties: sanitizeWebEngageTrackProperties(properties),
  };
}

export const webengageTrackLimits = {
  maxNameLength: WEBENGAGE_MAX_NAME_LENGTH,
  maxStringLength: WEBENGAGE_MAX_STRING_LENGTH,
} as const;
