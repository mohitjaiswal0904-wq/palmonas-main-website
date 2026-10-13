import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/seo';
import { siteConfig } from '@/config/site.config';
import { WebEngageAnalyticsScript } from '@/infrastructure/analytics/WebEngageAnalyticsScript';
import {
  buildCustomFitBootstrapScript,
  CUSTOMFIT_API_ORIGIN,
  CUSTOMFIT_PREINIT_SCRIPT_ID,
  CUSTOMFIT_SDK_SRC,
  shouldLoadCustomFit,
} from '@/lib/analytics/customfit-bootstrap';
import {
  buildGtmBootstrapScript,
  gtmBootstrapScriptId,
  sanitizeGtmContainerId,
} from '@/lib/analytics/gtm-bootstrap';
import {
  buildGokwikUtmCookieScript,
  GOKWIK_UTM_COOKIE_SCRIPT_ID,
} from '@/lib/cart/checkout-utm-storage';
import { getAnalyticsGa4MeasurementId, getAnalyticsSimprosysGtmContainerId } from '@/lib/env';
import { buildMetadata } from '@/lib/seo/build-metadata';
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/json-ld';
import {
  buildShopHostCanonicalScript,
  SHOP_HOST_CANONICAL_SCRIPT_ID,
} from '@/lib/seo/shop-host-canonical';
import { AppProvider } from '@/providers/AppProvider';
import '@/styles/globals.css';

const nunitoSansStylesheet =
  'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap';

export const metadata: Metadata = {
  ...buildMetadata(),
  applicationName: siteConfig.name,
  generator: siteConfig.name,
  category: 'shopping',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon.png', type: 'image/png', sizes: '153x153' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '153x153', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const gtmContainerId = getAnalyticsSimprosysGtmContainerId();
  const gtmBootstrap = gtmContainerId ? buildGtmBootstrapScript(gtmContainerId) : '';
  const ga4MeasurementId = getAnalyticsGa4MeasurementId();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={nunitoSansStylesheet} rel="stylesheet" />
        {/* palmonas.com is canonical. shop.palmonas.com is a duplicate (temporary A/B). */}
        <script
          id={SHOP_HOST_CANONICAL_SCRIPT_ID}
          dangerouslySetInnerHTML={{ __html: buildShopHostCanonicalScript() }}
        />
        <script
          id={GOKWIK_UTM_COOKIE_SCRIPT_ID}
          dangerouslySetInnerHTML={{ __html: buildGokwikUtmCookieScript() }}
        />
        {shouldLoadCustomFit() ? (
          <>
            {/* Start CustomFit.ai Intelligent Code */}
            {/* DONOT EDIT (including the outer comments) */}
            <link rel="preconnect" href={CUSTOMFIT_API_ORIGIN} crossOrigin="anonymous" />
            <link rel="preload" href={CUSTOMFIT_SDK_SRC} as="script" />
            <script
              id={CUSTOMFIT_PREINIT_SCRIPT_ID}
              data-cfasync="false"
              dangerouslySetInnerHTML={{ __html: buildCustomFitBootstrapScript() }}
            />
            {/* End CustomFit.ai Intelligent Code */}
          </>
        ) : null}
        {gtmBootstrap ? (
          <script id={gtmBootstrapScriptId} dangerouslySetInnerHTML={{ __html: gtmBootstrap }} />
        ) : null}
        {ga4MeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4MeasurementId}', { send_page_view: false });
          `}
            </Script>
          </>
        ) : null}
        <WebEngageAnalyticsScript />
      </head>
      <body className="font-sans antialiased">
        {gtmContainerId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${sanitizeGtmContainerId(gtmContainerId)}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
