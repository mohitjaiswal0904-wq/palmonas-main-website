import {
  buildAnalyticsConfig,
  getConfiguredAnalyticsProviderIds,
} from '@/lib/analytics/build-analytics-config';

jest.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_APP_ENV: 'development' },
  getAnalyticsMetaPixelId: jest.fn(),
  getAnalyticsGa4MeasurementId: jest.fn(),
  getAnalyticsGoogleAdsConversionId: jest.fn(),
  getAnalyticsGoogleAdsPurchaseSendTo: jest.fn(),
  getAnalyticsSimprosysGtmContainerId: jest.fn(),
  getAnalyticsPinterestTagId: jest.fn(),
  getAnalyticsSpotifyPixelId: jest.fn(),
  getAnalyticsAdmitadCampaignCode: jest.fn(),
  getAnalyticsMixpanelToken: jest.fn(),
  getAnalyticsMixpanelApiHost: jest.fn(),
  getAnalyticsClarityProjectId: jest.fn(),
  getAnalyticsWebEngageLicenseCode: jest.fn(),
  isWebEngageAnalyticsEnabled: jest.fn(),
}));

const mockGetMeta = jest.requireMock('@/lib/env').getAnalyticsMetaPixelId as jest.Mock;
const mockGetGa4 = jest.requireMock('@/lib/env').getAnalyticsGa4MeasurementId as jest.Mock;
const mockGetGoogleAds = jest.requireMock('@/lib/env')
  .getAnalyticsGoogleAdsConversionId as jest.Mock;
const mockGetGoogleAdsPurchaseSendTo = jest.requireMock('@/lib/env')
  .getAnalyticsGoogleAdsPurchaseSendTo as jest.Mock;
const mockGetSimprosys = jest.requireMock('@/lib/env')
  .getAnalyticsSimprosysGtmContainerId as jest.Mock;
const mockGetPinterest = jest.requireMock('@/lib/env').getAnalyticsPinterestTagId as jest.Mock;
const mockGetSpotify = jest.requireMock('@/lib/env').getAnalyticsSpotifyPixelId as jest.Mock;
const mockGetAdmitad = jest.requireMock('@/lib/env').getAnalyticsAdmitadCampaignCode as jest.Mock;
const mockGetMixpanel = jest.requireMock('@/lib/env').getAnalyticsMixpanelToken as jest.Mock;
const mockGetMixpanelApiHost = jest.requireMock('@/lib/env')
  .getAnalyticsMixpanelApiHost as jest.Mock;
const mockGetClarity = jest.requireMock('@/lib/env').getAnalyticsClarityProjectId as jest.Mock;
const mockGetWebEngage = jest.requireMock('@/lib/env')
  .getAnalyticsWebEngageLicenseCode as jest.Mock;
const mockIsWebEngageAnalyticsEnabled = jest.requireMock('@/lib/env')
  .isWebEngageAnalyticsEnabled as jest.Mock;

describe('buildAnalyticsConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMeta.mockReturnValue(undefined);
    mockGetGa4.mockReturnValue(undefined);
    mockGetGoogleAds.mockReturnValue(undefined);
    mockGetGoogleAdsPurchaseSendTo.mockReturnValue(undefined);
    mockGetSimprosys.mockReturnValue(undefined);
    mockGetPinterest.mockReturnValue(undefined);
    mockGetSpotify.mockReturnValue(undefined);
    mockGetAdmitad.mockReturnValue(undefined);
    mockGetMixpanel.mockReturnValue(undefined);
    mockGetMixpanelApiHost.mockReturnValue(undefined);
    mockGetClarity.mockReturnValue(undefined);
    mockGetWebEngage.mockReturnValue(undefined);
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(false);
  });

  it('includes only providers with non-empty env credentials', () => {
    mockGetMeta.mockReturnValue('meta-pixel');
    mockGetGa4.mockReturnValue('G-ABC123');
    mockGetGoogleAds.mockReturnValue('AW-123');
    mockGetGoogleAdsPurchaseSendTo.mockReturnValue('AW-123/purchase');
    mockGetSimprosys.mockReturnValue('GTM-ABC');
    mockGetPinterest.mockReturnValue('2612345678901');
    mockGetSpotify.mockReturnValue('spotify-pixel');
    mockGetAdmitad.mockReturnValue('admitad-code');
    mockGetMixpanel.mockReturnValue('mixpanel-token');
    mockGetMixpanelApiHost.mockReturnValue('https://api-in.mixpanel.com');
    mockGetWebEngage.mockReturnValue('8261894a');
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(true);

    const config = buildAnalyticsConfig();

    expect(config.meta).toEqual({ pixelId: 'meta-pixel' });
    expect(config.ga4).toEqual({ measurementId: 'G-ABC123' });
    expect(config.googleAds).toEqual({
      conversionId: 'AW-123',
      purchaseSendTo: 'AW-123/purchase',
    });
    expect(config.simprosys).toEqual({ gtmContainerId: 'GTM-ABC' });
    expect(config.pinterest).toEqual({ tagId: '2612345678901' });
    expect(config.spotify).toEqual({ pixelId: 'spotify-pixel' });
    expect(config.admitad).toEqual({ campaignCode: 'admitad-code' });
    expect(config.mixpanel).toEqual({
      token: 'mixpanel-token',
      apiHost: 'https://api-in.mixpanel.com',
      debug: false,
      recordSessionsPercent: 0,
      recordHeatmapData: false,
      optOutTracking: false,
      initDelayMs: 5000,
    });
    expect(config.clarity).toBeUndefined();
    expect(config.webengage).toEqual({ licenseCode: '8261894a' });
  });

  it('opts Mixpanel out in development when no proxy host is set', () => {
    mockGetMixpanel.mockReturnValue('mixpanel-token');

    expect(buildAnalyticsConfig().mixpanel).toEqual({
      token: 'mixpanel-token',
      debug: false,
      recordSessionsPercent: 0,
      recordHeatmapData: false,
      optOutTracking: true,
      initDelayMs: 5000,
    });
  });

  it('keeps Mixpanel ingest and Session Replay outside development', () => {
    const env = jest.requireMock('@/lib/env').env as { NEXT_PUBLIC_APP_ENV: string };
    env.NEXT_PUBLIC_APP_ENV = 'production';
    mockGetMixpanel.mockReturnValue('mixpanel-token');

    expect(buildAnalyticsConfig().mixpanel).toEqual({
      token: 'mixpanel-token',
      debug: false,
      recordSessionsPercent: 100,
      recordHeatmapData: false,
      optOutTracking: false,
      initDelayMs: 5000,
    });

    env.NEXT_PUBLIC_APP_ENV = 'development';
  });

  it('omits webengage when analytics is disabled', () => {
    mockGetWebEngage.mockReturnValue('8261894a');
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(false);

    expect(buildAnalyticsConfig().webengage).toBeUndefined();
  });

  it('includes webengage when analytics is enabled', () => {
    mockGetWebEngage.mockReturnValue('8261894a');
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(true);

    expect(buildAnalyticsConfig().webengage).toEqual({ licenseCode: '8261894a' });
  });

  it('returns an empty config when no analytics env vars are set', () => {
    expect(buildAnalyticsConfig()).toEqual({});
    expect(getConfiguredAnalyticsProviderIds({})).toEqual([]);
  });
});

describe('getConfiguredAnalyticsProviderIds', () => {
  it('lists every configured provider id', () => {
    const ids = getConfiguredAnalyticsProviderIds({
      meta: { pixelId: '1' },
      ga4: { measurementId: 'G-1' },
      googleAds: { conversionId: 'AW-1' },
      simprosys: { gtmContainerId: 'GTM-1' },
      pinterest: { tagId: 'p-1' },
      spotify: { pixelId: 's-1' },
      admitad: { campaignCode: 'a-1' },
      mixpanel: { token: 't' },
      clarity: { projectId: 'c' },
      webengage: { licenseCode: 'w' },
    });

    expect(ids).toEqual([
      'meta',
      'ga4',
      'googleAds',
      'simprosys',
      'pinterest',
      'spotify',
      'admitad',
      'mixpanel',
      'clarity',
      'webengage',
    ]);
  });
});
