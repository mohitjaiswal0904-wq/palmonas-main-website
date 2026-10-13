import { sanitizeAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';
import type { AnalyticsPropertyValue } from '@/types/analytics';

const MAX_LABEL_LENGTH = 120;

/**
 * Parses optional `data-analytics-props` JSON into sanitized event properties.
 *
 * @param raw - Raw attribute value from the DOM.
 * @returns Sanitized properties or an empty object when invalid.
 */
export function parseAnalyticsDataProps(
  raw: string | null | undefined,
): Record<string, AnalyticsPropertyValue> {
  if (!raw?.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return sanitizeAnalyticsProperties(parsed as Record<string, AnalyticsPropertyValue>);
  } catch {
    return {};
  }
}

/**
 * Truncates long labels for analytics payloads.
 *
 * @param value - Raw label text.
 * @returns Trimmed label capped at {@link MAX_LABEL_LENGTH} characters.
 */
export function truncateAnalyticsLabel(value: string): string {
  const trimmed = value.replace(/\s+/g, ' ').trim();

  if (trimmed.length <= MAX_LABEL_LENGTH) {
    return trimmed;
  }

  return `${trimmed.slice(0, MAX_LABEL_LENGTH - 1)}…`;
}
