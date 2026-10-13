import type { Mixpanel } from 'mixpanel-browser';

import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import {
  readMixpanelDistinctId,
  writeMixpanelDistinctId,
} from '@/lib/analytics/mixpanel-distinct-id-storage';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';
import type { AnalyticsPropertyValue } from '@/types/analytics';

export interface MixpanelClientOptions {
  /** Proxy or residency host, e.g. `https://proxy.example/v1/i/TEST1`. */
  apiHost?: string;
  /** Enables Mixpanel SDK console logging in development. */
  debug?: boolean;
  /** 0–100. Mixpanel samples SDK inits; 0 disables Session Replay. */
  recordSessionsPercent?: number;
  /** Capture clicks, rage clicks, and dead clicks during a replay. */
  recordHeatmapData?: boolean;
  /** When true, Mixpanel does not send events or session replay. */
  optOutTracking?: boolean;
  /** Delay in milliseconds before first initialization of mixpanel-browser SDK. */
  initDelayMs?: number;
}

/**
 * Clamps Mixpanel Session Replay sampling to a 0–100 integer.
 *
 * @param value - Requested sampling percent.
 */
function clampRecordSessionsPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Reads the current Mixpanel distinct id from the SDK.
 *
 * @param mixpanel - Initialized mixpanel-browser instance.
 */
function getMixpanelDistinctId(mixpanel: Mixpanel): string | null {
  try {
    const id = mixpanel.get_distinct_id?.()?.trim();
    return id || null;
  } catch {
    return null;
  }
}

/**
 * Reuses the localStorage distinct id so Mixpanel does not create a new user.
 *
 * @param mixpanel - Initialized mixpanel-browser instance.
 */
function restoreMixpanelDistinctId(mixpanel: Mixpanel): void {
  const stored = readMixpanelDistinctId();
  const current = getMixpanelDistinctId(mixpanel);

  if (stored) {
    if (current !== stored) {
      mixpanel.identify(stored);
    }
    return;
  }

  if (current) {
    writeMixpanelDistinctId(current);
  }
}

/**
 * Builds mixpanel-browser init options from client config.
 *
 * @param options - Optional residency host, debug, and Session Replay flags.
 */
function buildMixpanelInitOptions(options: MixpanelClientOptions) {
  const recordSessionsPercent =
    options.recordSessionsPercent === undefined
      ? undefined
      : clampRecordSessionsPercent(options.recordSessionsPercent);

  return {
    track_pageview: false,
    persistence: 'localStorage' as const,
    batch_requests: true,
    batch_size: 10,
    batch_flush_interval_ms: 5000,
    api_routes: { track: 'track' },
    debug: false,
    ...(options.apiHost ? { api_host: options.apiHost } : {}),
    ...(recordSessionsPercent !== undefined
      ? { record_sessions_percent: recordSessionsPercent }
      : {}),
    ...(options.recordHeatmapData && (recordSessionsPercent ?? 0) > 0
      ? { record_heatmap_data: true }
      : {}),
    ...(options.optOutTracking ? { opt_out_tracking_by_default: true } : {}),
  };
}

/**
 * Creates the Mixpanel browser client (`mixpanel-browser` SDK).
 *
 * @param token - Mixpanel project token.
 * @param options - Residency host, debug, and Session Replay settings.
 */
export function createMixpanelClient(
  token: string,
  options: MixpanelClientOptions = {},
): AnalyticsVendorClient {
  let ready = false;
  let mixpanel: Mixpanel | null = null;
  let initPromise: Promise<boolean> | null = null;
  let pendingSuperProperties: Record<string, AnalyticsPropertyValue> = {
    platform: 'web',
  };

  return {
    id: 'mixpanel',
    isConfigured: () => token.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      if (initPromise) {
        return initPromise;
      }

      initPromise = (async () => {
        try {
          const delayMs = options.initDelayMs ?? 0;
          if (delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }

          const sdkModule = await import('mixpanel-browser');
          mixpanel = sdkModule.default;
          mixpanel.init(token, buildMixpanelInitOptions(options));
          // Only reverse a persisted opt-out. Unconditional opt_in_tracking() on every
          // load can restart Mixpanel sessions and inflate Session Replay count.
          if (!options.optOutTracking && mixpanel.has_opted_out_tracking?.()) {
            mixpanel.opt_in_tracking();
          }
          mixpanel.register(pendingSuperProperties);
          restoreMixpanelDistinctId(mixpanel);
          ready = true;
          return true;
        } catch {
          return false;
        } finally {
          initPromise = null;
        }
      })();

      return initPromise;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready) {
        await this.init();
      }

      if (!ready || !mixpanel) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      mixpanel.track(eventName, payload);
    },

    async identify(distinctId, _options): Promise<void> {
      const trimmed = distinctId.trim();
      if (!trimmed) {
        return;
      }

      writeMixpanelDistinctId(trimmed);

      if (!ready) {
        await this.init();
      }

      if (!ready || !mixpanel) {
        return;
      }

      mixpanel.identify(trimmed);
    },

    async resetIdentity(): Promise<void> {
      if (!ready) {
        // no-op
        return;
      }

      if (!ready || !mixpanel) {
        return;
      }

      // Keep the same Mixpanel user across logout — reset() would mint a new distinct_id.
      const stored = readMixpanelDistinctId() ?? getMixpanelDistinctId(mixpanel);
      if (stored) {
        writeMixpanelDistinctId(stored);
        mixpanel.identify(stored);
      }
    },

    registerSuperProperties(properties) {
      pendingSuperProperties = { ...pendingSuperProperties, ...properties };

      if (!ready || !mixpanel) {
        return;
      }

      mixpanel.register(pendingSuperProperties);
    },
  };
}
