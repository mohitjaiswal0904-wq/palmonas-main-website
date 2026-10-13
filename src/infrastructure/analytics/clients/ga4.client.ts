import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { waitForAnalyticsReady } from '@/infrastructure/analytics/load-client-script';
import { pushGoogleDataLayerEvent } from '@/lib/analytics/push-google-data-layer-event';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';

/**
 * Creates the GA4 browser client (gtag / dataLayer — one push per event).
 *
 * @param measurementId - GA4 measurement id (G-XXXXXXXX).
 */
export function createGa4Client(measurementId: string): AnalyticsVendorClient {
  let ready = false;

  return {
    id: 'ga4',
    isConfigured: () => measurementId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      ready = await waitForAnalyticsReady(
        () => typeof window.gtag === 'function' || Array.isArray(window.dataLayer),
      );
      return ready;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready) {
        return;
      }

      pushGoogleDataLayerEvent(eventName, stripInternalAnalyticsProperties(properties));
    },
  };
}
