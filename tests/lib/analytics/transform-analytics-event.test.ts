import { transformAnalyticsEvent } from '@/lib/analytics/transform-analytics-event';

describe('transformAnalyticsEvent', () => {
  it('maps canonical events to provider-specific names', async () => {
    const events = await transformAnalyticsEvent(
      {
        name: 'add_to_cart',
        properties: { product_id: 'sku-1', quantity: 1 },
        value: 1200,
      },
      ['meta', 'ga4', 'mixpanel'],
    );

    expect(events).toEqual([
      {
        provider: 'meta',
        eventName: 'AddToCart',
        properties: expect.objectContaining({
          product_id: 'sku-1',
          quantity: 1,
          value: 1200,
          currency: 'INR',
          __metaStandard: true,
        }),
      },
      {
        provider: 'ga4',
        eventName: 'add_to_cart',
        properties: expect.objectContaining({
          product_id: 'sku-1',
          value: 1200,
          currency: 'INR',
        }),
      },
      {
        provider: 'mixpanel',
        eventName: 'Item Added to Cart',
        properties: expect.objectContaining({
          product_id: 'sku-1',
          value: 1200,
          currency: 'INR',
        }),
      },
    ]);
  });

  it('passes through unknown event names when no mapping exists', async () => {
    const events = await transformAnalyticsEvent(
      { name: 'custom_banner_click', properties: { banner_id: 'hero' } },
      ['ga4'],
    );

    expect(events).toEqual([
      {
        provider: 'ga4',
        eventName: 'custom_banner_click',
        properties: { banner_id: 'hero' },
      },
    ]);
  });

  it('strips null properties before fan-out', async () => {
    const events = await transformAnalyticsEvent(
      {
        name: 'page_view',
        properties: { path: '/pop', campaign: null },
      },
      ['ga4'],
    );

    expect(events[0]?.properties).toEqual({ path: '/pop' });
  });

  it('does not send page_view or click to Mixpanel', async () => {
    const pageView = await transformAnalyticsEvent(
      { name: 'page_view', properties: { path: '/' } },
      ['mixpanel', 'googleAds'],
    );
    const click = await transformAnalyticsEvent(
      { name: 'click', properties: { label: 'x' } },
      ['mixpanel', 'ga4'],
    );

    expect(pageView.map((event) => event.provider)).toEqual(['googleAds']);
    expect(click.map((event) => event.provider)).toEqual(['ga4']);
  });

  it('maps Mixpanel funnel names from the retail tracking plan', async () => {
    const [cart] = await transformAnalyticsEvent({ name: 'cart_viewed' }, ['mixpanel']);
    const [search] = await transformAnalyticsEvent({ name: 'search_performed' }, ['mixpanel']);
    const [purchase] = await transformAnalyticsEvent({ name: 'purchase' }, ['mixpanel']);
    const [item] = await transformAnalyticsEvent({ name: 'purchased_item' }, ['mixpanel']);

    expect(cart?.eventName).toBe('Cart Viewed');
    expect(search?.eventName).toBe('Searched from Home Page');
    expect(purchase?.eventName).toBe('Purchase Completed');
    expect(item?.eventName).toBe('Purchased Item');
  });

  it('keeps the original event name for every provider when passthrough is set', async () => {
    const events = await transformAnalyticsEvent(
      {
        name: 'add_to_cart',
        properties: { product_id: 'sku-1' },
        passthroughEventName: true,
      },
      ['meta', 'ga4', 'mixpanel'],
    );

    expect(events.map((event) => event.eventName)).toEqual([
      'add_to_cart',
      'add_to_cart',
      'add_to_cart',
    ]);
  });

  it('still sends ignored Mixpanel names when passthrough is set', async () => {
    const events = await transformAnalyticsEvent(
      { name: 'page_view', passthroughEventName: true },
      ['mixpanel'],
    );

    expect(events).toEqual([
      {
        provider: 'mixpanel',
        eventName: 'page_view',
        properties: {},
      },
    ]);
  });
});
