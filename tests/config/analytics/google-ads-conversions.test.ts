import {
  analyticsGoogleAdsConversions,
  resolveGoogleAdsConversionAction,
  resolveGoogleAdsConversionSendTo,
} from '@/config/analytics/analytics.config';

describe('google ads conversion helpers (GTM reference labels)', () => {
  it('exposes all Google Shopping App send_to labels for GTM tag setup', () => {
    expect(analyticsGoogleAdsConversions).toEqual({
      purchase: 'AW-10856259903/HCLTCODigaMDEL_C1bgo',
      add_to_cart: 'AW-10856259903/QDEVCObigaMDEL_C1bgo',
      begin_checkout: 'AW-10856259903/TNnuCOnigaMDEL_C1bgo',
      add_payment_info: 'AW-10856259903/A3h5CO_igaMDEL_C1bgo',
      search: 'AW-10856259903/fWkQCOzigaMDEL_C1bgo',
      page_view: 'AW-10856259903/5h6uCN3igaMDEL_C1bgo',
      view_item: 'AW-10856259903/xDYiCOPigaMDEL_C1bgo',
    });
  });

  it('maps commerce and engagement events to conversion actions', () => {
    expect(resolveGoogleAdsConversionAction('purchase')).toBe('purchase');
    expect(resolveGoogleAdsConversionAction('add_to_cart')).toBe('add_to_cart');
    expect(resolveGoogleAdsConversionAction('begin_checkout')).toBe('begin_checkout');
    expect(resolveGoogleAdsConversionAction('checkout_started')).toBe('begin_checkout');
    expect(resolveGoogleAdsConversionAction('add_payment_info')).toBe('add_payment_info');
    expect(resolveGoogleAdsConversionAction('payment_initiated')).toBe('add_payment_info');
    expect(resolveGoogleAdsConversionAction('search')).toBe('search');
    expect(resolveGoogleAdsConversionAction('search_results_viewed')).toBe('search');
    expect(resolveGoogleAdsConversionAction('page_view')).toBe('page_view');
    expect(resolveGoogleAdsConversionAction('view_item')).toBe('view_item');
    expect(resolveGoogleAdsConversionAction('pdp_viewed')).toBe('view_item');
  });

  it('resolves send_to labels for Google Ads conversion tags', () => {
    expect(resolveGoogleAdsConversionSendTo('begin_checkout')).toBe(
      'AW-10856259903/TNnuCOnigaMDEL_C1bgo',
    );
    expect(resolveGoogleAdsConversionSendTo('add_to_cart')).toBe(
      'AW-10856259903/QDEVCObigaMDEL_C1bgo',
    );
    expect(resolveGoogleAdsConversionSendTo('add_payment_info')).toBe(
      'AW-10856259903/A3h5CO_igaMDEL_C1bgo',
    );
    expect(resolveGoogleAdsConversionSendTo('search')).toBe(
      'AW-10856259903/fWkQCOzigaMDEL_C1bgo',
    );
    expect(resolveGoogleAdsConversionSendTo('page_view')).toBe(
      'AW-10856259903/5h6uCN3igaMDEL_C1bgo',
    );
    expect(resolveGoogleAdsConversionSendTo('view_item')).toBe(
      'AW-10856259903/xDYiCOPigaMDEL_C1bgo',
    );
  });
});
