import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { waitForAnalyticsReady } from '@/infrastructure/analytics/load-client-script';

/**
 * Creates the Simprosys GTM client — loads GTM and pushes ecommerce dataLayer events.
 *
 * @param gtmContainerId - GTM container id from Simprosys import.
 */
export function createSimprosysClient(gtmContainerId: string): AnalyticsVendorClient {
  let ready = false;

  return {
    id: 'simprosys',

    isConfigured: () => gtmContainerId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      ready = await waitForAnalyticsReady(
        () =>
          Array.isArray(window.dataLayer) &&
          window.dataLayer.some((entry) => {
            if (typeof entry !== 'object' || entry === null) {
              return false;
            }

            return 'gtm.start' in entry;
          }),
      );

      return ready;
    },

    async track(): Promise<void> {
      // ponytail: Simprosys is pixel-only — GTM container handles events once loaded.
    },
  };
}
