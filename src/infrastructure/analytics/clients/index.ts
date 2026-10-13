import { createAdmitadClient } from '@/infrastructure/analytics/clients/admitad.client';
import { createClarityClient } from '@/infrastructure/analytics/clients/clarity.client';
import { createGa4Client } from '@/infrastructure/analytics/clients/ga4.client';
import { createGoogleAdsClient } from '@/infrastructure/analytics/clients/google-ads.client';
import { createMetaPixelClient } from '@/infrastructure/analytics/clients/meta.client';
import { createMixpanelClient } from '@/infrastructure/analytics/clients/mixpanel.client';
import { createPinterestClient } from '@/infrastructure/analytics/clients/pinterest.client';
import { createSimprosysClient } from '@/infrastructure/analytics/clients/simprosys.client';
import { createSpotifyClient } from '@/infrastructure/analytics/clients/spotify.client';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { createWebEngageClient } from '@/infrastructure/analytics/clients/webengage.client';
import { buildAnalyticsConfig } from '@/lib/analytics/build-analytics-config';
import type { AnalyticsProviderConfig } from '@/types/analytics';

/**
 * Instantiates installed vendor clients for configured analytics credentials.
 *
 * @param config - Optional override; defaults to env-backed config.
 */
export function createAnalyticsVendorClients(
  config: AnalyticsProviderConfig = buildAnalyticsConfig(),
): AnalyticsVendorClient[] {
  const clients: AnalyticsVendorClient[] = [];

  if (config.meta?.pixelId) {
    clients.push(createMetaPixelClient(config.meta.pixelId));
  }

  if (config.ga4?.measurementId) {
    clients.push(createGa4Client(config.ga4.measurementId));
  }

  if (config.googleAds?.conversionId) {
    clients.push(createGoogleAdsClient(config.googleAds));
  }

  if (config.simprosys?.gtmContainerId) {
    clients.push(createSimprosysClient(config.simprosys.gtmContainerId));
  }

  if (config.pinterest?.tagId) {
    clients.push(createPinterestClient(config.pinterest.tagId));
  }

  if (config.spotify?.pixelId) {
    clients.push(createSpotifyClient(config.spotify.pixelId));
  }

  if (config.admitad?.campaignCode) {
    clients.push(createAdmitadClient(config.admitad.campaignCode));
  }

  if (config.mixpanel?.token) {
    clients.push(
      createMixpanelClient(config.mixpanel.token, {
        apiHost: config.mixpanel.apiHost,
        debug: config.mixpanel.debug,
        recordSessionsPercent: config.mixpanel.recordSessionsPercent,
        recordHeatmapData: config.mixpanel.recordHeatmapData,
        optOutTracking: config.mixpanel.optOutTracking,
        initDelayMs: config.mixpanel.initDelayMs,
      }),
    );
  }

  if (config.clarity?.projectId) {
    clients.push(createClarityClient(config.clarity.projectId));
  }

  if (config.webengage?.licenseCode) {
    clients.push(createWebEngageClient(config.webengage.licenseCode));
  }

  return clients;
}

export { createAdmitadClient } from '@/infrastructure/analytics/clients/admitad.client';
export { createClarityClient } from '@/infrastructure/analytics/clients/clarity.client';
export { createGa4Client } from '@/infrastructure/analytics/clients/ga4.client';
export { createGoogleAdsClient } from '@/infrastructure/analytics/clients/google-ads.client';
export { createMetaPixelClient } from '@/infrastructure/analytics/clients/meta.client';
export { createMixpanelClient } from '@/infrastructure/analytics/clients/mixpanel.client';
export { createPinterestClient } from '@/infrastructure/analytics/clients/pinterest.client';
export { createSimprosysClient } from '@/infrastructure/analytics/clients/simprosys.client';
export { createSpotifyClient } from '@/infrastructure/analytics/clients/spotify.client';
export { createWebEngageClient } from '@/infrastructure/analytics/clients/webengage.client';
export type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
