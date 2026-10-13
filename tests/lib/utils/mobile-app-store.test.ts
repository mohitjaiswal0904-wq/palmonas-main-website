import {
  detectMobileAppPlatform,
  detectMobileAppPlatformFromNavigator,
  resolveMobileAppStoreUrl,
} from '@/lib/utils/mobile-app-store';

const storeUrls = {
  ios: 'https://apps.apple.com/app/id6475709735',
  android: 'https://play.google.com/store/apps/details?id=com.palmonas',
};

describe('detectMobileAppPlatform', () => {
  it('detects iOS from iPhone user agent', () => {
    expect(
      detectMobileAppPlatform(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ),
    ).toBe('ios');
  });

  it('detects Android from Android user agent', () => {
    expect(detectMobileAppPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36'))
      .toBe('android');
  });

  it('returns null for desktop Chrome', () => {
    expect(
      detectMobileAppPlatform(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
      ),
    ).toBeNull();
  });

  it('returns null for unknown mobile user agent', () => {
    expect(detectMobileAppPlatform('Mozilla/5.0 (Mobile; Windows Phone 10)')).toBeNull();
  });
});

describe('resolveMobileAppStoreUrl', () => {
  it('returns App Store URL on iOS', () => {
    expect(
      resolveMobileAppStoreUrl('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', storeUrls),
    ).toBe(storeUrls.ios);
  });

  it('returns Play Store URL on Android', () => {
    expect(
      resolveMobileAppStoreUrl('Mozilla/5.0 (Linux; Android 14; SM-S911B)', storeUrls),
    ).toBe(storeUrls.android);
  });

  it('returns null on desktop', () => {
    expect(
      resolveMobileAppStoreUrl(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        storeUrls,
      ),
    ).toBeNull();
  });
});

describe('detectMobileAppPlatformFromNavigator', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('detects Android from Client Hints when user agent omits Android', () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'Mozilla/5.0 (Linux; x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
        maxTouchPoints: 5,
        userAgentData: { platform: 'Android' },
      },
    });

    expect(detectMobileAppPlatformFromNavigator()).toBe('android');
  });

  it('detects iPad with desktop Macintosh user agent', () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko)',
        maxTouchPoints: 5,
        userAgentData: undefined,
      },
    });

    expect(detectMobileAppPlatformFromNavigator()).toBe('ios');
  });
});
