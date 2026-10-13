import type { QueryClient } from '@tanstack/react-query';

import type { Cart } from '@/types/cart';

import {
  buildCartLoginCouponCodes,
  buildCartLoginItemsFromCart,
  resolveCartLoginCouponCodes,
} from '@/lib/cart/cart-login-items';
import { queryKeys } from '@/lib/query/keys';

const cart: Cart = {
  id: 'cart-1',
  items: [
    {
      id: 'line-1',
      quantity: 2,
      price: 100,
      totalPrice: 200,
      product_category: 'rings',
      isAvailable: true,
      product: {
        id: 'p1',
        name: 'Ring',
        handle: 'ring',
        primaryImage: '',
        variantId: '123456',
        variantTitle: 'Gold',
        product_category: 'rings',
      },
    },
  ],
  totalItems: 2,
  subtotal: 200,
  total: 200,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

describe('buildCartLoginItemsFromCart', () => {
  it('maps cart lines to merchandiseId + quantity', () => {
    expect(buildCartLoginItemsFromCart(cart)).toEqual([
      {
        merchandiseId: 'gid://shopify/ProductVariant/123456',
        quantity: 2,
      },
    ]);
  });

  it('returns empty array for empty or missing cart', () => {
    expect(buildCartLoginItemsFromCart(null)).toEqual([]);
    expect(buildCartLoginItemsFromCart({ ...cart, items: [] })).toEqual([]);
  });
});

describe('buildCartLoginCouponCodes', () => {
  it('returns a single-item array for applied codes', () => {
    expect(buildCartLoginCouponCodes('SAVE10')).toEqual(['SAVE10']);
  });

  it('returns undefined for blank or missing codes', () => {
    expect(buildCartLoginCouponCodes(null)).toBeUndefined();
    expect(buildCartLoginCouponCodes('   ')).toBeUndefined();
  });
});

describe('resolveCartLoginCouponCodes', () => {
  it('reads applied coupon from discounts query cache', () => {
    const queryClient = {
      getQueryData: jest.fn().mockReturnValue({ appliedCode: 'SAVE10' }),
    } as unknown as QueryClient;

    expect(resolveCartLoginCouponCodes(queryClient, 'cart-1')).toEqual(['SAVE10']);
    expect(queryClient.getQueryData).toHaveBeenCalledWith(queryKeys.cart.discounts('cart-1'));
  });

  it('returns undefined when cart id or applied code is missing', () => {
    const queryClient = { getQueryData: jest.fn() } as unknown as QueryClient;

    expect(resolveCartLoginCouponCodes(queryClient, undefined)).toBeUndefined();
    expect(resolveCartLoginCouponCodes(queryClient, 'cart-1')).toBeUndefined();
  });
});
