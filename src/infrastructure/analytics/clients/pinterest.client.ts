import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { PintrkFunction } from '@/infrastructure/analytics/analytics-globals.d.ts';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import {
  loadClientScript,
  waitForAnalyticsReady,
} from '@/infrastructure/analytics/load-client-script';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';

const PINTEREST_SCRIPT_ID = 'palmonas-analytics-pinterest-core';

function getPintrk(): PintrkFunction | undefined {
  if (typeof window === 'undefined' || typeof window.pintrk !== 'function') {
    return undefined;
  }

  return window.pintrk;
}

function ensurePintrkStub(): void {
  if (typeof window === 'undefined' || typeof window.pintrk === 'function') {
    return;
  }

  const queue: unknown[][] = [];
  const pintrk: PintrkFunction = (...args: unknown[]) => {
    queue.push(Array.prototype.slice.call(args));
  };

  pintrk.queue = queue;
  pintrk.version = '3.0';
  window.pintrk = pintrk;
}

/**
 * Creates the Pinterest Pixel browser client.
 *
 * @param tagId - Pinterest tag id from Ads Manager.
 */
export function createPinterestClient(tagId: string): AnalyticsVendorClient {
  let ready = false;

  return {
    id: 'pinterest',

    isConfigured: () => tagId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      if (typeof window.pintrk !== 'function') {
        ensurePintrkStub();

        try {
          await loadClientScript({
            id: PINTEREST_SCRIPT_ID,
            src: 'https://s.pinimg.com/ct/core.js',
          });
          getPintrk()?.('load', tagId);
          getPintrk()?.('page');
        } catch {
          return false;
        }
      }

      ready = await waitForAnalyticsReady(() => typeof window.pintrk === 'function');
      return ready;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready || !getPintrk()) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      const data = Object.keys(payload).length > 0 ? payload : undefined;

      getPintrk()?.('track', eventName, data);
    },
  };
}
