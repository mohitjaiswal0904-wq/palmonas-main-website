/** @jest-environment jsdom */

jest.mock('@/infrastructure/analytics/load-client-script', () => ({
  loadClientScript: jest.fn().mockResolvedValue(undefined),
  waitForAnalyticsReady: jest.fn().mockResolvedValue(true),
}));

import { createMetaPixelClient } from '@/infrastructure/analytics/clients/meta.client';
import {
  buildMetaPixelIdentityFromAuthUser,
  setMetaPixelIdentity,
} from '@/lib/analytics/meta-pixel-identity';
import { META_STANDARD_PROPERTY } from '@/lib/analytics/sanitize-analytics-properties';

describe('createMetaPixelClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMetaPixelIdentity(null);
    delete window.fbq;
    delete window._fbq;
  });

  it('initializes Meta Pixel with advanced matching when identity is available', async () => {
    const fbq = jest.fn();
    window.fbq = fbq;

    setMetaPixelIdentity(
      buildMetaPixelIdentityFromAuthUser({
        id: 'user-1',
        firstName: 'Asha',
        lastName: 'Sharma',
        email: 'user@example.com',
        phoneNumber: '9876543210',
        profilePicture: null,
        gender: 'female',
        isGuest: false,
      }),
    );

    const client = createMetaPixelClient('meta-pixel-1');
    expect(await client.init()).toBe(true);

    expect(fbq).toHaveBeenCalledWith('init', 'meta-pixel-1', {
      em: 'user@example.com',
      ph: '+919876543210',
      external_id: 'user-1',
      fn: 'asha',
      ln: 'sharma',
      ge: 'f',
      country: 'in',
    });
  });

  it('tracks standard ecommerce events with enriched payloads', async () => {
    const fbq = jest.fn();
    window.fbq = fbq;
    document.cookie = '_fbp=fbp-value';

    const client = createMetaPixelClient('meta-pixel-1');
    expect(await client.init()).toBe(true);

    await client.track('Purchase', {
      value: 2499,
      currency: 'INR',
      product_id: 'SKU123',
      quantity: 1,
      price: 2499,
      order_id: 'ord-1',
      [META_STANDARD_PROPERTY]: true,
    });

    expect(fbq).toHaveBeenCalledWith(
      'track',
      'Purchase',
      expect.objectContaining({
        value: 2499,
        currency: 'INR',
        content_ids: ['SKU123'],
        content_type: 'product',
        num_items: 1,
        order_id: 'ord-1',
        fbp: 'fbp-value',
        eventID: expect.any(String),
      }),
    );
  });

  it('re-inits advanced matching on identify', async () => {
    const fbq = jest.fn();
    window.fbq = fbq;

    setMetaPixelIdentity(
      buildMetaPixelIdentityFromAuthUser({
        id: 'user-2',
        firstName: 'Riya',
        lastName: 'Kapoor',
        email: 'shopper@example.com',
        phoneNumber: '9123456789',
        profilePicture: null,
        gender: 'female',
        isGuest: false,
      }),
    );

    const client = createMetaPixelClient('meta-pixel-1');
    expect(await client.init()).toBe(true);
    fbq.mockClear();

    await client.identify?.('distinct-id');

    expect(fbq).toHaveBeenCalledWith('init', 'meta-pixel-1', {
      em: 'shopper@example.com',
      ph: '+919123456789',
      external_id: 'user-2',
      fn: 'riya',
      ln: 'kapoor',
      ge: 'f',
      country: 'in',
    });
  });

  it('tracks custom events when the transform flag is absent', async () => {
    const fbq = jest.fn();
    window.fbq = fbq;

    const client = createMetaPixelClient('meta-pixel-1');
    expect(await client.init()).toBe(true);

    await client.track('pdp_viewed', {
      product_id: 'SKU999',
      value: 999,
      currency: 'INR',
    });

    expect(fbq).toHaveBeenCalledWith(
      'trackCustom',
      'pdp_viewed',
      expect.objectContaining({
        product_id: 'SKU999',
        eventID: expect.any(String),
      }),
    );
  });
});
