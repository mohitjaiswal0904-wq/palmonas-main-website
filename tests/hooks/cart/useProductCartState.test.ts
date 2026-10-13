import { act, renderHook } from '@testing-library/react';

import { useProductCartState } from '@/hooks/cart/useProductCartState';
import type { Product } from '@/types/product';

let mockCart: {
  items: Array<{
    id?: string;
    quantity?: number;
    product: { id?: string; handle?: string; variantId: string };
  }>;
} | null = null;
let mockAuthKey = 'guest:true';

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    session: mockAuthKey.startsWith('guest') ? null : { user: { id: mockAuthKey.split(':')[0] } },
    isGuest: mockAuthKey.endsWith(':true'),
  }),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: (selector: (state: { cart: typeof mockCart }) => unknown) =>
    selector({ cart: mockCart }),
}));

const product: Product = {
  id: 'prod-1',
  handle: 'test-ring',
  name: 'Test Ring',
  description: '',
  price: 1000,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-1',
      title: 'Gold',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal', value: 'Gold' }],
    },
    {
      id: 'variant-2',
      title: 'Silver',
      price: 900,
      availableForSale: false,
      selectedOptions: [{ name: 'Metal', value: 'Silver' }],
    },
  ],
};

describe('useProductCartState', () => {
  beforeEach(() => {
    mockCart = null;
    mockAuthKey = 'guest:true';
  });

  it('resolves first available variant id', () => {
    const { result } = renderHook(() => useProductCartState(product));

    expect(result.current.resolvedVariantId).toBe('variant-1');
    expect(result.current.showInCart).toBe(false);
  });

  it('shows in cart when API enrichment flag is set', () => {
    const enriched = { ...product, cart: { isInCart: true, quantity: 1 } };
    const { result } = renderHook(() => useProductCartState(enriched));

    expect(result.current.showInCart).toBe(true);
  });

  it('ignores stale API isInCart when zustand cart is loaded and variant is absent', () => {
    mockCart = { items: [] };
    const enriched = { ...product, cart: { isInCart: true, quantity: 1 } };
    const { result } = renderHook(() => useProductCartState(enriched));

    expect(result.current.showInCart).toBe(false);
  });

  it('resets local add success when auth session changes', () => {
    const { result, rerender } = renderHook(() => useProductCartState(product));

    act(() => {
      result.current.markAddedLocally();
    });
    expect(result.current.showInCart).toBe(true);

    mockAuthKey = 'user-1:false';
    rerender();

    expect(result.current.showInCart).toBe(false);
  });

  it('shows in cart when variant exists in zustand cart', () => {
    mockCart = {
      items: [
        { id: 'line-1', quantity: 2, product: { variantId: 'gid://shopify/ProductVariant/123' } },
      ],
    };

    const { result } = renderHook(() => useProductCartState(product, '123'));

    expect(result.current.showInCart).toBe(true);
    expect(result.current.quantity).toBe(2);
    expect(result.current.lineQuantity).toBe(2);
    expect(result.current.lineId).toBe('line-1');
  });

  it('sums quantities across all variants of a product when no variantId is set', () => {
    mockCart = {
      items: [
        { id: 'line-1', quantity: 2, product: { variantId: 'variant-1' } },
        { id: 'line-2', quantity: 3, product: { variantId: 'variant-2' } },
        { id: 'line-3', quantity: 1, product: { variantId: 'other-product' } },
      ],
    };

    const { result } = renderHook(() => useProductCartState(product));

    expect(result.current.showInCart).toBe(true);
    expect(result.current.quantity).toBe(5);
    expect(result.current.lineQuantity).toBe(2);
    expect(result.current.lineId).toBe('line-1');
    expect(result.current.matchingLines).toEqual([
      expect.objectContaining({ id: 'line-1', quantity: 2, variantId: 'variant-1' }),
      expect.objectContaining({ id: 'line-2', quantity: 3, variantId: 'variant-2' }),
    ]);
  });

  it('matches cart lines by product handle when listing variants are incomplete', () => {
    mockCart = {
      items: [
        {
          id: 'line-9',
          quantity: 4,
          product: { handle: 'test-ring', variantId: 'variant-missing-from-card' },
        },
      ],
    };

    const { result } = renderHook(() => useProductCartState(product));

    expect(result.current.showInCart).toBe(true);
    expect(result.current.quantity).toBe(4);
  });

  it('uses API quantity when the cart body is not hydrated yet', () => {
    const enriched = { ...product, cart: { isInCart: true, quantity: 3 } };
    const { result } = renderHook(() => useProductCartState(enriched));

    expect(result.current.showInCart).toBe(true);
    expect(result.current.quantity).toBe(3);
    expect(result.current.lineId).toBeUndefined();
  });

  it('returns zero quantity when hydrated cart has no matching line', () => {
    mockCart = { items: [] };
    const enriched = { ...product, cart: { isInCart: true, quantity: 3 } };
    const { result } = renderHook(() => useProductCartState(enriched));

    expect(result.current.showInCart).toBe(false);
    expect(result.current.quantity).toBe(0);
    expect(result.current.lineId).toBeUndefined();
  });

  it('uses optimistic quantity 1 after a local add before the cart hydrates', () => {
    const { result } = renderHook(() => useProductCartState(product));

    act(() => {
      result.current.markAddedLocally();
    });

    expect(result.current.showInCart).toBe(true);
    expect(result.current.quantity).toBe(1);
    expect(result.current.lineId).toBeUndefined();
  });

  it('shows in cart when any product variant is in zustand cart without explicit variantId', () => {
    mockCart = {
      items: [{ product: { variantId: 'variant-2' } }],
    };

    const { result } = renderHook(() => useProductCartState(product));

    expect(result.current.showInCart).toBe(true);
  });

  it('markAddedLocally toggles showInCart', () => {
    const { result } = renderHook(() => useProductCartState(product));

    act(() => {
      result.current.markAddedLocally();
    });

    expect(result.current.showInCart).toBe(true);

    act(() => {
      result.current.clearLocalSuccess();
    });

    expect(result.current.showInCart).toBe(false);
  });

  it('drops sticky local add when hydrated cart no longer contains the variant', () => {
    const { result, rerender } = renderHook(() => useProductCartState(product));

    act(() => {
      result.current.markAddedLocally();
    });
    expect(result.current.showInCart).toBe(true);

    mockCart = { items: [] };
    rerender();

    expect(result.current.showInCart).toBe(false);
  });

  it('keeps local add optimistic only while cart is still null', () => {
    mockCart = null;
    const { result } = renderHook(() => useProductCartState(product));

    act(() => {
      result.current.markAddedLocally();
    });

    expect(result.current.showInCart).toBe(true);
  });
});
