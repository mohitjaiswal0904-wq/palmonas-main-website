export {
  AnalyticsClient,
  analyticsClient,
  identifyAnalyticsUser,
  resetAnalyticsUser,
  setAnalyticsSuperProperties,
  trackAnalyticsEvent,
} from '@/infrastructure/analytics/analytics-client';
export { AnalyticsProvider } from '@/infrastructure/analytics/AnalyticsProvider';
export { AnalyticsInteractionTracker } from '@/infrastructure/analytics/AnalyticsInteractionTracker';
export { AnalyticsPageViewTracker } from '@/infrastructure/analytics/AnalyticsPageViewTracker';
export { AnalyticsScripts } from '@/infrastructure/analytics/AnalyticsScripts';
export { WebEngageAnalyticsScript } from '@/infrastructure/analytics/WebEngageAnalyticsScript';
export {
  createAnalyticsVendorClients,
  createClarityClient,
  createGa4Client,
  createMetaPixelClient,
  createMixpanelClient,
  createWebEngageClient,
} from '@/infrastructure/analytics/clients';
export type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients';
export { createAnalyticsProviders } from '@/infrastructure/analytics/create-analytics-providers';
export {
  loadClientScript,
  waitForAnalyticsReady,
} from '@/infrastructure/analytics/load-client-script';

export {
  buildAnalyticsConfig,
  getConfiguredAnalyticsProviderIds,
} from '@/lib/analytics/build-analytics-config';
export { sanitizeAnalyticsProperties } from '@/lib/analytics/sanitize-analytics-properties';
export { transformAnalyticsEvent } from '@/lib/analytics/transform-analytics-event';
export {
  buildAnalyticsEventProperties,
  serializeAnalyticsProducts,
} from '@/lib/analytics/build-analytics-base-properties';
export {
  clearAnalyticsAuthContext,
  getAnalyticsAuthContext,
  setAnalyticsAuthContext,
} from '@/lib/analytics/analytics-auth-context';
export * from '@/lib/analytics/analytics-trackers';
export {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
  trackProductBuyNowClicked,
} from '@/lib/analytics/track-product-cart-events';
export {
  buildClickAnalyticsEvent,
  buildPageViewAnalyticsEvent,
} from '@/lib/analytics/build-click-analytics-event';
export {
  findTrackableClickTarget,
  getClickElementType,
  shouldSkipClickTracking,
} from '@/lib/analytics/find-trackable-click-target';
export { getClickAccessibleLabel } from '@/lib/analytics/get-click-accessible-label';
export { parseAnalyticsDataProps } from '@/lib/analytics/parse-analytics-data-props';

export type {
  AnalyticsEventDetail,
  AnalyticsPropertyValue,
  AnalyticsProviderConfig,
  AnalyticsProviderId,
  TransformedProviderEvent,
} from '@/types/analytics';
export type { AnalyticsProviderPort } from '@/types/analytics/analytics-provider.port';
