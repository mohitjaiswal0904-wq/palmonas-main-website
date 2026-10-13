import rawConfig from '@/config/layout/mobile-app-nudge.config.json';

interface MobileAppNudgeRawConfig {
  constants: {
    dismissStorageKey: string;
  };
  storeUrls: {
    iosUrl: string;
    androidUrl: string;
  };
  messages: {
    labels: {
      title: string;
      subtitle: string;
      cta: string;
    };
    a11y: {
      regionLabel: string;
      close: string;
      openInApp: string;
    };
  };
}

const mobileAppNudgeConfig = rawConfig as MobileAppNudgeRawConfig;

/** localStorage key for dismissed mobile app nudge. */
export const mobileAppNudgeDismissStorageKey = mobileAppNudgeConfig.constants.dismissStorageKey;

/** App store URLs for the mobile download nudge. */
export const mobileAppNudgeStoreUrls = mobileAppNudgeConfig.storeUrls;

/** User-facing copy for the mobile app download nudge. */
export const mobileAppNudgeMessages = mobileAppNudgeConfig.messages;
