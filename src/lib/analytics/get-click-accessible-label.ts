import { analyticsDataAttributes } from '@/config/analytics/analytics.config';
import { truncateAnalyticsLabel } from '@/lib/analytics/parse-analytics-data-props';

/**
 * Resolves a human-readable label for a clicked element.
 *
 * @param element - Trackable DOM element.
 * @returns Label from analytics attrs, ARIA, value, or visible text.
 */
export function getClickAccessibleLabel(element: HTMLElement): string {
  const analyticsName = element.getAttribute(analyticsDataAttributes.name)?.trim();
  if (analyticsName) {
    return truncateAnalyticsLabel(analyticsName);
  }

  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) {
    return truncateAnalyticsLabel(ariaLabel);
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelText = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .filter(Boolean)
      .join(' ');

    if (labelText) {
      return truncateAnalyticsLabel(labelText);
    }
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLButtonElement) {
    const value = element.value?.trim();
    if (value) {
      return truncateAnalyticsLabel(value);
    }
  }

  const text = element.textContent?.trim();
  if (text) {
    return truncateAnalyticsLabel(text);
  }

  return element.tagName.toLowerCase();
}
