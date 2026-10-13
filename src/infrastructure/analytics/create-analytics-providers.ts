import { createAnalyticsVendorClients } from '@/infrastructure/analytics/clients';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import type { AnalyticsProviderPort } from '@/types/analytics/analytics-provider.port';
import type { TransformedProviderEvent } from '@/types/analytics/analytics.types';

/** Maps an installed vendor client to the analytics provider port. */
function toAnalyticsProviderPort(client: AnalyticsVendorClient): AnalyticsProviderPort {
  return {
    id: client.id,
    isConfigured: () => client.isConfigured(),
    isInitialized: () => client.isReady(),
    initialize: async () => {
      await client.init();
    },
    track: async (event: TransformedProviderEvent) => {
      await client.track(event.eventName, event.properties);
    },
  };
}

/**
 * Instantiates analytics provider adapters backed by installed vendor clients.
 *
 * @param clients - Optional client list; defaults to env-backed clients.
 */
export function createAnalyticsProviders(
  clients: AnalyticsVendorClient[] = createAnalyticsVendorClients(),
): AnalyticsProviderPort[] {
  return clients.map(toAnalyticsProviderPort);
}
