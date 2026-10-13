import { GUEST_CART_STORAGE_KEY } from '@/config/cart/cart.config';
import {
  cartNeedsImageRefresh,
  clearGuestCartSnapshot,
  persistGuestCartSnapshot,
  readGuestCartSnapshot,
} from '@/lib/cart/guest-cart.local-data-source';
import type { Cart } from '@/types/cart';

const sampleCart: Cart = {
  id: 'cart-1',
  checkoutUrl: '',
  items: [
    {
      id: 'line-1',
      quantity: 1,
      price: 100,
      totalPrice: 100,
      product_category: 'rings',
      isAvailable: true,
      product: {
        id: 'p1',
        name: 'Ring',
        handle: 'ring',
        primaryImage: '',
        variantId: 'v1',
        variantTitle: 'Gold',
        product_category: 'rings',
      },
    },
  ],
  totalItems: 1,
  subtotal: 100,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 100,
  currency: 'INR',
};

describe('guest-cart.local-data-source guest snapshot storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and reads a guest cart snapshot', () => {
    persistGuestCartSnapshot(sampleCart);

    expect(localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeTruthy();
    expect(readGuestCartSnapshot()).toEqual(sampleCart);
  });

  it('clears snapshot when cart is null or empty', () => {
    persistGuestCartSnapshot(sampleCart);
    persistGuestCartSnapshot(null);

    expect(localStorage.getItem(GUEST_CART_STORAGE_KEY)).toBeNull();
    expect(readGuestCartSnapshot()).toBeNull();
  });

  it('clearGuestCartSnapshot removes stored data', () => {
    persistGuestCartSnapshot(sampleCart);
    clearGuestCartSnapshot();

    expect(readGuestCartSnapshot()).toBeNull();
  });

  it('returns null for invalid stored JSON', () => {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, '{not-json');
    expect(readGuestCartSnapshot()).toBeNull();
  });

  it('returns null for invalid cart shape', () => {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(readGuestCartSnapshot()).toBeNull();
  });
});

const cartWithImage: Cart = {
  ...sampleCart,
  items: [
    {
      ...sampleCart.items[0]!,
      product: { ...sampleCart.items[0]!.product, primaryImage: 'https://cdn.example.com/ring.jpg' },
    },
  ],
};

describe('cartNeedsImageRefresh', () => {
  it('returns false when all lines have images', () => {
    expect(cartNeedsImageRefresh(cartWithImage)).toBe(false);
  });

  it('returns true when any line is missing primaryImage', () => {
    expect(cartNeedsImageRefresh(sampleCart)).toBe(true);
  });

  it('returns false for null or empty cart', () => {
    expect(cartNeedsImageRefresh(null)).toBe(false);
    expect(cartNeedsImageRefresh({ ...sampleCart, items: [] })).toBe(false);
  });
});
