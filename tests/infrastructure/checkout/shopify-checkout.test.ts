/** @jest-environment jsdom */

import { cartMessages } from '@/config/cart/cart.config';
import {
  assertSafeShopifyCheckoutUrl,
  openShopifyCheckout,
  withCheckoutUtmParams,
} from '@/infrastructure/checkout/shopify-checkout';

describe('shopify-checkout adapter', () => {
  it('accepts absolute https checkout URLs', () => {
    const url = assertSafeShopifyCheckoutUrl('https://palmonas.myshopify.com/cart/c/abc');
    expect(url.hostname).toBe('palmonas.myshopify.com');
  });

  it('rejects missing checkout URL', () => {
    expect(() => assertSafeShopifyCheckoutUrl(undefined)).toThrow(
      cartMessages.errors.checkoutUrlMissing,
    );
  });

  it('rejects non-https and javascript URLs', () => {
    expect(() => assertSafeShopifyCheckoutUrl('http://palmonas.myshopify.com/cart')).toThrow(
      cartMessages.errors.checkoutUrlMissing,
    );
    expect(() => assertSafeShopifyCheckoutUrl('javascript:alert(1)')).toThrow(
      cartMessages.errors.checkoutUrlMissing,
    );
  });

  it('forces checkout UTM source while preserving other existing params', () => {
    const href = withCheckoutUtmParams('https://palmonas.myshopify.com/cart/c/abc?utm_source=keep', {
      utm_source: 'new_website',
      utm_medium: 'web',
    });
    const url = new URL(href);
    expect(url.searchParams.get('utm_source')).toBe('new_website');
    expect(url.searchParams.get('utm_medium')).toBe('web');
  });

  it('toasts then assigns checkout URL', async () => {
    const onToast = jest.fn();
    const assign = jest.fn();

    await openShopifyCheckout(
      {
        checkoutUrl: 'https://palmonas.myshopify.com/cart/c/abc',
        utmParams: { utm_source: 'new_website' },
      },
      { onToast, assign },
    );

    expect(onToast).toHaveBeenCalledWith(cartMessages.toasts.openingShopifyCheckout);
    expect(assign).toHaveBeenCalledWith(
      expect.stringContaining('https://palmonas.myshopify.com/cart/c/abc'),
    );
    expect(assign.mock.calls[0][0]).toContain('utm_source=new_website');
  });

  it('throws when checkout URL missing on open', async () => {
    await expect(openShopifyCheckout({ checkoutUrl: '' }, { assign: jest.fn() })).rejects.toThrow(
      cartMessages.errors.checkoutUrlMissing,
    );
  });
});
