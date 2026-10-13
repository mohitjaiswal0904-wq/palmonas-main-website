const mockFetchCurrentCart = jest.fn();
const mockSetCart = jest.fn();

jest.mock('@/repositories/cart/cart.repository', () => ({
  fetchCurrentCart: (...args: unknown[]) => mockFetchCurrentCart(...args),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: {
    getState: () => ({
      setCart: mockSetCart,
    }),
  },
}));

import { hydrateAuthenticatedCartLines } from '@/services/cart/cart-hydrate.service';
import type { Cart } from '@/types/cart';

const sampleCart: Cart = {
  id: 'cart-1',
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

describe('hydrateAuthenticatedCartLines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the current cart and writes it to the cart store', async () => {
    mockFetchCurrentCart.mockResolvedValueOnce(sampleCart);

    const cart = await hydrateAuthenticatedCartLines();

    expect(mockFetchCurrentCart).toHaveBeenCalledTimes(1);
    expect(mockSetCart).toHaveBeenCalledWith(sampleCart);
    expect(cart).toEqual(sampleCart);
  });

  it('returns carts that include line items for PLP badge hydration', async () => {
    const cartWithItems: Cart = {
      ...sampleCart,
      id: 'cart-with-items',
      items: [
        {
          id: 'line-1',
          quantity: 1,
          price: 1000,
          originalPrice: 1200,
          totalPrice: 1000,
          product_category: 'rings',
          isAvailable: true,
          product: {
            id: 'prod-1',
            name: 'Ring',
            handle: 'ring',
            primaryImage: '',
            variantId: 'gid://shopify/ProductVariant/123',
            variantTitle: 'Default',
            product_category: 'rings',
          },
        },
      ],
      totalItems: 1,
      subtotal: 1000,
      total: 1000,
    };
    mockFetchCurrentCart.mockResolvedValueOnce(cartWithItems);

    const cart = await hydrateAuthenticatedCartLines();

    expect(cart.items).toHaveLength(1);
    expect(mockSetCart).toHaveBeenCalledWith(cartWithItems);
  });

  it('does not update the store when fetch rejects', async () => {
    mockFetchCurrentCart.mockRejectedValueOnce(new Error('network'));

    await expect(hydrateAuthenticatedCartLines()).rejects.toThrow('network');
    expect(mockSetCart).not.toHaveBeenCalled();
  });

  it('propagates repository failures without swallowing them', async () => {
    mockFetchCurrentCart.mockRejectedValueOnce(new Error('unauthorised'));

    await expect(hydrateAuthenticatedCartLines()).rejects.toThrow('unauthorised');
    expect(mockFetchCurrentCart).toHaveBeenCalledTimes(1);
  });
});
