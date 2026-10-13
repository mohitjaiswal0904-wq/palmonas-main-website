/** Shared base fields for GoKwik checkout and KwikPass login. */
export interface GokwikMerchantInfoBase {
  mid: string;
  environment: string;
  type: 'merchantInfo';
}

/** KwikPass login — integration doc fields on top of base. */
export interface KwikpassMerchantInfo extends GokwikMerchantInfoBase {
  integrationType: 'CUSTOM_SHOPIFY';
}

/** GoKwik checkout — Scenario 2 doc fields on top of base. */
export interface CheckoutMerchantInfo extends GokwikMerchantInfoBase {
  storeId?: number;
  fbPixel?: string;
  cart?: { id: string };
  utmParams?: Record<string, string>;
  /** Public storefront URL GoKwik should record instead of the Shopify shop domain. */
  full_url?: string;
  returnUrl?: string;
}

/** @deprecated Use CheckoutMerchantInfo */
export type GokwikMerchantInfo = CheckoutMerchantInfo;

/** KwikPass CUSTOM_SHOPIFY SDK instance on window (vendor globals). */
export interface KwikpassSdkInstance {
  handleKpLogin?: () => void;
}

/** Payload detail on KwikPass `kp_data_sent` custom event. */
export interface KpDataSentDetail {
  kpToken?: string;
  success?: boolean;
  error?: string;
  kpLogout?: boolean;
}

/** GoKwik checkout SDK surface exposed on window after merchant.integration.js loads. */
export interface GokwikSdkInstance {
  init?: () => void;
  initCheckout?: (merchantInfo: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    merchantInfo?: Record<string, unknown>;
    __KP_LOGIN_SDK_INSTANCE__?: KwikpassSdkInstance;
    handleLogout?: (redirectTo?: string) => void;
    handleDOMUpdate?: () => void;
    kpUpdateDOM?: () => void;
    gokwikSdk?: GokwikSdkInstance;
    triggerGokwikCustomCheckout?: () => void;
  }
}

export {};
