/** @jest-environment jsdom */

import { resolveSemanticClickEvent } from '@/lib/analytics/resolve-semantic-click-event';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';

describe('resolveSemanticClickEvent', () => {
  it('infers buy_now_clicked from button label', () => {
    document.body.innerHTML =
      '<button type="button" aria-label="Buy it now">Buy it now</button>';

    expect(
      resolveSemanticClickEvent(document.querySelector('button')!, {
        pathname: '/products/ring',
        search: '',
      }),
    ).toEqual({
      eventName: analyticsCanonicalEvents.buyNowClicked,
      properties: expect.objectContaining({
        product_id: 'ring',
        button_name: 'Buy it now',
      }),
    });
  });

  it('infers plp_product_clicked for product links on collection pages', () => {
    document.body.innerHTML = '<a href="/products/gold-ring">Gold ring</a>';

    expect(
      resolveSemanticClickEvent(document.querySelector('a')!, {
        pathname: '/collections/bestsellers',
        search: '',
      }),
    ).toEqual({
      eventName: analyticsCanonicalEvents.plpProductClicked,
      properties: {
        sku: 'gold-ring',
        collection_id: 'bestsellers',
        collection_name: 'bestsellers',
        screen_name: '/collections/bestsellers',
      },
    });
  });

  it('does not infer events for untagged home links', () => {
    document.body.innerHTML = '<a href="/collections/gold">Gold</a>';

    expect(
      resolveSemanticClickEvent(document.querySelector('a')!, {
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
  });

  it('does not infer events for product links outside a collection', () => {
    document.body.innerHTML = '<a href="/products/gold-ring">Gold ring</a>';

    expect(
      resolveSemanticClickEvent(document.querySelector('a')!, {
        pathname: '/search',
        search: '',
      }),
    ).toBeNull();
  });
});
