/** @jest-environment jsdom */

jest.mock('@/lib/analytics/build-analytics-config', () => ({
  buildAnalyticsConfig: jest.fn(),
}));

import { render } from '@testing-library/react';

import { buildAnalyticsConfig } from '@/lib/analytics/build-analytics-config';

const mockBuildAnalyticsConfig = buildAnalyticsConfig as jest.MockedFunction<
  typeof buildAnalyticsConfig
>;

describe('AnalyticsScripts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('installs marketing pixels and Google Ads AW config when credentials exist', async () => {
    mockBuildAnalyticsConfig.mockReturnValue({
      meta: { pixelId: 'meta-123' },
      ga4: { measurementId: 'G-ABC123' },
      googleAds: { conversionId: 'AW-10856259903' },
      simprosys: { gtmContainerId: 'GTM-ABC123' },
      pinterest: { tagId: '2612345678901' },
      spotify: { pixelId: 'spotify-pixel-1' },
      admitad: { campaignCode: 'admitad-campaign' },
      webengage: { licenseCode: 'license-1' },
    });

    const { AnalyticsScripts } = await import('@/infrastructure/analytics/AnalyticsScripts');
    render(<AnalyticsScripts />);

    expect(document.getElementById('palmonas-analytics-pinterest-pixel')).toBeInTheDocument();
    expect(document.getElementById('palmonas-analytics-spotify-pixel')).toBeInTheDocument();
    expect(document.getElementById('_webengage_script_tag')).not.toBeInTheDocument();
    // GA4 already loads gtag — Ads only needs AW config (Page View label 5h6u… depends on this).
    expect(document.getElementById('palmonas-analytics-google-ads-config')).toBeInTheDocument();
    expect(document.getElementById('palmonas-analytics-google-ads-gtag')).not.toBeInTheDocument();
    expect(document.getElementById('palmonas-analytics-google-ads-config')?.textContent).toContain(
      "gtag('config','AW-10856259903',{send_page_view:false})",
    );
  });

  it('renders nothing when no analytics credentials are configured', async () => {
    mockBuildAnalyticsConfig.mockReturnValue({});

    const { AnalyticsScripts } = await import('@/infrastructure/analytics/AnalyticsScripts');
    const { container } = render(<AnalyticsScripts />);

    expect(container).toBeEmptyDOMElement();
  });
});
