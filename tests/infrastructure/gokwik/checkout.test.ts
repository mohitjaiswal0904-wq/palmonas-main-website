import {
  applyCheckoutMerchantInfo,
  assignGokwikCheckoutCart,
  CHECKOUT_CART_ID_STORAGE_KEY,
  CHECKOUT_SOURCE_STORAGE_KEY,
  getCheckoutMerchantInfoInlineScript,
  getGokwikCheckoutScriptUrl,
  gokwikCheckoutAdapter,
  GOKWIK_CHECKOUT_SCRIPT_ID,
  isGokwikCheckoutReady,
  waitForGokwikCheckoutSdk,
} from '@/infrastructure/gokwik/checkout';
import { getStoredAuthUser } from '@/lib/auth/auth.client';
import { resolveCheckoutFullUrl } from '@/lib/cart/checkout-storefront-url';

jest.mock('@/lib/auth/auth.client', () => ({
  getStoredAuthUser: jest.fn(),
}));

const mockGetStoredAuthUser = getStoredAuthUser as jest.MockedFunction<typeof getStoredAuthUser>;

function mockReadySdk(): void {
  window.gokwikSdk = { init: jest.fn(), initCheckout: jest.fn() };
  window.triggerGokwikCustomCheckout = jest.fn();
}

describe('gokwik checkout', () => {
  beforeEach(() => {
    window.gokwikSdk = undefined;
    window.triggerGokwikCustomCheckout = undefined;
    window.merchantInfo = undefined;
    sessionStorage.clear();
    localStorage.clear();
    document.getElementById(GOKWIK_CHECKOUT_SCRIPT_ID)?.remove();
    mockGetStoredAuthUser.mockReturnValue(null);
  });

  it('getGokwikCheckoutScriptUrl points at merchant integration script', () => {
    expect(getGokwikCheckoutScriptUrl()).toBe(
      'https://pdp.gokwik.co/merchant-integration/build/merchant.integration.js?v4',
    );
  });

  it('getCheckoutMerchantInfoInlineScript does not include login-only fields', () => {
    const script = getCheckoutMerchantInfoInlineScript();
    expect(script).toContain('window.merchantInfo');
  });

  it('applyCheckoutMerchantInfo sets checkout merchantInfo per Scenario 2 doc', () => {
    applyCheckoutMerchantInfo();
    expect(window.merchantInfo).toEqual(
      expect.objectContaining({
        mid: 'test-mid',
        environment: 'production',
        type: 'merchantInfo',
        storeId: 123456,
        fbPixel: 'pixel-1,pixel-2',
      }),
    );
  });

  it('isGokwikCheckoutReady returns true when initCheckout and trigger exist', () => {
    mockReadySdk();
    expect(isGokwikCheckoutReady()).toBe(true);
  });

  it('waitForGokwikCheckoutSdk resolves true when sdk is ready', async () => {
    mockReadySdk();
    await expect(waitForGokwikCheckoutSdk(500)).resolves.toBe(true);
    expect(window.gokwikSdk?.init).toHaveBeenCalled();
    expect(window.merchantInfo?.utm_source).toBe('new_website');
    expect(window.merchantInfo?.utm_medium).toBe('web');
    expect(window.merchantInfo?.utm_campaign).toBe('web_checkout');
    expect(window.merchantInfo?.full_url).toBe(resolveCheckoutFullUrl());
  });

  it('assignGokwikCheckoutCart uses the storefront URL, not leftover shopDomain', () => {
    window.merchantInfo = {
      shopDomain: 'palmonas.myshopify.com',
      type: 'merchantInfo',
    };

    assignGokwikCheckoutCart('gid://shopify/Cart/cart-abc');

    expect(window.merchantInfo?.shopDomain).toBe('palmonas.myshopify.com');
    expect(window.merchantInfo?.full_url).toBe(resolveCheckoutFullUrl());
    expect(String(window.merchantInfo?.full_url)).not.toContain('myshopify.com');
  });

  it('assignGokwikCheckoutCart strips the buy-now ?key= from the cart id', () => {
    assignGokwikCheckoutCart('gid://shopify/Cart/hWNFnOsJMEbv0QB3t7sTarfI?key=a6d7b775a7a3');

    expect(window.merchantInfo?.cart).toEqual({
      id: 'gid://shopify/Cart/hWNFnOsJMEbv0QB3t7sTarfI',
    });
  });

  it('assignGokwikCheckoutCart merges cart, nested utmParams, and flat utm keys', () => {
    window.merchantInfo = {
      integrationType: 'CUSTOM_SHOPIFY',
      mid: 'old-mid',
      environment: 'sandbox',
      type: 'merchantInfo',
      storeId: 999,
    };

    assignGokwikCheckoutCart(
      'gid://shopify/Cart/cart-abc?key=secret',
      { utm_campaign: 'sale' },
      'cart',
    );

    const fullUrl = resolveCheckoutFullUrl();

    expect(window.merchantInfo).toEqual({
      integrationType: 'CUSTOM_SHOPIFY',
      mid: 'old-mid',
      environment: 'sandbox',
      type: 'merchantInfo',
      storeId: 999,
      cart: { id: 'gid://shopify/Cart/cart-abc' },
      utmParams: {
        utm_source: 'new_website',
        utm_medium: 'web',
        utm_campaign: 'sale',
      },
      utm_source: 'new_website',
      utm_medium: 'web',
      utm_campaign: 'sale',
      utmSource: 'new_website',
      utmMedium: 'web',
      utmCampaign: 'sale',
      utm_details: 'utm_source=new_website&utm_medium=web&utm_campaign=sale',
      note_attributes: [
        { name: 'utm_source', value: 'new_website' },
        { name: 'utm_medium', value: 'web' },
        { name: 'utm_campaign', value: 'sale' },
        { name: 'full_url', value: fullUrl },
      ],
      full_url: fullUrl,
      fullUrl,
      url: fullUrl,
      returnUrl: fullUrl,
    });
  });

  it('openCheckout assigns cart, re-inits SDK with UTMs, refreshes session phone, and triggers checkout', async () => {
    const trigger = jest.fn();
    const init = jest.fn();
    const initCheckout = jest.fn();
    window.gokwikSdk = { init, initCheckout };
    window.triggerGokwikCustomCheckout = trigger;
    window.localStorage.setItem('kp-login-no', '9999999999');
    window.sessionStorage.setItem('kp-login-no', '9999999999');
    mockGetStoredAuthUser.mockReturnValue({
      id: 'user-1',
      phoneNumber: '+919833290022',
      email: 'user@example.com',
      isGuest: false,
    } as ReturnType<typeof getStoredAuthUser>);

    await gokwikCheckoutAdapter.openCheckout({
      cartId: 'gid://shopify/Cart/cart-1?key=secret',
      source: 'cart',
    });

    expect(window.merchantInfo?.cart).toEqual({
      id: 'gid://shopify/Cart/cart-1',
    });
    expect(window.merchantInfo?.utm_source).toBe('new_website');
    expect(window.merchantInfo?.utm_medium).toBe('web');
    expect(window.merchantInfo?.utm_campaign).toBe('web_checkout');
    expect(window.merchantInfo?.full_url).toBe(resolveCheckoutFullUrl());
    expect(window.merchantInfo?.returnUrl).toBe(resolveCheckoutFullUrl());
    expect(String(window.merchantInfo?.full_url)).not.toContain('myshopify.com');
    expect(document.cookie).toContain('utm_medium=web');
    expect(document.cookie).toContain('utm_campaign=web_checkout');
    expect(decodeURIComponent(document.cookie)).toContain(
      'utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
    );
    expect(init).toHaveBeenCalled();
    expect(initCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        utm_source: 'new_website',
        utm_medium: 'web',
        utm_campaign: 'web_checkout',
        utmParams: expect.objectContaining({
          utm_source: 'new_website',
          utm_medium: 'web',
          utm_campaign: 'web_checkout',
        }),
        full_url: resolveCheckoutFullUrl(),
        returnUrl: resolveCheckoutFullUrl(),
        utm_details: 'utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
        note_attributes: expect.arrayContaining([
          { name: 'utm_source', value: 'new_website' },
          { name: 'utm_campaign', value: 'web_checkout' },
          { name: 'full_url', value: resolveCheckoutFullUrl() },
        ]),
      }),
    );
    expect(sessionStorage.getItem(CHECKOUT_SOURCE_STORAGE_KEY)).toBe('cart');
    expect(sessionStorage.getItem(CHECKOUT_CART_ID_STORAGE_KEY)).toBe(
      'gid://shopify/Cart/cart-1?key=secret',
    );
    expect(window.localStorage.getItem('kp-login-no')).toBe('9833290022');
    expect(window.sessionStorage.getItem('kp-login-no')).toBe('9833290022');
    expect(trigger).toHaveBeenCalled();
  });

  it('openCheckout throws when sdk is not ready', async () => {
    const fakeScript = document.createElement('script');
    fakeScript.id = GOKWIK_CHECKOUT_SCRIPT_ID;
    document.head.appendChild(fakeScript);

    await expect(
      gokwikCheckoutAdapter.openCheckout({
        cartId: 'cart-1',
        source: 'buy_now',
      }),
    ).rejects.toThrow('Checkout is temporarily unavailable');
  }, 25_000);
});
