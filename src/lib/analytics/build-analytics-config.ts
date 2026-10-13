import { mixpanelInitDelayMs, mixpanelSessionReplay } from '@/config/analytics/analytics.config';
import {
  env,
  getAnalyticsAdmitadCampaignCode,
  getAnalyticsClarityProjectId,
  getAnalyticsGa4MeasurementId,
  getAnalyticsGoogleAdsConversionId,
  getAnalyticsGoogleAdsPurchaseSendTo,
  getAnalyticsMetaPixelId,
  getAnalyticsMixpanelApiHost,
  getAnalyticsMixpanelToken,
  getAnalyticsPinterestTagId,
  getAnalyticsSimprosysGtmContainerId,
  getAnalyticsSpotifyPixelId,
  getAnalyticsWebEngageLicenseCode,
  isWebEngageAnalyticsEnabled,
} from '@/lib/env';
import type { AnalyticsProviderConfig, AnalyticsProviderId } from '@/types/analytics';

/**
 * Builds analytics provider config from env — only includes providers with non-empty credentials.
 *
 * @returns Partial provider config keyed by vendor id.
 */
export function buildAnalyticsConfig(): AnalyticsProviderConfig {
  const config: AnalyticsProviderConfig = {};

  const metaPixelId = getAnalyticsMetaPixelId();
  if (metaPixelId) {
    config.meta = { pixelId: metaPixelId };
  }

  const measurementId = getAnalyticsGa4MeasurementId();
  if (measurementId) {
    config.ga4 = { measurementId };
  }

  const googleAdsConversionId = getAnalyticsGoogleAdsConversionId();
  if (googleAdsConversionId) {
    const purchaseSendTo = getAnalyticsGoogleAdsPurchaseSendTo();
    config.googleAds = {
      conversionId: googleAdsConversionId,
      ...(purchaseSendTo ? { purchaseSendTo } : {}),
    };
  }

  const gtmContainerId = getAnalyticsSimprosysGtmContainerId();
  if (gtmContainerId) {
    config.simprosys = { gtmContainerId };
  }

  const pinterestTagId = getAnalyticsPinterestTagId();
  if (pinterestTagId) {
    config.pinterest = { tagId: pinterestTagId };
  }

  const spotifyPixelId = getAnalyticsSpotifyPixelId();
  if (spotifyPixelId) {
    config.spotify = { pixelId: spotifyPixelId };
  }

  const admitadCampaignCode = getAnalyticsAdmitadCampaignCode();
  if (admitadCampaignCode) {
    config.admitad = { campaignCode: admitadCampaignCode };
  }

  const mixpanelToken = getAnalyticsMixpanelToken();
  if (mixpanelToken) {
    const apiHost = getAnalyticsMixpanelApiHost();
    const isLocalAnalytics = env.NEXT_PUBLIC_APP_ENV === 'development';
    config.mixpanel = {
      token: mixpanelToken,
      ...(apiHost ? { apiHost } : {}),
      debug: false,
      recordSessionsPercent: isLocalAnalytics ? 0 : mixpanelSessionReplay.recordSessionsPercent,
      recordHeatmapData: isLocalAnalytics ? false : mixpanelSessionReplay.recordHeatmapData,
      // Local opt-out avoids failed Mixpanel.com retries. A configured proxy host
      // is the ingest target, so keep tracking on.
      optOutTracking: isLocalAnalytics && !apiHost,
      initDelayMs: mixpanelInitDelayMs,
    };
  }

  const clarityProjectId = getAnalyticsClarityProjectId();
  if (clarityProjectId) {
    config.clarity = { projectId: clarityProjectId };
  }

  const webEngageLicenseCode = getAnalyticsWebEngageLicenseCode();
  if (isWebEngageAnalyticsEnabled() && webEngageLicenseCode) {
    config.webengage = { licenseCode: webEngageLicenseCode };
  }

  return config;
}

/**
 * Lists provider ids that have credentials in the given config.
 *
 * @param config - Resolved analytics provider config.
 */
export function getConfiguredAnalyticsProviderIds(
  config: AnalyticsProviderConfig,
): AnalyticsProviderId[] {
  const ids: AnalyticsProviderId[] = [];

  if (config.meta?.pixelId) ids.push('meta');
  if (config.ga4?.measurementId) ids.push('ga4');
  if (config.googleAds?.conversionId) ids.push('googleAds');
  if (config.simprosys?.gtmContainerId) ids.push('simprosys');
  if (config.pinterest?.tagId) ids.push('pinterest');
  if (config.spotify?.pixelId) ids.push('spotify');
  if (config.admitad?.campaignCode) ids.push('admitad');
  if (config.mixpanel?.token) ids.push('mixpanel');
  if (config.clarity?.projectId) ids.push('clarity');
  if (config.webengage?.licenseCode) ids.push('webengage');

  return ids;
}
