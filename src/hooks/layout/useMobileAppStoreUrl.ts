import { useSyncExternalStore } from 'react';

import { mobileAppNudgeStoreUrls } from '@/config/layout/mobile-app-nudge.config';
import {
  detectMobileAppPlatformFromNavigator,
  resolveMobileAppStoreUrl,
} from '@/lib/utils/mobile-app-store';

const subscribeNoop = (): (() => void) => () => undefined;

/**
 * Resolves the mobile app store URL from the current browser environment.
 *
 * @returns App Store or Play Store URL on iOS/Android; null on SSR and desktop.
 */
export function getMobileAppStoreUrl(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return resolveMobileAppStoreUrl(
    navigator.userAgent,
    {
      ios: mobileAppNudgeStoreUrls.iosUrl,
      android: mobileAppNudgeStoreUrls.androidUrl,
    },
    detectMobileAppPlatformFromNavigator(),
  );
}

/**
 * Resolves the mobile app store URL on the client via `useSyncExternalStore`.
 */
export function useMobileAppStoreUrl(): string | null {
  return useSyncExternalStore(subscribeNoop, getMobileAppStoreUrl, () => null);
}
