'use client';

import Script from 'next/script';

import { admitadBootstrapScriptId, buildAdmitadScriptSrc } from '@/lib/analytics/admitad-bootstrap';
import { buildAnalyticsConfig } from '@/lib/analytics/build-analytics-config';
import {
  buildPinterestBootstrapScript,
  pinterestBootstrapScriptId,
} from '@/lib/analytics/pinterest-bootstrap';
import {
  buildSpotifyBootstrapScript,
  spotifyBootstrapScriptId,
} from '@/lib/analytics/spotify-bootstrap';

/**
 * Configures the Google Ads AW id on the shared gtag/dataLayer.
 *
 * @param conversionId - Google Ads conversion id (AW-…).
 */
function buildGoogleAdsInlineScript(conversionId: string): string {
  return `
    window.dataLayer=window.dataLayer||[];
    function gtag(){dataLayer.push(arguments);}
    gtag('config','${conversionId}',{send_page_view:false});
  `;
}

/** Loads third-party analytics SDK scripts for every configured provider. */
export function AnalyticsScripts() {
  const config = buildAnalyticsConfig();
  const googleAdsConversionId = config.googleAds?.conversionId?.trim() ?? '';
  const hasGa4 = Boolean(config.ga4?.measurementId);
  // GA4 root layout already loads gtag.js — only fetch it for Ads when GA4 is absent.
  const loadAdsGtagJs = googleAdsConversionId.length > 0 && !hasGa4;

  return (
    <>
      {config.admitad?.campaignCode ? (
        <Script
          id={admitadBootstrapScriptId}
          src={buildAdmitadScriptSrc(config.admitad.campaignCode)}
          strategy="afterInteractive"
        />
      ) : null}

      {googleAdsConversionId ? (
        <>
          {loadAdsGtagJs ? (
            <Script
              id="palmonas-analytics-google-ads-gtag"
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsConversionId}`}
              strategy="afterInteractive"
            />
          ) : null}
          <Script id="palmonas-analytics-google-ads-config" strategy="afterInteractive">
            {buildGoogleAdsInlineScript(googleAdsConversionId)}
          </Script>
        </>
      ) : null}

      {config.pinterest?.tagId ? (
        <Script id={pinterestBootstrapScriptId} strategy="afterInteractive">
          {buildPinterestBootstrapScript(config.pinterest.tagId)}
        </Script>
      ) : null}

      {config.spotify?.pixelId ? (
        <Script id={spotifyBootstrapScriptId} strategy="afterInteractive">
          {buildSpotifyBootstrapScript(config.spotify.pixelId)}
        </Script>
      ) : null}
    </>
  );
}
