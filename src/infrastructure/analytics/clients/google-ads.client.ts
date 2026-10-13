import '@/infrastructure/analytics/analytics-globals.d.ts';

import { resolveGoogleAdsConversionSendTo } from '@/config/analytics/analytics.config';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { waitForAnalyticsReady } from '@/infrastructure/analytics/load-client-script';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';
import type { AnalyticsPropertyValue } from '@/types/analytics';

export interface GoogleAdsClientConfig {
  conversionId: string;
  /** Optional env override for purchase `send_to`. */
  purchaseSendTo?: string;
}

/**
 * Builds gtag conversion params for a Google Ads `send_to` label.
 *
 * @param sendTo - Full AW conversion label.
 * @param properties - Sanitized event properties.
 */
function buildConversionParams(
  sendTo: string,
  properties: Record<string, AnalyticsPropertyValue>,
): Record<string, AnalyticsPropertyValue> {
  const params: Record<string, AnalyticsPropertyValue> = { send_to: sendTo };

  if (typeof properties.value === 'number' || typeof properties.value === 'string') {
    params.value = properties.value;
  }

  if (typeof properties.currency === 'string') {
    params.currency = properties.currency;
  }

  if (typeof properties.transaction_id === 'string' && properties.transaction_id.length > 0) {
    params.transaction_id = properties.transaction_id;
  }

  // Match Shopify Google Ads page_view conversion payload (`page_path=/…`).
  if (typeof properties.path === 'string' && properties.path.length > 0) {
    params.page_path = properties.path;
  }

  return params;
}

/**
 * Creates a Google Ads client that fires Shopping App conversion hits via gtag.
 *
 * Also keeps `dataLayer` events (via GA4) for GTM. Conversion labels come from
 * `analytics.config.json` → `googleAdsConversions`.
 *
 * @param config - Google Ads conversion id (+ optional purchase override).
 */
export function createGoogleAdsClient(config: GoogleAdsClientConfig): AnalyticsVendorClient {
  const { conversionId, purchaseSendTo } = config;
  let ready = false;

  return {
    id: 'googleAds',

    isConfigured: () => conversionId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      ready = await waitForAnalyticsReady(() => typeof window.gtag === 'function');

      if (ready && typeof window.gtag === 'function') {
        window.gtag('config', conversionId, { send_page_view: false });
      }

      return ready;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready || typeof window.gtag !== 'function') {
        return;
      }

      const sendTo = resolveGoogleAdsConversionSendTo(eventName, purchaseSendTo);
      if (!sendTo) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      window.gtag('event', 'conversion', buildConversionParams(sendTo, payload));
    },
  };
}
