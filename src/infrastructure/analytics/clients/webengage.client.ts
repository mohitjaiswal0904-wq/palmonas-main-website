import '@/infrastructure/analytics/analytics-globals.d.ts';

import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { bootstrapWebEngageIfReady } from '@/lib/analytics/bootstrap-webengage';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';
import { buildWebEngageTrackPayload } from '@/lib/analytics/sanitize-webengage-track';
import {
  runWhenWebEngageReady,
  waitForWebEngageReady,
} from '@/lib/analytics/wait-for-webengage-ready';
import {
  isWebEngageRuntimeEnabled,
  sanitizeWebEngageLicenseCode,
} from '@/lib/analytics/webengage-bootstrap';
import { buildWebEngageUserAttributes } from '@/lib/analytics/webengage-user-attributes';
import { isWebEngageAnalyticsEnabled } from '@/lib/env';

const WEBENGAGE_READY_TIMEOUT_MS = 15_000;

/**
 * Creates the WebEngage browser client (official v6 bootstrap + event fan-out).
 *
 * @param licenseCode - WebEngage license code.
 */
export function createWebEngageClient(licenseCode: string): AnalyticsVendorClient {
  const sanitizedLicenseCode = sanitizeWebEngageLicenseCode(licenseCode);
  let ready = false;

  return {
    id: 'webengage',

    isConfigured: () =>
      sanitizedLicenseCode.length > 0 &&
      isWebEngageAnalyticsEnabled() &&
      isWebEngageRuntimeEnabled(),

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      if (!sanitizedLicenseCode || !isWebEngageAnalyticsEnabled() || !isWebEngageRuntimeEnabled()) {
        return false;
      }

      const bootstrapLoaded = await bootstrapWebEngageIfReady();

      if (!bootstrapLoaded) {
        return false;
      }

      ready = await waitForWebEngageReady(WEBENGAGE_READY_TIMEOUT_MS);
      return ready;
    },

    async track(eventName, properties): Promise<void> {
      if (!ready && !(await this.init())) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      const { eventName: safeEventName, properties: safeProperties } = buildWebEngageTrackPayload(
        eventName,
        payload,
      );

      await new Promise<void>((resolve) => {
        runWhenWebEngageReady(() => {
          window.webengage?.track(safeEventName, safeProperties);
          resolve();
        });
      });
    },

    async identify(distinctId, options): Promise<void> {
      const webengageUserId = options?.webengageUserId?.trim() || distinctId.trim();

      if (!webengageUserId) {
        return;
      }

      if (!ready && !(await this.init())) {
        return;
      }

      const attributes = options?.webengageProfile
        ? buildWebEngageUserAttributes(options.webengageProfile)
        : {};

      await new Promise<void>((resolve) => {
        runWhenWebEngageReady(() => {
          window.webengage?.user?.login(webengageUserId);

          if (Object.keys(attributes).length > 0) {
            window.webengage?.user?.setAttribute(attributes);
          }

          resolve();
        });
      });
    },

    async resetIdentity(): Promise<void> {
      if (!ready && !(await this.init())) {
        return;
      }

      await new Promise<void>((resolve) => {
        runWhenWebEngageReady(() => {
          window.webengage?.user?.logout();
          resolve();
        });
      });
    },
  };
}
