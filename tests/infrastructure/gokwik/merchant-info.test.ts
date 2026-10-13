import {
  applyCheckoutMerchantInfo,
  applyKwikpassMerchantInfo,
  applyPalmonasGokwikMerchantInfo,
  buildActiveCheckoutMerchantInfo,
  buildCheckoutMerchantInfo,
  buildKwikpassMerchantInfo,
  buildUnifiedMerchantInfo,
  getCheckoutMerchantInfoInlineScript,
  getKwikpassMerchantInfoInlineScript,
} from '@/infrastructure/gokwik/merchant-info';

jest.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_KWIKPASS_MERCHANT_ID: 'test-mid',
    NEXT_PUBLIC_KWIKPASS_ENVIRONMENT: 'sandbox',
    NEXT_PUBLIC_KWIKPASS_SHOP_DOMAIN: 'palmonas.myshopify.com',
    NEXT_PUBLIC_GOKWIK_FB_PIXEL: 'pixel-1,pixel-2',
  },
  getGokwikStoreId: () => 123456,
}));

describe('gokwik merchant-info', () => {
  it('buildKwikpassMerchantInfo returns login fields on base type', () => {
    expect(buildKwikpassMerchantInfo()).toEqual({
      mid: 'test-mid',
      environment: 'sandbox',
      type: 'merchantInfo',
      integrationType: 'CUSTOM_SHOPIFY',
    });
  });

  it('buildCheckoutMerchantInfo returns Scenario 2 checkout fields', () => {
    expect(buildCheckoutMerchantInfo()).toEqual({
      mid: 'test-mid',
      environment: 'sandbox',
      type: 'merchantInfo',
      storeId: 123456,
      fbPixel: 'pixel-1,pixel-2',
    });
  });

  it('buildActiveCheckoutMerchantInfo adds cart and utm without login fields', () => {
    expect(
      buildActiveCheckoutMerchantInfo('gid://shopify/Cart/1', { utm_source: 'web' }),
    ).toEqual({
      mid: 'test-mid',
      environment: 'sandbox',
      type: 'merchantInfo',
      storeId: 123456,
      fbPixel: 'pixel-1,pixel-2',
      cart: { id: 'gid://shopify/Cart/1' },
      utmParams: { utm_source: 'web' },
    });
  });

  it('buildUnifiedMerchantInfo merges login and checkout fields', () => {
    expect(buildUnifiedMerchantInfo()).toEqual({
      mid: 'test-mid',
      environment: 'sandbox',
      shopDomain: 'palmonas.myshopify.com',
      type: 'merchantInfo',
      integrationType: 'CUSTOM_SHOPIFY',
      storeId: 123456,
      fbPixel: 'pixel-1,pixel-2',
    });
  });

  it('getCheckoutMerchantInfoInlineScript embeds checkout merchantInfo as merge', () => {
    const script = getCheckoutMerchantInfoInlineScript();
    expect(script).toContain('window.merchantInfo');
    expect(script).toContain('...(window.merchantInfo || {})');
    expect(script).toContain('"storeId":123456');
    expect(script).not.toContain('"integrationType"');
    expect(script).not.toContain('"shopDomain"');
  });

  it('getKwikpassMerchantInfoInlineScript embeds login-only merchantInfo', () => {
    const script = getKwikpassMerchantInfoInlineScript();
    expect(script).toContain('"integrationType":"CUSTOM_SHOPIFY"');
    expect(script).not.toContain('"storeId"');
  });

  it('applyCheckoutMerchantInfo merges checkout fields and keeps existing login keys', () => {
    window.merchantInfo = {
      integrationType: 'CUSTOM_SHOPIFY',
      shopDomain: 'palmonas.myshopify.com',
      type: 'merchantInfo',
    };

    applyCheckoutMerchantInfo();

    expect(window.merchantInfo).toEqual({
      integrationType: 'CUSTOM_SHOPIFY',
      shopDomain: 'palmonas.myshopify.com',
      type: 'merchantInfo',
      mid: 'test-mid',
      environment: 'sandbox',
      storeId: 123456,
      fbPixel: 'pixel-1,pixel-2',
    });
  });

  it('applyKwikpassMerchantInfo merges login fields without adding checkout storeId', () => {
    window.merchantInfo = { storeId: 999, type: 'merchantInfo' };

    applyKwikpassMerchantInfo();

    expect(window.merchantInfo).toEqual({
      storeId: 999,
      type: 'merchantInfo',
      mid: 'test-mid',
      environment: 'sandbox',
      integrationType: 'CUSTOM_SHOPIFY',
    });
  });

  it('applyPalmonasGokwikMerchantInfo preserves existing merchantInfo keys', () => {
    window.merchantInfo = { cart: { id: 'gid://shopify/Cart/1' } };

    applyPalmonasGokwikMerchantInfo();

    expect(window.merchantInfo).toEqual(
      expect.objectContaining({
        cart: { id: 'gid://shopify/Cart/1' },
        integrationType: 'CUSTOM_SHOPIFY',
        mid: 'test-mid',
      }),
    );
  });
});
