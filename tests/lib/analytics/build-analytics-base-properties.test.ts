import { analyticsPagePropertyKeys } from '@/config/analytics/analytics.config';
import {
  clearAnalyticsAuthContext,
  setAnalyticsAuthContext,
} from '@/lib/analytics/analytics-auth-context';
import {
  clearAnalyticsPageContext,
  setAnalyticsPageContext,
} from '@/lib/analytics/analytics-page-context';
import {
  buildAnalyticsEventProperties,
  serializeAnalyticsProducts,
} from '@/lib/analytics/build-analytics-base-properties';

describe('buildAnalyticsEventProperties', () => {
  beforeEach(() => {
    clearAnalyticsAuthContext();
    clearAnalyticsPageContext();
  });

  it('merges auth, page context, platform, and timestamp', () => {
    setAnalyticsAuthContext({
      userId: 'user-1',
      sessionId: 'sess-1',
      isGuest: false,
    });
    setAnalyticsPageContext({
      pageType: 'product',
      productName: 'Ring',
      productHandle: 'ring',
    });

    const properties = buildAnalyticsEventProperties({
      source: 'deeplink',
      timestamp: 1_700_000_000_000,
    });

    expect(properties).toEqual(
      expect.objectContaining({
        timestamp: 1_700_000_000_000,
        platform: 'web',
        user_id: 'user-1',
        session_id: 'sess-1',
        is_guest: false,
        source: 'deeplink',
        [analyticsPagePropertyKeys.pageType]: 'product',
        [analyticsPagePropertyKeys.productName]: 'Ring',
        [analyticsPagePropertyKeys.productHandle]: 'ring',
      }),
    );
  });

  it('defaults timestamp when omitted', () => {
    const before = Date.now();
    const properties = buildAnalyticsEventProperties({ screen_name: 'home' });
    const after = Date.now();

    expect(properties.screen_name).toBe('home');
    expect(properties.timestamp).toBeGreaterThanOrEqual(before);
    expect(properties.timestamp).toBeLessThanOrEqual(after);
  });

  it('strips null and undefined values', () => {
    const properties = buildAnalyticsEventProperties({
      screen_name: 'cart',
      coupon_code: undefined,
      discount: null,
    });

    expect(properties).toEqual(
      expect.objectContaining({
        screen_name: 'cart',
        platform: 'web',
      }),
    );
    expect(properties).not.toHaveProperty('coupon_code');
    expect(properties).not.toHaveProperty('discount');
  });
});

describe('serializeAnalyticsProducts', () => {
  it('serializes checkout line items to JSON', () => {
    expect(
      serializeAnalyticsProducts([{ product_id: 'sku-1', quantity: 2, price: 999 }]),
    ).toBe('[{"product_id":"sku-1","quantity":2,"price":999}]');
  });
});
