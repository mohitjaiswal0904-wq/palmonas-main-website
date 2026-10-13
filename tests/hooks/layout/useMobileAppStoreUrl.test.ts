import { renderHook } from '@testing-library/react';

import { getMobileAppStoreUrl, useMobileAppStoreUrl } from '@/hooks/layout/useMobileAppStoreUrl';

const storeUrls = {
  ios: 'https://apps.apple.com/app/id6475709735',
  android: 'https://play.google.com/store/apps/details?id=com.palmonas',
};

describe('useMobileAppStoreUrl', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0',
        maxTouchPoints: 0,
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: originalNavigator,
    });
  });

  it('returns null on desktop', () => {
    const { result } = renderHook(() => useMobileAppStoreUrl());

    expect(result.current).toBeNull();
  });

  it('returns Play Store URL on Android', () => {
    Object.defineProperty(global, 'navigator', {
      configurable: true,
      value: {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36',
        maxTouchPoints: 5,
      },
    });

    const { result } = renderHook(() => useMobileAppStoreUrl());

    expect(result.current).toBe(storeUrls.android);
    expect(getMobileAppStoreUrl()).toBe(storeUrls.android);
  });
});
