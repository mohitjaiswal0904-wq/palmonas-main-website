import type { AnalyticsPropertyValue } from '@/types/analytics';

/** Internal transform flag — stripped before events reach vendor SDKs. */
export const META_STANDARD_PROPERTY = '__metaStandard';

/**
 * Removes null/undefined properties so vendor SDKs receive clean payloads.
 *
 * @param properties - Raw event properties from callers.
 */
export function sanitizeAnalyticsProperties(
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
 * Removes internal analytics transform flags from a provider payload.
 *
 * @param properties - Transformed provider event properties.
 */
export function stripInternalAnalyticsProperties(
  properties: Record<string, AnalyticsPropertyValue>,
): Record<string, AnalyticsPropertyValue> {
  const payload = { ...properties };
  delete payload[META_STANDARD_PROPERTY];
  return payload;
}

/**
 * Returns true when Meta Pixel should receive a standard (non-custom) event.
 *
 * @param properties - Transformed provider event properties.
 */
export function isMetaStandardAnalyticsEvent(
  properties: Record<string, AnalyticsPropertyValue>,
): boolean {
  return properties[META_STANDARD_PROPERTY] === true;
}
