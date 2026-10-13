/** @jest-environment jsdom */

import { resolveCheckoutFullUrl } from '@/lib/cart/checkout-storefront-url';

describe('resolveCheckoutFullUrl', () => {
  it('keeps the live hosted palmonas.com checkout URL with UTMs', () => {
    expect(
      resolveCheckoutFullUrl(
        'https://palmonas.com/cart?utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
      ),
    ).toBe(
      'https://palmonas.com/cart?utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
    );
  });

  it('keeps the live hosted domain on staging and shop hosts', () => {
    expect(resolveCheckoutFullUrl('https://staging.palmonas.com/cart')).toBe(
      'https://staging.palmonas.com/cart',
    );
    expect(resolveCheckoutFullUrl('https://shop.palmonas.com/collections/rings')).toBe(
      'https://shop.palmonas.com/collections/rings',
    );
  });

  it('rewrites palmonas.myshopify.com to this deploy app origin', () => {
    expect(resolveCheckoutFullUrl('https://palmonas.myshopify.com/')).toBe(
      'http://localhost:3000/',
    );
    expect(
      resolveCheckoutFullUrl(
        'https://palmonas.myshopify.com/cart?utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
      ),
    ).toBe(
      'http://localhost:3000/cart?utm_source=new_website&utm_medium=web&utm_campaign=web_checkout',
    );
  });

  it('falls back to the app origin for invalid hrefs', () => {
    expect(resolveCheckoutFullUrl('not-a-url')).toBe('http://localhost:3000/');
  });
});
