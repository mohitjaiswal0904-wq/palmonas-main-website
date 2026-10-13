import { renderHook, waitFor, act } from '@testing-library/react';

import { useCart } from '@/hooks/cart/useCart';
import type { Cart, CartDiscountsState } from '@/types/cart';
import {
  fetchCurrentCart,
  addItems,
  removeLines,
  updateLineQuantity,
  applyOptimisticAdd,
  applyOptimisticQuantity,
  applyCartDiscount,
  fetchCartDiscounts,
} from '@/repositories/cart/cart.repository';
import { cartMessages } from '@/config/cart/cart.config';
import { queryKeys } from '@/lib/query/keys';

const mockUsePathname = jest.fn(() => '/cart');
const mockUseAuth = jest.fn(() => ({ session: { user: { id: 'u1' } }, isGuest: false }));
const mockUseQuery = jest.fn();
const mockPersistGuestCartSnapshot = jest.fn();
const mockSetQueryData = jest.fn();
const mockGetQueryData = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useQueryClient: () => ({
    setQueryData: (...args: unknown[]) => mockSetQueryData(...args),
    getQueryData: (...args: unknown[]) => mockGetQueryData(...args),
    invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
  }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  persistGuestCartSnapshot: (...args: unknown[]) => mockPersistGuestCartSnapshot(...args),
}));

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  fetchCurrentCart: jest.fn(),
  invalidateCartCache: jest.fn(),
  addItems: jest.fn(),
  removeLines: jest.fn(),
  updateLineQuantity: jest.fn(),
  validatePreCheckout: jest.fn(),
  clearCart: jest.fn(),
  applyOptimisticAdd: jest.fn(),
  applyOptimisticQuantity: jest.fn(),
  applyOptimisticRemove: jest.fn(),
  fetchCartDiscounts: jest.fn(),
  applyCartDiscount: jest.fn(),
}));

const emptyDiscounts: CartDiscountsState = {
  availableDiscounts: [],
  unavailableDiscounts: [],
  appliedCode: null,
  appliedAmountSaved: 0,
  payableAfterDiscount: null,
};

function mockCartAndDiscountQueries(
  cartData: Cart | null | undefined = cartWithItems,
  options?: {
    cartLoading?: boolean;
    cartFetching?: boolean;
    discounts?: CartDiscountsState | null;
    discountsLoading?: boolean;
    discountsError?: Error | null;
  },
) {
  mockUseQuery.mockImplementation((opts: { queryKey?: unknown[] }) => {
    const key = opts?.queryKey ?? [];
    if (Array.isArray(key) && key.includes('discounts')) {
      return {
        data: options?.discounts === null ? undefined : (options?.discounts ?? emptyDiscounts),
        isLoading: options?.discountsLoading ?? false,
        isFetching: options?.discountsLoading ?? false,
        error: options?.discountsError ?? null,
      };
    }
    return {
      data: cartData,
      isLoading: options?.cartLoading ?? false,
      isFetching: options?.cartFetching ?? false,
      error: null,
    };
  });
}

const cartWithItems: Cart = {
  id: 'cart-1',
  items: [
    {
      id: 'line-1',
      quantity: 1,
      price: 100,
      originalPrice: 120,
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
  total: 100,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

let zustandCart: Cart | null = cartWithItems;
let zustandStatus: 'idle' | 'loading' | 'refreshing' = 'idle';
let zustandUpdatingLineId: string | null = null;
let zustandRemovingLineId: string | null = null;
let zustandRequiresFreshCartFetch = false;
let zustandCartMergeInProgress = false;
const mockMarkCartRequiresFreshFetch = jest.fn(() => {
  zustandRequiresFreshCartFetch = true;
});
const mockClearCartRequiresFreshFetch = jest.fn(() => {
  zustandRequiresFreshCartFetch = false;
});

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        cart: zustandCart,
        status: zustandStatus,
        error: null,
        updatingLineId: zustandUpdatingLineId,
        removingLineId: zustandRemovingLineId,
        requiresFreshCartFetch: zustandRequiresFreshCartFetch,
        cartMergeInProgress: zustandCartMergeInProgress,
        setCart: jest.fn(),
        setStatus: jest.fn(),
        setError: jest.fn(),
        setUpdatingLineId: jest.fn(),
        setRemovingLineId: jest.fn(),
        markCartRequiresFreshFetch: mockMarkCartRequiresFreshFetch,
        clearCartRequiresFreshFetch: mockClearCartRequiresFreshFetch,
      }),
    {
      getState: () => ({
        cart: zustandCart,
        markCartRequiresFreshFetch: mockMarkCartRequiresFreshFetch,
        clearCartRequiresFreshFetch: mockClearCartRequiresFreshFetch,
      }),
    },
  ),
}));

const mockSyncCartCountFromCart = jest.fn();
const mockAddCart = jest.fn();
const mockStatsRefresh = jest.fn();

jest.mock('@/store/cart/cart-stats.store', () => ({
  useCartStatsStore: Object.assign(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        addCart: mockAddCart,
        minusCart: jest.fn(),
        syncCartCountFromCart: mockSyncCartCountFromCart,
      }),
    {
      getState: () => ({ refresh: mockStatsRefresh }),
    },
  ),
}));

describe('useCart showEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    zustandCart = cartWithItems;
    zustandStatus = 'idle';
    zustandUpdatingLineId = null;
    zustandRemovingLineId = null;
    zustandRequiresFreshCartFetch = false;
    mockUsePathname.mockReturnValue('/cart');
    mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } }, isGuest: false });
    mockCartAndDiscountQueries(cartWithItems);
    (fetchCurrentCart as jest.Mock).mockResolvedValue(cartWithItems);
  });

  it('returns showEmpty false when cart had items and is refetching empty', () => {
    const { result, rerender } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(false);

    zustandCart = null;
    mockCartAndDiscountQueries(null, { cartFetching: true });
    rerender();

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.showEmpty).toBe(false);
  });

  it('returns showEmpty true when empty cart snapshot exists during silent refetch', () => {
    zustandCart = { ...cartWithItems, items: [] };
    mockCartAndDiscountQueries(
      { ...cartWithItems, items: [] },
      { cartFetching: true },
    );

    const { result } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.showEmpty).toBe(true);
  });

  it('returns showEmpty true when cart is empty and not refetching', () => {
    zustandCart = null;
    mockCartAndDiscountQueries({ ...cartWithItems, items: [] });

    const { result } = renderHook(() => useCart());

    expect(result.current.showEmpty).toBe(true);
  });

  it('returns showEmpty false while initial query is loading', () => {
    zustandCart = null;
    mockCartAndDiscountQueries(null, { cartLoading: true, cartFetching: true });

    const { result } = renderHook(() => useCart());

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.showEmpty).toBe(false);
  });

  it('prefers query data on cart route when not mutating', () => {
    zustandCart = { ...cartWithItems, items: [], totalItems: 0 };
    mockCartAndDiscountQueries(cartWithItems);

    const { result } = renderHook(() => useCart());

    expect(result.current.cart?.items.length).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  it('syncs header badge count when hydrating from query on cart route', () => {
    renderHook(() => useCart());

    expect(mockSyncCartCountFromCart).toHaveBeenCalledWith(cartWithItems);
  });

  it('persists guest cart snapshot when syncing as guest', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: 'guest-1' } },
      isGuest: true,
    });
    (addItems as jest.Mock).mockResolvedValue(cartWithItems);

    const { result } = renderHook(() => useCart());
    await result.current.actions.addItem('v1', 1);

    expect(mockPersistGuestCartSnapshot).toHaveBeenCalledWith(cartWithItems);
  });

  it('does not refetch cart on /cart mount', () => {
    renderHook(() => useCart());

    expect(fetchCurrentCart).not.toHaveBeenCalled();
    expect(mockStatsRefresh).not.toHaveBeenCalled();
  });
});

describe('useCart mutation reconcile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    zustandCart = cartWithItems;
    zustandStatus = 'idle';
    zustandUpdatingLineId = null;
    zustandRemovingLineId = null;
    zustandRequiresFreshCartFetch = false;
    mockUsePathname.mockReturnValue('/cart');
    mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } }, isGuest: false });
    mockCartAndDiscountQueries(cartWithItems);
    (fetchCurrentCart as jest.Mock).mockResolvedValue(cartWithItems);
    (applyOptimisticAdd as jest.Mock).mockImplementation((_cart, _id, qty) => ({
      ...cartWithItems,
      items: [{ ...cartWithItems.items[0], quantity: qty }],
    }));
    (applyOptimisticQuantity as jest.Mock).mockImplementation((_cart, _id, qty) => ({
      ...cartWithItems,
      items: [{ ...cartWithItems.items[0], quantity: qty }],
    }));
    (addItems as jest.Mock).mockResolvedValue(cartWithItems);
    (updateLineQuantity as jest.Mock).mockResolvedValue(cartWithItems);
  });

  it('force-refetches cart after successful addItem on /cart', async () => {
    const { result } = renderHook(() => useCart());
    (fetchCurrentCart as jest.Mock).mockClear();

    await result.current.actions.addItem('v1', 1);

    expect(addItems).toHaveBeenCalledWith('v1', 1, { waitForShopify: true });
    expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    expect(mockClearCartRequiresFreshFetch).toHaveBeenCalled();
  });

  it('force-refetches cart after successful updateQuantity on /cart', async () => {
    const { result } = renderHook(() => useCart());
    (fetchCurrentCart as jest.Mock).mockClear();

    await result.current.actions.updateQuantity('line-1', 2);

    expect(updateLineQuantity).toHaveBeenCalledWith('line-1', 2);
    expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
  });

  it('marks cart dirty after addItem off /cart without fetching', async () => {
    mockUsePathname.mockReturnValue('/collections/party-wear');
    const { result } = renderHook(() => useCart());
    (fetchCurrentCart as jest.Mock).mockClear();

    await result.current.actions.addItem('v1', 1);

    expect(fetchCurrentCart).not.toHaveBeenCalled();
    expect(mockMarkCartRequiresFreshFetch).toHaveBeenCalled();
    expect(addItems).toHaveBeenCalledWith('v1', 1, { waitForShopify: false });
  });

  it('bumps badge via addCart when adding off /cart with no cart snapshot', async () => {
    mockUsePathname.mockReturnValue('/collections/party-wear');
    zustandCart = null;
    mockCartAndDiscountQueries(null);
    const serverCart = { ...cartWithItems, totalItems: 8, items: cartWithItems.items };
    (addItems as jest.Mock).mockResolvedValue(serverCart);

    const { result } = renderHook(() => useCart());
    mockSyncCartCountFromCart.mockClear();
    mockAddCart.mockClear();

    await result.current.actions.addItem('v1', 1);

    expect(mockAddCart).toHaveBeenCalledWith(1);
    // No optimistic ₹0 cart — badge only updates from the authoritative API cart afterward.
    expect(mockSyncCartCountFromCart).not.toHaveBeenCalledWith(
      expect.objectContaining({ totalItems: 1 }),
    );
    expect(mockSyncCartCountFromCart).toHaveBeenCalledWith(serverCart);
  });

  it('syncs badge from cart when adding with an existing cart snapshot', async () => {
    mockUsePathname.mockReturnValue('/collections/party-wear');
    zustandCart = cartWithItems;
    mockCartAndDiscountQueries(cartWithItems);
    (addItems as jest.Mock).mockResolvedValue({
      ...cartWithItems,
      totalItems: cartWithItems.totalItems + 1,
    });

    const { result } = renderHook(() => useCart());
    mockSyncCartCountFromCart.mockClear();
    mockAddCart.mockClear();

    await result.current.actions.addItem('v1', 1);

    expect(mockAddCart).not.toHaveBeenCalled();
    expect(mockSyncCartCountFromCart).toHaveBeenCalled();
  });

  it('force-refetches cart after successful removeItem on cart route', async () => {
    const mockRemoveLines = jest.requireMock('@/repositories/cart/cart.repository')
      .removeLines as jest.Mock;
    mockRemoveLines.mockResolvedValue({ ...cartWithItems, items: [] });

    const { result } = renderHook(() => useCart());
    (fetchCurrentCart as jest.Mock).mockClear();

    await result.current.actions.removeItem('line-1');

    expect(mockRemoveLines).toHaveBeenCalledWith(['line-1']);
    expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
  });

  it('force-refetches when visiting /cart with dirty flag', async () => {
    zustandRequiresFreshCartFetch = true;
    renderHook(() => useCart());

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
    expect(mockClearCartRequiresFreshFetch).toHaveBeenCalled();
  });

  it('does not hydrate from query while dirty flag is set', () => {
    zustandRequiresFreshCartFetch = true;
    mockSyncCartCountFromCart.mockClear();

    renderHook(() => useCart());

    // Sync from stale query hydration must not run while dirty; only force-fetch path syncs.
    expect(mockSyncCartCountFromCart).not.toHaveBeenCalledWith(cartWithItems);
  });

  it('validateStock delegates to repository', async () => {
    const mockValidate = jest.requireMock('@/repositories/cart/cart.repository')
      .validatePreCheckout as jest.Mock;
    mockValidate.mockResolvedValue({ is_valid: true, cart_id: 'cart-1', items: [] });

    const { result } = renderHook(() => useCart());
    const response = await result.current.actions.validateStock();

    expect(response.is_valid).toBe(true);
    expect(mockValidate).toHaveBeenCalled();
  });

  it('refreshCartSilent refetches without surfacing errors', async () => {
    const { result } = renderHook(() => useCart());
    (fetchCurrentCart as jest.Mock).mockClear();

    await result.current.actions.refreshCartSilent?.();

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('throws when addItem is called without a session', async () => {
    mockUseAuth.mockReturnValue({ session: null } as unknown as ReturnType<typeof mockUseAuth>);
    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.addItem('v1', 1)).rejects.toThrow(
      cartMessages.errors.addItem,
    );

    expect(addItems).not.toHaveBeenCalled();
    expect(toastMock.showError).toHaveBeenCalledWith(cartMessages.errors.addItem);
  });

  it('clears cart via clearCart action', async () => {
    const mockClearCart = jest.requireMock('@/repositories/cart/cart.repository')
      .clearCart as jest.Mock;
    mockClearCart.mockResolvedValue({ ...cartWithItems, items: [], totalItems: 0 });

    const { result } = renderHook(() => useCart());

    await result.current.actions.clearCart();

    expect(mockClearCart).toHaveBeenCalled();
    expect(mockSyncCartCountFromCart).toHaveBeenCalledWith(
      expect.objectContaining({ totalItems: 0 }),
    );
  });

  it('surfaces addItem errors from repository', async () => {
    (addItems as jest.Mock).mockRejectedValue(new Error('add failed'));
    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.addItem('v1', 1)).rejects.toThrow('add failed');
  });

  it('surfaces removeItem errors without throwing', async () => {
    const mockRemoveLines = jest.requireMock('@/repositories/cart/cart.repository')
      .removeLines as jest.Mock;
    mockRemoveLines.mockRejectedValue(new Error('remove failed'));

    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('line-1');

    await waitFor(() => {
      expect(mockRemoveLines).toHaveBeenCalledWith(['line-1']);
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('refreshCart surfaces fetch errors', async () => {
    (fetchCurrentCart as jest.Mock).mockRejectedValueOnce(new Error('refresh failed'));

    const { result } = renderHook(() => useCart());

    await result.current.actions.refreshCart();

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('updateQuantity with zero delegates to removeItem', async () => {
    const mockRemoveLines = jest.requireMock('@/repositories/cart/cart.repository')
      .removeLines as jest.Mock;
    mockRemoveLines.mockResolvedValue({ ...cartWithItems, items: [] });

    const { result } = renderHook(() => useCart());

    await result.current.actions.updateQuantity('line-1', 0);

    await waitFor(() => {
      expect(mockRemoveLines).toHaveBeenCalledWith(['line-1']);
    });
  });

  it('reconciles when removeItem target is missing from cart', async () => {
    zustandCart = { ...cartWithItems, items: [] };
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('missing-line');

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('uses default addItem error message for non-Error throws', async () => {
    (addItems as jest.Mock).mockRejectedValue('network');
    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.addItem('v1', 1)).rejects.toBe('network');
  });

  it('surfaces updateQuantity errors with default message', async () => {
    (updateLineQuantity as jest.Mock).mockRejectedValue('bad qty');
    const { result } = renderHook(() => useCart());

    await result.current.actions.updateQuantity('line-1', 2);

    await waitFor(() => {
      expect(updateLineQuantity).toHaveBeenCalledWith('line-1', 2);
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('reconciles when updateQuantity target is missing from cart', async () => {
    zustandCart = { ...cartWithItems, items: [] };
    const { result } = renderHook(() => useCart());

    await result.current.actions.updateQuantity('missing-line', 2);

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('restores previous cart when clearCart fails', async () => {
    const mockClearCart = jest.requireMock('@/repositories/cart/cart.repository')
      .clearCart as jest.Mock;
    mockClearCart.mockRejectedValue(new Error('clear failed'));
    const { result } = renderHook(() => useCart());

    await result.current.actions.clearCart();

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  it('skips removeItem when session is missing', async () => {
    mockUseAuth.mockReturnValue({ session: null } as unknown as ReturnType<typeof mockUseAuth>);
    const mockRemoveLines = jest.requireMock('@/repositories/cart/cart.repository')
      .removeLines as jest.Mock;
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('line-1');

    expect(mockRemoveLines).not.toHaveBeenCalled();
  });

  it('skips updateQuantity when session is missing', async () => {
    mockUseAuth.mockReturnValue({ session: null } as unknown as ReturnType<typeof mockUseAuth>);
    const { result } = renderHook(() => useCart());

    await result.current.actions.updateQuantity('line-1', 2);

    expect(updateLineQuantity).not.toHaveBeenCalled();
  });

  it('skips clearCart when session is missing', async () => {
    mockUseAuth.mockReturnValue({ session: null } as unknown as ReturnType<typeof mockUseAuth>);
    const mockClearCart = jest.requireMock('@/repositories/cart/cart.repository')
      .clearCart as jest.Mock;
    const { result } = renderHook(() => useCart());

    await result.current.actions.clearCart();

    expect(mockClearCart).not.toHaveBeenCalled();
  });

  it('returns early from reconcileCart when fetch fails after remove error', async () => {
    (fetchCurrentCart as jest.Mock).mockRejectedValueOnce(new Error('reconcile failed'));
    (removeLines as jest.Mock).mockRejectedValue(new Error('remove failed'));
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('line-1');

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });

  it('prefers zustand cart during mutation when query is empty', () => {
    zustandStatus = 'loading';
    zustandCart = cartWithItems;
    mockCartAndDiscountQueries({ ...cartWithItems, items: [] });

    const { result } = renderHook(() => useCart());

    expect(result.current.cart?.items.length).toBe(1);
    expect(result.current.isMutating).toBe(true);
  });

  it('prefers query cart items during mutation when zustand is empty', () => {
    zustandUpdatingLineId = 'line-1';
    zustandCart = null;
    mockCartAndDiscountQueries(cartWithItems);

    const { result } = renderHook(() => useCart());

    expect(result.current.cart?.items.length).toBe(1);
    expect(result.current.isMutating).toBe(true);
  });

  it('reports loading when query is loading without display cart', () => {
    zustandCart = null;
    mockCartAndDiscountQueries(null, { cartLoading: true, cartFetching: true });

    const { result } = renderHook(() => useCart());

    expect(result.current.loading).toBe(true);
  });

  it('surfaces removeItem errors with default message for non-Error throws', async () => {
    (removeLines as jest.Mock).mockRejectedValue('remove failed');
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('line-1');

    await waitFor(() => {
      expect(removeLines).toHaveBeenCalledWith(['line-1']);
    });
  });

  it('skips removeItem when cart snapshot is missing', async () => {
    zustandCart = null;
    mockCartAndDiscountQueries(null);
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeItem('line-1');

    expect(removeLines).not.toHaveBeenCalled();
  });

  it('treats removingLineId as mutating state', () => {
    zustandRemovingLineId = 'line-1';
    const { result } = renderHook(() => useCart());
    expect(result.current.isMutating).toBe(true);
  });

  it('treats refreshing status as fetching state', () => {
    zustandStatus = 'refreshing';
    const { result } = renderHook(() => useCart());
    expect(result.current.isFetching).toBe(true);
  });

  it('uses default clearCart error message for non-Error throws', async () => {
    const mockClearCart = jest.requireMock('@/repositories/cart/cart.repository')
      .clearCart as jest.Mock;
    mockClearCart.mockRejectedValue('clear failed');
    const { result } = renderHook(() => useCart());

    await result.current.actions.clearCart();

    await waitFor(() => {
      expect(mockClearCart).toHaveBeenCalled();
    });
  });

  it('uses default refreshCart error message for non-Error throws', async () => {
    (fetchCurrentCart as jest.Mock).mockRejectedValueOnce('refresh failed');
    const { result } = renderHook(() => useCart());

    await result.current.actions.refreshCart();

    await waitFor(() => {
      expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    });
  });
});

describe('useCart discounts', () => {
  const storeOffers = {
    availableDiscounts: [
      {
        offerType: 'store_offer' as const,
        discountCode: 'monsoon3',
        discountDetail: 'Get any 3 for ₹2699',
        amountSaved: 298,
      },
    ],
    unavailableDiscounts: [],
    appliedCode: null as string | null,
    appliedAmountSaved: 0,
    payableAfterDiscount: null as number | null,
  };

  const discountUpdatedCart: Cart = {
    id: 'cart-1',
    checkoutUrl: 'https://checkout.example.com',
    items: [
      {
        id: 'gid://shopify/CartLine/paid-line',
        quantity: 1,
        price: 999,
        totalPrice: 999,
        product_category: 'bracelets',
        isAvailable: true,
        product: {
          id: '7759111586049',
          name: 'Hearts All Over Bracelet',
          handle: 'hearts-all-over-bracelet',
          primaryImage: '',
          variantId: 'gid://shopify/ProductVariant/43070320148737',
          variantTitle: 'Default Title',
          product_category: 'bracelets',
        },
      },
      {
        id: 'gid://shopify/CartLine/free-line',
        quantity: 1,
        price: 0,
        totalPrice: 0,
        isFree: true,
        product_category: 'rings',
        isAvailable: true,
        product: {
          id: '43786050339073',
          name: 'Mini Solitaire Ring',
          handle: 'mini-solitaire-ring',
          primaryImage: '',
          variantId: 'gid://shopify/ProductVariant/43786050339073',
          variantTitle: '6',
          product_category: 'rings',
        },
      },
    ],
    totalItems: 2,
    subtotal: 2997,
    discount: 298,
    shipping: 0,
    tax: 0,
    total: 2699,
    currency: 'INR',
    appliedCouponCodes: ['monsoon3'],
  };

  const backendCartAfterApply = discountUpdatedCart;
  const backendCartAfterRemove: Cart = {
    ...cartWithItems,
    items: [cartWithItems.items[0]!],
    totalItems: 1,
    discount: 0,
    total: 100,
    appliedCouponCodes: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    zustandCart = cartWithItems;
    zustandStatus = 'idle';
    zustandUpdatingLineId = null;
    zustandRemovingLineId = null;
    zustandRequiresFreshCartFetch = false;
    mockUsePathname.mockReturnValue('/cart');
    mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } }, isGuest: false });
    mockCartAndDiscountQueries(cartWithItems, { discounts: storeOffers });
    (fetchCurrentCart as jest.Mock).mockResolvedValue(cartWithItems);
    (fetchCartDiscounts as jest.Mock).mockResolvedValue({
      availableDiscounts: storeOffers.availableDiscounts,
      unavailableDiscounts: [],
    });
    (applyCartDiscount as jest.Mock).mockResolvedValue({
      appliedDiscounts: [
        {
          title: 'monsoon3',
          discount_amount: 298,
          value_type: 'fixed_amount',
          discount_type: 'BXatY',
        },
      ],
      applyFailures: [],
      removedDiscounts: [],
      removeFailures: [],
      discountData: {
        total_discount: 298,
        total_price: 2699,
        offer_type: 'store_offer',
      },
      cart: discountUpdatedCart,
    });
  });

  it('exposes discount loading state independently from cart', () => {
    mockCartAndDiscountQueries(cartWithItems, {
      discounts: null,
      discountsLoading: true,
    });

    const { result } = renderHook(() => useCart());

    expect(result.current.cart?.id).toBe('cart-1');
    expect(result.current.discountsLoading).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('keeps discounts loading on offers while cart id is missing', () => {
    mockUsePathname.mockReturnValue('/cart/offers');
    zustandCart = null;
    mockCartAndDiscountQueries(null, {
      cartLoading: true,
      cartFetching: true,
      discounts: null,
    });

    const { result } = renderHook(() => useCart());

    expect(result.current.discountsLoading).toBe(true);
  });

  it('does not force-refresh the cart when opening /cart/offers', () => {
    mockUsePathname.mockReturnValue('/cart/offers');
    zustandRequiresFreshCartFetch = true;
    mockCartAndDiscountQueries(cartWithItems, { discounts: storeOffers });

    renderHook(() => useCart());

    expect(fetchCurrentCart).not.toHaveBeenCalled();
  });

  it('surfaces discount list error', async () => {
    mockCartAndDiscountQueries(cartWithItems, {
      discountsError: new Error('list failed'),
    });

    const { result } = renderHook(() => useCart());

    await waitFor(() => {
      expect(result.current.discountsError).toBe('list failed');
    });
  });

  it('applies discount code and refreshes cart', async () => {
    (fetchCurrentCart as jest.Mock).mockResolvedValue(backendCartAfterApply);
    const { result } = renderHook(() => useCart());

    await result.current.actions.applyDiscount('monsoon3');

    expect(applyCartDiscount).toHaveBeenCalledWith(
      expect.objectContaining({
        cart_id: 'cart-1',
        platform_source: 'app',
        coupon_codes: ['monsoon3'],
      }),
      expect.objectContaining({ existingCart: cartWithItems }),
    );
    expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    expect(mockSetQueryData).toHaveBeenCalledWith(
      queryKeys.cart.current(),
      backendCartAfterApply,
    );
    expect(mockSetQueryData).toHaveBeenCalledWith(
      queryKeys.cart.discounts('cart-1'),
      expect.objectContaining({
        appliedCode: 'monsoon3',
        appliedAmountSaved: 298,
        payableAfterDiscount: null,
      }),
    );
    expect(fetchCartDiscounts).toHaveBeenCalled();
  });

  it('removes discount with remove_coupon_codes', async () => {
    mockCartAndDiscountQueries(cartWithItems, {
      discounts: {
        ...storeOffers,
        appliedCode: 'monsoon3',
        appliedAmountSaved: 298,
        payableAfterDiscount: 5045,
      },
    });
    (applyCartDiscount as jest.Mock).mockResolvedValue({
      appliedDiscounts: [],
      applyFailures: [],
      removedDiscounts: [],
      removeFailures: [],
      discountData: null,
      cart: {
        ...cartWithItems,
        items: [cartWithItems.items[0]!],
        totalItems: 1,
        discount: 0,
        total: 100,
        appliedCouponCodes: undefined,
      },
    });
    (fetchCartDiscounts as jest.Mock).mockResolvedValue({
      availableDiscounts: storeOffers.availableDiscounts,
      unavailableDiscounts: [],
    });
    (fetchCurrentCart as jest.Mock).mockResolvedValue(backendCartAfterRemove);
    const { result } = renderHook(() => useCart());

    await result.current.actions.removeDiscount();

    expect(applyCartDiscount).toHaveBeenCalledWith(
      expect.objectContaining({ remove_coupon_codes: ['monsoon3'] }),
      expect.objectContaining({ existingCart: cartWithItems }),
    );
    expect(fetchCurrentCart).toHaveBeenCalledWith({ force: true });
    expect(mockSetQueryData).toHaveBeenCalledWith(
      queryKeys.cart.current(),
      backendCartAfterRemove,
    );
    expect(mockSetQueryData).toHaveBeenCalledWith(
      queryKeys.cart.discounts('cart-1'),
      expect.objectContaining({
        appliedCode: null,
        appliedAmountSaved: 0,
        payableAfterDiscount: null,
      }),
    );
  });

  it('uses refetched cart totals in summary after coupon apply/remove', () => {
    mockCartAndDiscountQueries(discountUpdatedCart, {
      discounts: {
        ...storeOffers,
        appliedCode: 'monsoon3',
        appliedAmountSaved: 298,
        payableAfterDiscount: null,
      },
    });

    const { result } = renderHook(() => useCart());

    expect(result.current.summary.discount).toBe(298);
    expect(result.current.summary.total).toBe(2699);
  });

  it('derives summary totals from cart snapshot without discount overlay', () => {
    mockCartAndDiscountQueries(
      {
        ...cartWithItems,
        discount: 298,
        total: 5045,
        appliedCouponCodes: ['monsoon3'],
      },
      {
        discounts: {
          ...storeOffers,
          appliedCode: 'monsoon3',
          appliedAmountSaved: 298,
          payableAfterDiscount: null,
        },
      },
    );

    const { result } = renderHook(() => useCart());

    expect(result.current.summary.discount).toBe(298);
    expect(result.current.summary.total).toBe(5045);
  });

  it('dedupes discount apply while mutation in flight', async () => {
    let resolveApply: (value: unknown) => void = () => {};
    (applyCartDiscount as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveApply = resolve;
      }),
    );

    const { result } = renderHook(() => useCart());
    let first!: Promise<void>;
    await act(async () => {
      first = result.current.actions.applyDiscount('monsoon3');
    });

    await waitFor(() => {
      expect(result.current.isDiscountMutating).toBe(true);
    });

    await result.current.actions.applyDiscount('monsoon2');

    expect(applyCartDiscount).toHaveBeenCalledTimes(1);
    resolveApply({
      appliedDiscounts: [
        { title: 'monsoon3', discount_amount: 298 },
      ],
      applyFailures: [],
      removedDiscounts: [],
      removeFailures: [],
      discountData: { total_discount: 298, total_price: 5045 },
    });
    await first;
  });

  it('skips discount queries off cart family routes', () => {
    mockUsePathname.mockReturnValue('/products/ring');
    const { result } = renderHook(() => useCart());

    expect(result.current.discountsLoading).toBe(false);
    expect(result.current.discounts).toBeNull();
  });

  it('invalidates discounts after successful addItem on cart', async () => {
    (addItems as jest.Mock).mockResolvedValue(cartWithItems);
    const { result } = renderHook(() => useCart());

    await result.current.actions.addItem('v1', 1);

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.cart.discounts('cart-1'),
    });
  });

  it('does not sync an optimistic cart before addItem API resolves', async () => {
    zustandCart = cartWithItems;
    mockCartAndDiscountQueries(cartWithItems);
    let resolveAdd!: (cart: Cart) => void;
    (addItems as jest.Mock).mockImplementation(
      () =>
        new Promise<Cart>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    const { result } = renderHook(() => useCart());
    const pending = result.current.actions.addItem('gid://shopify/ProductVariant/999', 1);

    await act(async () => {
      await Promise.resolve();
    });

    expect(applyOptimisticAdd).not.toHaveBeenCalled();
    expect(result.current.summary.total).toBe(100);
    expect(result.current.cart?.items).toHaveLength(1);

    await act(async () => {
      resolveAdd(cartWithItems);
      await pending;
    });
  });

  it('surfaces apply discount failure without clearing cache', async () => {
    (applyCartDiscount as jest.Mock).mockRejectedValue(new Error(cartMessages.errors.applyDiscount));
    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.applyDiscount('bad')).rejects.toThrow();
    await waitFor(() => {
      expect(result.current.discountsError).toBe(cartMessages.errors.applyDiscount);
    });
  });

  it('surfaces applyFailures from a 200 discount apply response without marking coupon applied', async () => {
    const apiMessage = 'The discount code entered is invalid. Please enter a valid code.';
    (fetchCurrentCart as jest.Mock).mockClear();
    (applyCartDiscount as jest.Mock).mockResolvedValue({
      appliedDiscounts: [],
      applyFailures: [{ discount_code: '123', error_message: apiMessage }],
      removedDiscounts: [],
      removeFailures: [],
      discountData: {
        total_discount: 0,
        total_price: 1105100,
        offer_type: 'store_offer',
      },
    });

    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.applyDiscount('123')).rejects.toThrow(apiMessage);

    await waitFor(() => {
      expect(result.current.discountsError).toBe(apiMessage);
    });
    expect(mockSetQueryData).not.toHaveBeenCalledWith(
      queryKeys.cart.discounts('cart-1'),
      expect.objectContaining({ appliedCode: '123' }),
    );
    expect(toastMock.showSuccess).not.toHaveBeenCalled();
    expect(toastMock.showError).toHaveBeenCalledTimes(1);
    expect(toastMock.showError).toHaveBeenCalledWith(apiMessage);
    expect(fetchCurrentCart).not.toHaveBeenCalled();
  });

  it('replaces add-more-products applyFailures with coupon-not-applicable copy', async () => {
    (fetchCurrentCart as jest.Mock).mockClear();
    (applyCartDiscount as jest.Mock).mockResolvedValue({
      appliedDiscounts: [],
      applyFailures: [
        {
          discount_code: 'bling40',
          error_message: 'Add 2 more products to avail this offer',
        },
      ],
      removedDiscounts: [],
      removeFailures: [],
      discountData: { total_discount: 0, total_price: 8417, offer_type: 'store_offer' },
    });

    const { result } = renderHook(() => useCart());

    await expect(result.current.actions.applyDiscount('bling40')).rejects.toThrow(
      cartMessages.errors.couponNotApplicable,
    );

    await waitFor(() => {
      expect(result.current.discountsError).toBe(cartMessages.errors.couponNotApplicable);
    });
    expect(toastMock.showError).toHaveBeenCalledWith(cartMessages.errors.couponNotApplicable);
    expect(fetchCurrentCart).not.toHaveBeenCalled();
  });
});
