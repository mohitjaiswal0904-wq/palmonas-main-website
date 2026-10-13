import { z } from 'zod';

const kwikpassEnvSchema = z.enum(['sandbox', 'production']);
const webengageDataCenterSchema = z.enum(['in', 'us', 'ksa', 'eug']);

/** Empty is allowed. A non-empty value must still be an absolute URL. */
const optionalUrl = z.union([z.string().url(), z.literal('')]).default('');

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_DEV: z.string().url().default('https://app-backend.palmonas.tech'),
  NEXT_PUBLIC_API_PROD: z.string().url().default('https://app-backend.palmonas.tech'),
  // ponytail: UI-test deploys only need the product API. Checkout, login, careers, and store URLs stay blank until set.
  NEXT_PUBLIC_MTO_API_BASE: optionalUrl,
  NEXT_PUBLIC_KWIKPASS_MERCHANT_ID: z.string().default(''),
  NEXT_PUBLIC_KWIKPASS_ENVIRONMENT: kwikpassEnvSchema.default('sandbox'),
  NEXT_PUBLIC_KP_BASE: optionalUrl,
  NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN: z.string().default('palmonas.myshopify.com'),
  NEXT_PUBLIC_OMS_API_URL: optionalUrl,
  NEXT_PUBLIC_GOKWIK_STORE_ID: z.string().default(''),
  NEXT_PUBLIC_GOKWIK_FB_PIXEL: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_CONVERSION_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_PURCHASE_SEND_TO: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_SIMPROSYS_GTM_CONTAINER_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_PINTEREST_TAG_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_SPOTIFY_PIXEL_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_ADMITAD_CAMPAIGN_CODE: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_MIXPANEL_TOKEN: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_CLARITY_PROJECT_ID: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_WEBENGAGE_LICENSE_CODE: z.string().default(''),
  NEXT_PUBLIC_ANALYTICS_WEBENGAGE_DATA_CENTER: webengageDataCenterSchema.default('in'),
  NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL: optionalUrl,
  NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL: optionalUrl,
});

function readKwikpassMerchantId(): string | undefined {
  return process.env.NEXT_PUBLIC_KWIKPASS_MERCHANT_ID ?? process.env.NEXT_PUBLIC_KWIKPASS_MID;
}

function readKwikpassEnvironment(): string | undefined {
  return process.env.NEXT_PUBLIC_KWIKPASS_ENVIRONMENT ?? process.env.NEXT_PUBLIC_KWIKPASS_ENV;
}

function readKwikpassBase(): string | undefined {
  return process.env.NEXT_PUBLIC_KP_BASE ?? process.env.NEXT_PUBLIC_KWIKPASS_BASE_URL;
}

function parseEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_API_DEV: process.env.NEXT_PUBLIC_API_DEV,
    NEXT_PUBLIC_API_PROD: process.env.NEXT_PUBLIC_API_PROD,
    NEXT_PUBLIC_MTO_API_BASE: process.env.NEXT_PUBLIC_MTO_API_BASE,
    NEXT_PUBLIC_KWIKPASS_MERCHANT_ID: readKwikpassMerchantId(),
    NEXT_PUBLIC_KWIKPASS_ENVIRONMENT: readKwikpassEnvironment() || undefined,
    NEXT_PUBLIC_KP_BASE: readKwikpassBase(),
    NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN:
      process.env.NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN ?? 'palmonas.myshopify.com',
    NEXT_PUBLIC_OMS_API_URL: process.env.NEXT_PUBLIC_OMS_API_URL,
    NEXT_PUBLIC_GOKWIK_STORE_ID: process.env.NEXT_PUBLIC_GOKWIK_STORE_ID ?? '',
    NEXT_PUBLIC_GOKWIK_FB_PIXEL: process.env.NEXT_PUBLIC_GOKWIK_FB_PIXEL ?? '',
    NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID: process.env.NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_CONVERSION_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_CONVERSION_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_PURCHASE_SEND_TO:
      process.env.NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_PURCHASE_SEND_TO ?? '',
    NEXT_PUBLIC_ANALYTICS_SIMPROSYS_GTM_CONTAINER_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_SIMPROSYS_GTM_CONTAINER_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_PINTEREST_TAG_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_PINTEREST_TAG_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_SPOTIFY_PIXEL_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_SPOTIFY_PIXEL_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_ADMITAD_CAMPAIGN_CODE:
      process.env.NEXT_PUBLIC_ANALYTICS_ADMITAD_CAMPAIGN_CODE ?? '',
    NEXT_PUBLIC_ANALYTICS_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_TOKEN ?? '',
    NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST:
      process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST ?? '',
    NEXT_PUBLIC_ANALYTICS_CLARITY_PROJECT_ID:
      process.env.NEXT_PUBLIC_ANALYTICS_CLARITY_PROJECT_ID ?? '',
    NEXT_PUBLIC_ANALYTICS_WEBENGAGE_LICENSE_CODE:
      process.env.NEXT_PUBLIC_ANALYTICS_WEBENGAGE_LICENSE_CODE ?? '',
    NEXT_PUBLIC_ANALYTICS_WEBENGAGE_DATA_CENTER:
      process.env.NEXT_PUBLIC_ANALYTICS_WEBENGAGE_DATA_CENTER ?? 'in',
    NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL: process.env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL,
    NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL: process.env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL,
  });

  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }

  return result.data;
}

/** Validated public env — safe to use in client and server code. */
export const env = parseEnv();

/** Returns the external API base URL for the current environment. */
export function getApiBaseUrl(): string {
  return env.NEXT_PUBLIC_APP_ENV === 'production'
    ? env.NEXT_PUBLIC_API_PROD
    : env.NEXT_PUBLIC_API_DEV;
}

/** Returns the Palmonas MTO pricing utils API base URL. */
export function getMtoApiBaseUrl(): string {
  return env.NEXT_PUBLIC_MTO_API_BASE;
}

/** KwikPass script base URL (sandbox or production PDP host). */
export function getKwikpassBaseUrl(): string {
  return env.NEXT_PUBLIC_KP_BASE;
}

/** Returns the OMS API base URL for public store data. */
export function getOmsApiBaseUrl(): string {
  return env.NEXT_PUBLIC_OMS_API_URL;
}

/**
 * Parses Shopify store id for GoKwik checkout merchantInfo.
 *
 * @returns Numeric store id when env is set and valid; otherwise undefined.
 */
export function getGokwikStoreId(): number | undefined {
  const raw = env.NEXT_PUBLIC_GOKWIK_STORE_ID.trim();
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Google Apps Script web app URL for general careers applications. */
export function getCareersGeneralScriptUrl(): string {
  return env.NEXT_PUBLIC_CAREERS_GENERAL_SCRIPT_URL;
}

/** Google Apps Script web app URL for job-specific careers applications. */
export function getCareersJobScriptUrl(): string {
  return env.NEXT_PUBLIC_CAREERS_JOB_SCRIPT_URL;
}

function readOptionalPublicEnv(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Meta Pixel id for first-party analytics (separate from GoKwik checkout pixel). */
export function getAnalyticsMetaPixelId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_META_PIXEL_ID);
}

/** GA4 measurement id (G-XXXXXXXX). */
export function getAnalyticsGa4MeasurementId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_GA4_MEASUREMENT_ID);
}

/** Google Ads conversion id (AW-XXXXXXXX) for Google & YouTube remarketing. */
export function getAnalyticsGoogleAdsConversionId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_CONVERSION_ID);
}

/** Full Google Ads purchase conversion send_to (AW-xxx/label). */
export function getAnalyticsGoogleAdsPurchaseSendTo(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_GOOGLE_ADS_PURCHASE_SEND_TO);
}

/** GTM container id for Simprosys tracking tags. */
export function getAnalyticsSimprosysGtmContainerId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_SIMPROSYS_GTM_CONTAINER_ID);
}

/** Pinterest tag id from Ads Manager. */
export function getAnalyticsPinterestTagId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_PINTEREST_TAG_ID);
}

/** Spotify Ads pixel id. */
export function getAnalyticsSpotifyPixelId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_SPOTIFY_PIXEL_ID);
}

/** Admitad affiliate program campaign code. */
export function getAnalyticsAdmitadCampaignCode(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_ADMITAD_CAMPAIGN_CODE);
}

/** Mixpanel project token. */
export function getAnalyticsMixpanelToken(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_TOKEN);
}

/**
 * Reads Mixpanel `api_host` only when it is an absolute http(s) URL.
 * A relative value is resolved against the current page (`/products/...`) and
 * never reaches the proxy.
 *
 * @returns Absolute host, or undefined when unset/invalid.
 */
export function getAnalyticsMixpanelApiHost(): string | undefined {
  const raw = readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST);

  if (!raw) {
    return undefined;
  }

  const withoutAccidentalKeyPrefix = raw.replace(
    /^(?:NEXT_PUBLIC_ANALYTICS_MIXPANEL_API_HOST=)+/i,
    '',
  );

  try {
    const url = new URL(withoutAccidentalKeyPrefix);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return `${url.origin}${url.pathname}`.replace(/\/$/, '');
  } catch {
    return undefined;
  }
}

/** Microsoft Clarity project id. */
export function getAnalyticsClarityProjectId(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_CLARITY_PROJECT_ID);
}

/** WebEngage license code. */
export function getAnalyticsWebEngageLicenseCode(): string | undefined {
  return readOptionalPublicEnv(env.NEXT_PUBLIC_ANALYTICS_WEBENGAGE_LICENSE_CODE);
}

/**
 * Returns whether WebEngage credentials are configured.
 */
export function isWebEngageAnalyticsEnabled(): boolean {
  return Boolean(getAnalyticsWebEngageLicenseCode());
}

/** WebEngage data center — must match dashboard host (dashboard.in.webengage.com → in). */
export function getAnalyticsWebEngageDataCenter(): 'in' | 'us' | 'ksa' | 'eug' {
  return env.NEXT_PUBLIC_ANALYTICS_WEBENGAGE_DATA_CENTER;
}
