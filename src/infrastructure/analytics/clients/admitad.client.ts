import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { waitForAnalyticsReady } from '@/infrastructure/analytics/load-client-script';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';

function getAdmitadTracking(): typeof window.ADMITAD | undefined {
  if (typeof window === 'undefined' || !window.ADMITAD?.Tracking) {
    return undefined;
  }

  return window.ADMITAD;
}

/**
 * Creates the Admitad TagTag affiliate tracking client.
 *
 * @param campaignCode - Admitad program campaign code (script loaded by AnalyticsScripts).
 */
export function createAdmitadClient(campaignCode: string): AnalyticsVendorClient {
  let ready = false;

  return {
    id: 'admitad',

    isConfigured: () => campaignCode.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      ready = await waitForAnalyticsReady(() => Boolean(window.ADMITAD?.Tracking));
      return ready;
    },

    async track(eventName, properties): Promise<void> {
      const admitad = getAdmitadTracking();
      if (!ready || !admitad?.Tracking) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);

      if (eventName === 'purchase') {
        const orderNumber =
          typeof payload.transaction_id === 'string'
            ? payload.transaction_id
            : typeof payload.order_id === 'string'
              ? payload.order_id
              : undefined;

        if (!orderNumber) {
          return;
        }

        admitad.Invoice = admitad.Invoice ?? {};
        admitad.Invoice.category = '1';
        const referencesOrder = admitad.Tracking.buildReferencesOrder({
          orderNumber,
          orderedItem: [],
        });

        admitad.Invoice.referencesOrder = referencesOrder;

        const firstItem = referencesOrder[0];
        if (firstItem && payload.value !== undefined) {
          firstItem.price = String(payload.value);
        }

        if (firstItem && typeof payload.currency === 'string') {
          firstItem.currency = payload.currency;
        }

        admitad.Tracking.processPositions();
        return;
      }

      if (eventName === 'lead') {
        admitad.Invoice = admitad.Invoice ?? {};
        admitad.Invoice.category = '2';
        admitad.Tracking.processPositions();
      }
    },
  };
}
