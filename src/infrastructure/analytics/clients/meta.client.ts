import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { FbqFunction } from '@/infrastructure/analytics/analytics-globals.d.ts';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import {
  loadClientScript,
  waitForAnalyticsReady,
} from '@/infrastructure/analytics/load-client-script';
import { buildMetaTrackPayload, captureMetaFbcFromUrl } from '@/lib/analytics/meta-pixel';
import { getMetaPixelAdvancedMatchingParams } from '@/lib/analytics/meta-pixel-identity';
import {
  isMetaStandardAnalyticsEvent,
  stripInternalAnalyticsProperties,
} from '@/lib/analytics/sanitize-analytics-properties';

const META_SCRIPT_ID = 'palmonas-analytics-meta-pixel';

function getFbq(): FbqFunction | undefined {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return undefined;
  }

  return window.fbq as FbqFunction;
}

function callFbq(...args: unknown[]): void {
  getFbq()?.(...args);
}

function ensureFbqStub(): void {
  if (typeof window === 'undefined' || typeof window.fbq === 'function') {
    return;
  }

  const queue: unknown[][] = [];
  const fbq: FbqFunction = (...args: unknown[]) => {
    if (typeof fbq.callMethod === 'function') {
      fbq.callMethod(...args);
      return;
    }
    queue.push(args);
  };

  fbq.queue = queue;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.push = fbq;
  window.fbq = fbq;
  window._fbq = fbq;
}

/**
 * Initializes Meta Pixel with advanced matching when customer fields are available.
 *
 * @param pixelId - Meta Pixel id from env.
 */
function initMetaPixel(pixelId: string): void {
  captureMetaFbcFromUrl();

  const advancedMatching = getMetaPixelAdvancedMatchingParams();

  if (Object.keys(advancedMatching).length > 0) {
    callFbq('init', pixelId, advancedMatching);
    return;
  }

  callFbq('init', pixelId);
}

/**
 * Creates the Meta Pixel browser client.
 *
 * @param pixelId - Meta Pixel id from env.
 */
export function createMetaPixelClient(pixelId: string): AnalyticsVendorClient {
  let ready = false;
  let initialized = false;

  return {
    id: 'meta',

    isConfigured: () => pixelId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      ensureFbqStub();
      captureMetaFbcFromUrl();

      if (typeof window.fbq !== 'function' || !initialized) {
        try {
          await loadClientScript({
            id: META_SCRIPT_ID,
            src: 'https://connect.facebook.net/en_US/fbevents.js',
          });
          initMetaPixel(pixelId);
          initialized = true;
        } catch {
          return false;
        }
      } else if (!initialized) {
        initMetaPixel(pixelId);
        initialized = true;
      }

      ready = await waitForAnalyticsReady(() => typeof window.fbq === 'function');
      return ready;
    },

    async identify(_distinctId: string): Promise<void> {
      if (!ready && !(await this.init())) {
        return;
      }

      const advancedMatching = getMetaPixelAdvancedMatchingParams();

      if (Object.keys(advancedMatching).length === 0) {
        return;
      }

      callFbq('init', pixelId, advancedMatching);
      initialized = true;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready && !(await this.init())) {
        return;
      }

      const payload = buildMetaTrackPayload(stripInternalAnalyticsProperties(properties));
      const data = Object.keys(payload).length > 0 ? payload : undefined;

      if (isMetaStandardAnalyticsEvent(properties)) {
        callFbq('track', eventName, data);
        return;
      }

      callFbq('trackCustom', eventName, data);
    },
  };
}
