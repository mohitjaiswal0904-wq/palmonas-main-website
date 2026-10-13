import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { stripInternalAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';

type ClaritySdk = {
  init: (projectId: string) => void;
  event: (eventName: string) => void;
  setTag: (key: string, value: string | string[]) => void;
};

/**
 * Creates the Microsoft Clarity browser client (`@microsoft/clarity` SDK).
 *
 * @param projectId - Clarity project id.
 */
export function createClarityClient(projectId: string): AnalyticsVendorClient {
  let ready = false;
  let clarity: ClaritySdk | null = null;

  return {
    id: 'clarity',

    isConfigured: () => projectId.trim().length > 0,

    isReady: () => ready,

    async init(): Promise<boolean> {
      if (ready || typeof window === 'undefined') {
        return ready;
      }

      try {
        const sdkModule = await import('@microsoft/clarity');
        clarity = sdkModule.default;
        clarity.init(projectId);
        ready = true;
        return true;
      } catch {
        return false;
      }
    },

    async track(eventName, properties): Promise<void> {
      if (!ready || !clarity) {
        return;
      }

      const payload = stripInternalAnalyticsProperties(properties);
      clarity.event(eventName);

      for (const [key, value] of Object.entries(payload)) {
        clarity.setTag(key, String(value));
      }
    },
  };
}
