import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { AnalyticsPropertyValue } from '@/types/analytics';

/**
 * Sends one Google event for GTM and standalone GA4.
 *
 * Always `dataLayer.push({ event, ... })` so GTM Custom Event triggers work
 * (Google Ads conversion tags). Also calls `gtag('event', …)` when available so
 * standalone GA4 and other gtag listeners keep receiving the same events.
 *
 * @param eventName - Event name for GTM triggers and gtag.
 * @param properties - Event parameters (value, currency, transaction_id, …).
 */
export function pushGoogleDataLayerEvent(
  eventName: string,
  properties: Record<string, AnalyticsPropertyValue>,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...properties });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties);
  }
}
