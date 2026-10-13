import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import {
  trackAppOpened,
  trackOrderCompleted,
  trackSearch,
  trackUserLogin,
} from '@/lib/analytics/analytics-trackers';

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: jest.fn().mockResolvedValue(undefined),
}));

describe('analytics trackers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackAppOpened sends canonical name with merged properties', () => {
    trackAppOpened({ source: 'cold_start' });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.appOpened,
        properties: expect.objectContaining({
          source: 'cold_start',
          platform: 'web',
        }),
      }),
    );
  });

  it('trackUserLogin aliases trackUserLoggedIn', () => {
    trackUserLogin({ login_method: 'otp' });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.userLoggedIn,
        properties: expect.objectContaining({ login_method: 'otp' }),
      }),
    );
  });

  it('trackSearch aliases trackSearchPerformed', () => {
    trackSearch({ query: 'gold ring', results_count: 12 });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.searchPerformed,
        properties: expect.objectContaining({
          query: 'gold ring',
          results_count: 12,
        }),
      }),
    );
  });

  it('trackOrderCompleted serializes products and forwards commerce value', () => {
    trackOrderCompleted({
      order_id: 'ord-1',
      total_amount: 2500,
      payment_method: 'upi',
      items_count: 1,
      products: [{ product_id: 'sku-1', quantity: 1, price: 2500 }],
    });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.orderCompleted,
        value: 2500,
        properties: expect.objectContaining({
          order_id: 'ord-1',
          transaction_id: 'ord-1',
          products_json: '[{"product_id":"sku-1","quantity":1,"price":2500}]',
        }),
      }),
    );
  });

  it('trackOrderCompleted fires purchased_item per line', () => {
    trackOrderCompleted({
      order_id: 'ord-2',
      total_amount: 4000,
      payment_method: 'upi',
      items_count: 2,
      products: [
        { product_id: 'sku-1', quantity: 1, price: 2500 },
        { product_id: 'sku-2', quantity: 1, price: 1500 },
      ],
    });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.purchasedItem,
        value: 2500,
        properties: expect.objectContaining({
          order_id: 'ord-2',
          product_id: 'sku-1',
          quantity: 1,
          price: 2500,
        }),
      }),
    );
    expect(trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: analyticsCanonicalEvents.purchasedItem,
        value: 1500,
        properties: expect.objectContaining({
          product_id: 'sku-2',
        }),
      }),
    );
  });
});
