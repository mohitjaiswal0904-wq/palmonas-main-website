import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { SpotifyPixelFunction } from '@/infrastructure/analytics/analytics-globals.d.ts';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import {
  loadClientScript,
  waitForAnalyticsReady,
} from '@/infrastructure/analytics/load-client-script';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';

const SPOTIFY_SCRIPT_ID = 'palmonas-analytics-spotify-core';

function getSpotify(): SpotifyPixelFunction | undefined {
  if (typeof window === 'undefined' || typeof window.spotify !== 'function') {
    return undefined;
  }

  return window.spotify;
}

function ensureSpotifyStub(): void {
  if (typeof window === 'undefined' || typeof window.spotify === 'function') {
    return;
  }

  const queue: unknown[][] = [];
  const spotify: SpotifyPixelFunction = (...args: unknown[]) => {
    queue.push(args);
  };

  spotify.q = queue;
  spotify.l = Date.now();
  window.spotify = spotify;
  window.SpotifyPixelObject = 'spotify';
}

/**
 * Creates the Spotify Ads pixel browser client.
 *
 * @param pixelId - Spotify pixel id from Ads Manager.
 */
export function createSpotifyClient(pixelId: string): AnalyticsVendorClient {
  let ready = false;

  return {
    id: 'spotify',

    isConfigured: () => pixelId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      if (typeof window.spotify !== 'function') {
        ensureSpotifyStub();

        try {
          await loadClientScript({
            id: SPOTIFY_SCRIPT_ID,
            src: 'https://pixel.spotify.com/v1/pixel.js',
          });
          getSpotify()?.('init', pixelId);
          getSpotify()?.('track', 'PageView');
        } catch {
          return false;
        }
      }

      ready = await waitForAnalyticsReady(() => typeof window.spotify === 'function');
      return ready;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready || !getSpotify()) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      const data = Object.keys(payload).length > 0 ? payload : undefined;

      getSpotify()?.('track', eventName, data);
    },
  };
}
