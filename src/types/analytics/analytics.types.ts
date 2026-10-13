/** Supported third-party analytics vendors. */
export type AnalyticsProviderId =
  | 'meta'
  | 'ga4'
  | 'googleAds'
  | 'simprosys'
  | 'pinterest'
  | 'spotify'
  | 'admitad'
  | 'mixpanel'
  | 'clarity'
  | 'webengage';

/** Scalar values allowed on analytics event payloads. */
export type AnalyticsPropertyValue = string | number | boolean | null;

/** Canonical event passed to the analytics client. */
export interface AnalyticsEventDetail {
  /** Canonical event name — mapped per provider via analytics config. */
  name: string;
  properties?: Record<string, AnalyticsPropertyValue>;
  /** Optional commerce value (currency defaults from config when omitted). */
  value?: number;
  currency?: string;
  /**
   * When true, every provider receives `name` unchanged (no registry remap).
   * Used for third-party pixel events such as GoKwik checkout.
   */
  passthroughEventName?: boolean;
}

/** Per-provider credentials resolved from env. */
export interface AnalyticsProviderConfig {
  meta?: { pixelId: string };
  ga4?: { measurementId: string };
  googleAds?: {
    conversionId: string;
    purchaseSendTo?: string;
  };
  simprosys?: { gtmContainerId: string };
  pinterest?: { tagId: string };
  spotify?: { pixelId: string };
  admitad?: { campaignCode: string };
  mixpanel?: {
    token: string;
    /** Override when project uses a proxy or EU/IN residency host. */
    apiHost?: string;
    debug?: boolean;
    /** 0–100. Mixpanel samples SDK inits; 0 disables Session Replay. */
    recordSessionsPercent?: number;
    /** Capture clicks, rage clicks, and dead clicks during a replay. */
    recordHeatmapData?: boolean;
    /** Skip Mixpanel ingest (local/dev) so failed batches do not retry in the console. */
    optOutTracking?: boolean;
    /** Delay in ms before first mixpanel-browser SDK load. */
    initDelayMs?: number;
  };
  clarity?: { projectId: string };
  webengage?: { licenseCode: string };
}

/** Provider-specific event after transform. */
export interface TransformedProviderEvent {
  provider: AnalyticsProviderId;
  eventName: string;
  properties: Record<string, AnalyticsPropertyValue>;
}
