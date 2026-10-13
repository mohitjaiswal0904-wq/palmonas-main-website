import {
  analyticsCanonicalEvents,
  analyticsDefaultCurrency,
  analyticsEventMappingRegistry,
  analyticsLazyInitProviderIds,
  analyticsPixelOnlyProviderIds,

  gokwikAnalyticsEvents,
  mixpanelDistinctIdCookieDays,
  mixpanelDistinctIdStorageKey,
  mixpanelInitDelayMs,

  mixpanelIgnoredEvents,
  mixpanelSessionReplay,
} from '@/config/analytics/analytics.config';

describe('analytics config', () => {
  it('exports default commerce currency', () => {
    expect(analyticsDefaultCurrency).toBe('INR');
  });

  it('persists Mixpanel distinct id and GoKwik pixel event names in config', () => {
    expect(mixpanelDistinctIdStorageKey).toBe('mp_palmonas_distinct_id');
    expect(mixpanelDistinctIdCookieDays).toBe(365);
    expect(mixpanelInitDelayMs).toBe(5000);
    expect(gokwikAnalyticsEvents.channel).toBe('gokwik_events');
    expect(gokwikAnalyticsEvents.orderPlaced).toBe('Order_Placed_GK');
  });

  it('marks Simprosys as pixel-only', () => {
    expect(analyticsPixelOnlyProviderIds).toEqual(['simprosys']);
  });

  it('marks WebEngage as lazy-init', () => {
    expect(analyticsLazyInitProviderIds).toEqual(['webengage']);
  });

  it('maps add_to_cart for ad platforms and existing providers', () => {
    expect(analyticsEventMappingRegistry.add_to_cart).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({ eventName: 'AddToCart' }),
        ga4: expect.objectContaining({ eventName: 'add_to_cart' }),
        googleAds: expect.objectContaining({ eventName: 'add_to_cart' }),
        pinterest: expect.objectContaining({ eventName: 'addtocart' }),
        spotify: expect.objectContaining({ eventName: 'AddToCart' }),
        mixpanel: expect.objectContaining({ eventName: 'Item Added to Cart' }),
        clarity: expect.objectContaining({ eventName: 'add_to_cart' }),
        webengage: expect.objectContaining({ eventName: 'Added To Cart' }),
      }),
    );
  });

  it('maps order_completed to purchase for GTM Google Ads + GA4 tags', () => {
    expect(analyticsEventMappingRegistry.order_completed).toEqual(
      expect.objectContaining({
        ga4: expect.objectContaining({ eventName: 'purchase' }),
        googleAds: expect.objectContaining({ eventName: 'purchase' }),
        meta: expect.objectContaining({ eventName: 'Purchase' }),
      }),
    );
  });

  it('maps purchase for Admitad and ad platforms', () => {
    expect(analyticsEventMappingRegistry.purchase).toEqual(
      expect.objectContaining({
        admitad: expect.objectContaining({ eventName: 'purchase' }),
        googleAds: expect.objectContaining({ eventName: 'conversion' }),
        pinterest: expect.objectContaining({ eventName: 'checkout' }),
        spotify: expect.objectContaining({ eventName: 'Purchase' }),
      }),
    );
  });

  it('maps click for all supported providers', () => {
    expect(analyticsEventMappingRegistry.click).toEqual(
      expect.objectContaining({
        meta: expect.objectContaining({ eventName: 'Click', standard: false }),
        ga4: expect.objectContaining({ eventName: 'click' }),
        mixpanel: expect.objectContaining({ eventName: 'Click' }),
      }),
    );
  });

  it('registers app lifecycle and navigation events', () => {
    expect(analyticsCanonicalEvents.appOpened).toBe('app_opened');
    expect(analyticsCanonicalEvents.openInAppClicked).toBe('open_in_app_clicked');
    expect(analyticsCanonicalEvents.screenViewed).toBe('screen_viewed');
    expect(analyticsEventMappingRegistry.app_opened?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'App Opened' }),
    );
    expect(analyticsEventMappingRegistry.open_in_app_clicked?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Open In App Clicked' }),
    );
    expect(analyticsEventMappingRegistry.open_in_app_clicked?.webengage).toEqual(
      expect.objectContaining({ eventName: 'Open In App Clicked' }),
    );
  });

  it('registers store call and visit click events', () => {
    expect(analyticsCanonicalEvents.callStoreClicked).toBe('call_store_clicked');
    expect(analyticsCanonicalEvents.visitStoreClicked).toBe('visit_store_clicked');
    expect(analyticsEventMappingRegistry.call_store_clicked?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Call Store Clicked' }),
    );
    expect(analyticsEventMappingRegistry.visit_store_clicked?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Visit Store Clicked' }),
    );
  });

  it('maps every canonical event in the registry', () => {
    const canonicalValues = new Set(Object.values(analyticsCanonicalEvents));
    for (const eventName of canonicalValues) {
      expect(analyticsEventMappingRegistry[eventName]).toBeDefined();
    }
  });

  it('enables Mixpanel Session Replay sampling without heatmap autocapture', () => {
    expect(mixpanelSessionReplay.recordSessionsPercent).toBeGreaterThan(0);
    expect(mixpanelSessionReplay.recordSessionsPercent).toBeLessThanOrEqual(100);
    expect(mixpanelSessionReplay.recordHeatmapData).toBe(false);
  });

  it('keeps Ads leftovers and generic clicks off Mixpanel', () => {
    expect(mixpanelIgnoredEvents.has('page_view')).toBe(true);
    expect(mixpanelIgnoredEvents.has('click')).toBe(true);
    expect(mixpanelIgnoredEvents.has('button_clicked')).toBe(true);
  });

  it('maps Mixpanel names to the retail tracking plan', () => {
    expect(analyticsCanonicalEvents.carouselScrolled).toBe('carousel_scrolled');
    expect(analyticsCanonicalEvents.purchasedItem).toBe('purchased_item');
    expect(analyticsEventMappingRegistry.pdp_viewed?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Item Detail Page Viewed' }),
    );
    expect(analyticsEventMappingRegistry.begin_checkout?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'View Checkout' }),
    );
    expect(analyticsEventMappingRegistry.filter_applied?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Search Filtered' }),
    );
    expect(analyticsEventMappingRegistry.purchased_item?.mixpanel).toEqual(
      expect.objectContaining({ eventName: 'Purchased Item' }),
    );
  });
});
