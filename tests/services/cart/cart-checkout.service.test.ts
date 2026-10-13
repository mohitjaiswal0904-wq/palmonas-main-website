const mockWaitForGuestCartMerge = jest.fn().mockResolvedValue(undefined);
const mockInvalidateCartCache = jest.fn();
const mockFetchCurrentCart = jest.fn();
const mockValidatePreCheckoutApi = jest.fn();

jest.mock('@/services/cart/guest-cart-merge.service', () => ({
  waitForGuestCartMerge: (...args: unknown[]) => mockWaitForGuestCartMerge(...args),
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  fetchCurrentCart: (...args: unknown[]) => mockFetchCurrentCart(...args),
  invalidateCartCache: () => mockInvalidateCartCache(),
}));

jest.mock('@/services/cart/cart.service', () => ({
  validatePreCheckoutApi: (...args: unknown[]) => mockValidatePreCheckoutApi(...args),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: {
    getState: jest.fn(() => ({
      postLoginCheckoutCartId: null,
      consumePostLoginCheckoutCartId: jest.fn(() => null),
    })),
  },
}));

import { prepareCheckoutCart } from '@/services/cart/cart-checkout.service';

const mockCart = {
  id: 'gid://shopify/Cart/current-1',
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

describe('prepareCheckoutCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({
      postLoginCheckoutCartId: null,
      consumePostLoginCheckoutCartId: jest.fn(() => null),
    });
    mockFetchCurrentCart.mockResolvedValue(mockCart);
    mockValidatePreCheckoutApi.mockResolvedValue({
      is_valid: true,
      cart_id: 'gid://shopify/Cart/abc?key=secret',
      items: [],
    });
  });

  it('awaits guest merge before force-fetch and pre-checkout', async () => {
    const result = await prepareCheckoutCart();

    expect(mockWaitForGuestCartMerge).toHaveBeenCalled();
    expect(mockInvalidateCartCache).toHaveBeenCalled();
    expect(mockFetchCurrentCart).toHaveBeenCalledWith({ force: true });
    expect(mockValidatePreCheckoutApi).toHaveBeenCalled();
    expect(result.isValid).toBe(true);
    expect(result.cartId).toBe('gid://shopify/Cart/abc?key=secret');
    expect(result.cart).toEqual(mockCart);
  });

  it('returns invalid when pre-checkout fails stock check', async () => {
    mockValidatePreCheckoutApi.mockResolvedValue({
      is_valid: false,
      cart_id: 'gid://shopify/Cart/abc',
      items: [],
    });

    const result = await prepareCheckoutCart();

    expect(result.isValid).toBe(false);
    expect(result.cartId).toBe('gid://shopify/Cart/abc');
  });

  it('throws when pre-checkout omits cart_id', async () => {
    mockValidatePreCheckoutApi.mockResolvedValue({
      is_valid: true,
      cart_id: '',
      items: [],
    });

    await expect(prepareCheckoutCart()).rejects.toThrow();
  });

  it('uses cart_id from cart_jwe login without awaiting guest merge', async () => {
    const { useCartStore } = jest.requireMock('@/store/cart/cart.store') as {
      useCartStore: { getState: jest.Mock };
    };
    useCartStore.getState.mockReturnValue({
      consumePostLoginCheckoutCartId: jest.fn(() => 'gid://shopify/Cart/login-cart'),
    });

    const result = await prepareCheckoutCart();

    expect(mockWaitForGuestCartMerge).not.toHaveBeenCalled();
    expect(result.cartId).toBe('gid://shopify/Cart/login-cart');
    expect(mockFetchCurrentCart).toHaveBeenCalledWith({ force: true });
    expect(mockValidatePreCheckoutApi).toHaveBeenCalled();
  });
});
