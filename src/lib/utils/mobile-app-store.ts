/** Mobile app store platform detected from the user agent. */
export type MobileAppPlatform = 'ios' | 'android';

export interface MobileAppStoreUrls {
  ios: string;
  android: string;
}

/**
 * Detects iOS or Android from a browser user agent string.
 *
 * @param userAgent - Browser user agent (e.g. `navigator.userAgent`).
 * @returns Platform when recognised; otherwise null (desktop or unknown mobile).
 */
export function detectMobileAppPlatform(userAgent: string): MobileAppPlatform | null {
  const ua = userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return 'ios';
  }

  if (/android/.test(ua)) {
    return 'android';
  }

  return null;
}

/**
 * Detects iOS or Android using user agent plus Client Hints and iPad desktop UA quirks.
 *
 * @returns Platform when recognised; otherwise null.
 */
export function detectMobileAppPlatformFromNavigator(): MobileAppPlatform | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  const fromUserAgent = detectMobileAppPlatform(navigator.userAgent);
  if (fromUserAgent) {
    return fromUserAgent;
  }

  if (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1) {
    return 'ios';
  }

  const clientHintPlatform = getNavigatorClientHintPlatform();
  if (clientHintPlatform === 'android') {
    return 'android';
  }

  if (clientHintPlatform === 'ios') {
    return 'ios';
  }

  return null;
}

/**
 * Reads Chromium Client Hints platform when available.
 */
function getNavigatorClientHintPlatform(): string | null {
  if (typeof navigator === 'undefined' || !('userAgentData' in navigator)) {
    return null;
  }

  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } })
    .userAgentData?.platform;

  return typeof platform === 'string' ? platform.toLowerCase() : null;
}

/**
 * Resolves the app store URL for the current mobile platform.
 *
 * @param userAgent - Browser user agent.
 * @param urls - iOS App Store and Google Play URLs from config.
 * @param platformOverride - Optional platform from {@link detectMobileAppPlatformFromNavigator}.
 * @returns Store URL on iOS/Android; null on desktop or unknown mobile.
 */
export function resolveMobileAppStoreUrl(
  userAgent: string,
  urls: MobileAppStoreUrls,
  platformOverride?: MobileAppPlatform | null,
): string | null {
  const platform = platformOverride ?? detectMobileAppPlatform(userAgent);

  if (platform === 'ios') {
    return urls.ios;
  }

  if (platform === 'android') {
    return urls.android;
  }

  return null;
}
