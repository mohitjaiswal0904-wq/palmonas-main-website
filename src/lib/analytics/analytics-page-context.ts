import type { AnalyticsPageContext } from '@/config/analytics/analytics.config';

let pageContext: AnalyticsPageContext = {};

/**
 * Returns the current page analytics context set by dynamic route sync components.
 */
export function getAnalyticsPageContext(): AnalyticsPageContext {
  return pageContext;
}

/**
 * Sets page analytics context for collection/product pages.
 *
 * @param context - Page metadata to attach to analytics events.
 */
export function setAnalyticsPageContext(context: AnalyticsPageContext): void {
  pageContext = context;
}

/** Clears page analytics context on route unmount. */
export function clearAnalyticsPageContext(): void {
  pageContext = {};
}
