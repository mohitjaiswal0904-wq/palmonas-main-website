/** @jest-environment jsdom */

import {
  buildClickAnalyticsEvent,
  buildPageViewAnalyticsEvent,
} from '@/lib/analytics/build-click-analytics-event';
import { buildRouteAnalyticsEvent } from '@/lib/analytics/build-route-analytics-event';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';

describe('buildClickAnalyticsEvent', () => {
  it('infers add_to_cart_clicked for add-to-cart buttons', () => {
    document.body.innerHTML = '<button type="button">Add to bag</button>';
    const button = document.querySelector('button');

    expect(
      buildClickAnalyticsEvent(button, {
        pathname: '/products/ring',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.addToCartClicked,
      properties: {
        element_type: 'button',
        label: 'Add to bag',
        path: '/products/ring',
        screen_name: '/products/ring',
        page_type: 'product',
        product_handle: 'ring',
        product_id: 'ring',
        button_name: 'Add to bag',
      },
    });
  });

  it('uses data-analytics-event and data-analytics-name overrides', () => {
    document.body.innerHTML =
      '<button type="button" data-analytics-event="add_to_cart" data-analytics-name="pdp-add">Add</button>';
    const button = document.querySelector('button');

    expect(
      buildClickAnalyticsEvent(button, {
        pathname: '/products/ring',
        search: 'size=7',
      }),
    ).toEqual({
      name: 'add_to_cart',
      properties: {
        element_type: 'button',
        label: 'pdp-add',
        path: '/products/ring',
        screen_name: '/products/ring',
        page_type: 'product',
        product_handle: 'ring',
        search: 'size=7',
      },
    });
  });

  it('does not infer navigation_clicked for untagged internal links', () => {
    document.body.innerHTML = '<a href="/offers">Offers</a>';
    const link = document.querySelector('a');

    expect(
      buildClickAnalyticsEvent(link, {
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
  });

  it('uses data-analytics-event for the open-in-app CTA', () => {
    document.body.innerHTML =
      '<a href="https://play.google.com/store" data-analytics-event="open_in_app_clicked" aria-label="Open Palmonas app in store">Open in App</a>';

    expect(
      buildClickAnalyticsEvent(document.querySelector('a'), {
        pathname: '/',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.openInAppClicked,
      properties: {
        element_type: 'link',
        label: 'Open Palmonas app in store',
        path: '/',
        screen_name: '/',
        href: 'https://play.google.com/store',
      },
    });
  });

  it('uses data-analytics-event for call store and visit store CTAs', () => {
    document.body.innerHTML = `
      <a href="tel:9876543210" data-analytics-event="call_store_clicked" data-analytics-props='{"store_name":"Koregaon Park"}' aria-label="Call Koregaon Park store">Call Store</a>
      <a href="https://maps.example.com" data-analytics-event="visit_store_clicked" data-analytics-props='{"store_name":"Koregaon Park"}' aria-label="Visit Koregaon Park store on map">Visit Store</a>
    `;

    expect(
      buildClickAnalyticsEvent(document.querySelector('[data-analytics-event="call_store_clicked"]'), {
        pathname: '/products/hearts-bracelet',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.callStoreClicked,
      properties: {
        element_type: 'link',
        label: 'Call Koregaon Park store',
        path: '/products/hearts-bracelet',
        screen_name: '/products/hearts-bracelet',
        page_type: 'product',
        product_handle: 'hearts-bracelet',
        href: 'tel:9876543210',
        store_name: 'Koregaon Park',
      },
    });

    expect(
      buildClickAnalyticsEvent(document.querySelector('[data-analytics-event="visit_store_clicked"]'), {
        pathname: '/products/hearts-bracelet',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.visitStoreClicked,
      properties: {
        element_type: 'link',
        label: 'Visit Koregaon Park store on map',
        path: '/products/hearts-bracelet',
        screen_name: '/products/hearts-bracelet',
        page_type: 'product',
        product_handle: 'hearts-bracelet',
        href: 'https://maps.example.com',
        store_name: 'Koregaon Park',
      },
    });
  });

  it('returns null for untagged non-navigational clicks', () => {
    document.body.innerHTML = '<button type="button">Dismiss</button>';

    expect(
      buildClickAnalyticsEvent(document.querySelector('button'), {
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
  });

  it('returns null for ignored elements and non-interactive targets', () => {
    document.body.innerHTML =
      '<div data-analytics-ignore><button type="button">Skip</button></div><span>text</span>';

    expect(
      buildClickAnalyticsEvent(document.querySelector('button'), {
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
    expect(
      buildClickAnalyticsEvent(document.querySelector('span'), {
        pathname: '/',
        search: '',
      }),
    ).toBeNull();
  });
});

describe('buildRouteAnalyticsEvent', () => {
  it('maps product routes to pdp_viewed', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/products/gold-ring',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.pdpViewed,
      properties: {
        path: '/products/gold-ring',
        page_type: 'product',
        product_handle: 'gold-ring',
        product_id: 'gold-ring',
        screen_name: 'Products Gold ring',
      },
      value: 1,
      currency: 'INR',
    });
  });

  it('maps collection routes to plp_viewed', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/collections/bestsellers',
        search: '',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.plpViewed,
      properties: {
        path: '/collections/bestsellers',
        page_type: 'collection',
        collection_handle: 'bestsellers',
        collection_id: 'bestsellers',
        collection_name: 'bestsellers',
        screen_name: 'Collections Bestsellers',
      },
    });
  });

  it('maps cart route to cart_viewed', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/cart',
        search: 'step=1',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.cartViewed,
      properties: {
        path: '/cart',
        search: 'step=1',
        screen_name: 'Cart',
        items_count: 0,
      },
    });
  });

  it('maps home route to home_viewed', () => {
    expect(
      buildRouteAnalyticsEvent({
        pathname: '/',
        search: 'category=gold',
      }),
    ).toEqual({
      name: analyticsCanonicalEvents.homeViewed,
      properties: {
        path: '/',
        search: 'category=gold',
        screen_name: 'Home',
        collections_shown_count: 0,
      },
    });
  });
});

describe('buildPageViewAnalyticsEvent', () => {
  it('delegates to semantic route events', () => {
    expect(buildPageViewAnalyticsEvent('/cart', '')).toEqual({
      name: analyticsCanonicalEvents.cartViewed,
      properties: {
        path: '/cart',
        screen_name: 'Cart',
        items_count: 0,
      },
    });
  });
});
