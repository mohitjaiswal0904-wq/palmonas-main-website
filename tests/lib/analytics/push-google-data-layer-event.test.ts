/** @jest-environment jsdom */

import { pushGoogleDataLayerEvent } from '@/lib/analytics/push-google-data-layer-event';

describe('pushGoogleDataLayerEvent', () => {
  beforeEach(() => {
    delete window.gtag;
    window.dataLayer = [];
  });

  it('pushes to dataLayer and gtag when gtag is defined', () => {
    const gtag = jest.fn();
    window.gtag = gtag;

    pushGoogleDataLayerEvent('add_to_cart', { value: 999, currency: 'INR' });

    expect(window.dataLayer).toEqual([{ event: 'add_to_cart', value: 999, currency: 'INR' }]);
    expect(gtag).toHaveBeenCalledWith('event', 'add_to_cart', {
      value: 999,
      currency: 'INR',
    });
  });

  it('pushes to dataLayer when gtag is not defined', () => {
    pushGoogleDataLayerEvent('pdp_viewed', { product_id: 'sku-1' });

    expect(window.dataLayer).toEqual([{ event: 'pdp_viewed', product_id: 'sku-1' }]);
  });

  it('pushes purchase fields for GTM Google Ads conversion tags', () => {
    pushGoogleDataLayerEvent('purchase', {
      transaction_id: 'ORDER123',
      value: 4999,
      currency: 'INR',
    });

    expect(window.dataLayer).toEqual([
      {
        event: 'purchase',
        transaction_id: 'ORDER123',
        value: 4999,
        currency: 'INR',
      },
    ]);
  });
});
