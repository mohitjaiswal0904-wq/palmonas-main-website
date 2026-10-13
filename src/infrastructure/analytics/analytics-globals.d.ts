/** Window globals injected by third-party analytics SDKs. */
export type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
  push?: FbqFunction;
};

export type GtagFunction = (...args: unknown[]) => void;

export interface MixpanelClient {
  init: (token: string, config?: Record<string, unknown>) => void;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  register?: (properties: Record<string, unknown>) => void;
  __loaded?: boolean;
}

export type ClarityFunction = (...args: unknown[]) => void;

export type PintrkFunction = {
  (...args: unknown[]): void;
  queue?: unknown[][];
  version?: string;
};

export type SpotifyPixelFunction = {
  (...args: unknown[]): void;
  q?: unknown[][];
  l?: number;
};

export interface AdmitadReferencesOrderItem {
  price?: string;
  currency?: string;
}

export interface AdmitadTrackingClient {
  buildReferencesOrder: (input: {
    orderNumber: string;
    orderedItem: AdmitadReferencesOrderItem[];
  }) => AdmitadReferencesOrderItem[];
  processPositions: () => void;
}

export interface AdmitadGlobal {
  Tracking?: AdmitadTrackingClient;
  Invoice?: {
    category?: string;
    referencesOrder?: AdmitadReferencesOrderItem[];
  };
  dynamic?: {
    domain: string;
    name: string;
  };
  Helpers?: Record<string, unknown>;
}

export interface WebEngageUserClient {
  login: (userId: string) => void;
  logout: () => void;
  setAttribute: (keyOrAttributes: string | Record<string, unknown>, value?: unknown) => void;
  identify?: (userId: string) => void;
}

export interface WebEngageClient {
  init: (licenseCode: string) => void;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  onReady: (callback: () => void) => void;
  options?: (...args: unknown[]) => void;
  screen?: (...args: unknown[]) => void;
  user?: WebEngageUserClient;
  __v?: string;
  __queue?: unknown[];
  is_spa?: number;
  __loaded?: boolean;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    /** Last GTM container id injected by the site GTM bootstrap. */
    __palmonasGtmId?: string;
    pintrk?: PintrkFunction;
    spotify?: SpotifyPixelFunction;
    SpotifyPixelObject?: string;
    ADMITAD?: AdmitadGlobal;
    mixpanel?: MixpanelClient;
    clarity?: ClarityFunction;
    webengage?: WebEngageClient;
    webengageInitialized?: boolean;
  }
}

export {};
