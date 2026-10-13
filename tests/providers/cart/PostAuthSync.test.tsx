import { act, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import { PostAuthSync } from '@/providers/cart/PostAuthSync';

const mockMergeGuestCartAfterLogin = jest.fn();
const mockFetchCurrentCart = jest.fn();
const mockInvalidateCartCache = jest.fn();
const mockRefreshAfterAuth = jest.fn();
const mockSyncCartCountFromCart = jest.fn();
const mockSetCart = jest.fn();
const mockClearGuestCartSnapshot = jest.fn();
const mockPersistGuestCartSnapshot = jest.fn();
const mockReadGuestCartSnapshot = jest.fn();
const mockMarkCartRequiresFreshFetch = jest.fn();
const mockClearCartRequiresFreshFetch = jest.fn();
const mockSetCartMergeInProgress = jest.fn();
const mockConsumeSkipNextGuestCartMerge = jest.fn(() => false);
const mockForcePrefetchSearchHistory = jest.fn();
const mockClearSearchHistoryCache = jest.fn();

let authState = { isGuest: true, isAuthenticated: false, isLoading: false };

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => authState,
}));

jest.mock('@/hooks/useSearchHistory', () => ({
  forcePrefetchSearchHistory: (...args: unknown[]) => mockForcePrefetchSearchHistory(...args),
  clearSearchHistoryCache: (...args: unknown[]) => mockClearSearchHistoryCache(...args),
}));

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  clearGuestCartSnapshot: () => mockClearGuestCartSnapshot(),
  persistGuestCartSnapshot: (...args: unknown[]) => mockPersistGuestCartSnapshot(...args),
  readGuestCartSnapshot: () => mockReadGuestCartSnapshot(),
}));

const mockClearLocalCartState = jest.fn();
jest.mock('@/lib/cart/clear-local-cart-state', () => ({
  clearLocalCartState: () => mockClearLocalCartState(),
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  fetchCurrentCart: (...args: unknown[]) => mockFetchCurrentCart(...args),
  invalidateCartCache: () => mockInvalidateCartCache(),
  mergeGuestCartAfterLogin: (...args: unknown[]) => mockMergeGuestCartAfterLogin(...args),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: Object.assign(
    (selector: (state: { setCart: jest.Mock; cart: unknown }) => unknown) =>
      selector({ setCart: mockSetCart, cart: mockCartStoreState }),
    {
      getState: jest.fn(() => ({
        setCart: mockSetCart,
        cart: mockCartStoreState,
        markCartRequiresFreshFetch: mockMarkCartRequiresFreshFetch,
        clearCartRequiresFreshFetch: mockClearCartRequiresFreshFetch,
        setCartMergeInProgress: mockSetCartMergeInProgress,
        consumeSkipNextGuestCartMerge: mockConsumeSkipNextGuestCartMerge,
      })),
    },
  ),
}));

jest.mock('@/store/cart/cart-stats.store', () => ({
  clearPersistedCartStats: jest.fn(),
  useCartStatsStore: {
    getState: () => ({
      refreshAfterAuth: mockRefreshAfterAuth,
      syncCartCountFromCart: mockSyncCartCountFromCart,
      resetWishlistBadge: jest.fn(),
    }),
  },
}));

let mockCartStoreState: { id: string; items: Array<{ id: string }> } | null = null;

const mockCart = {
  id: 'cart-1',
  items: [],
  totalItems: 0,
  subtotal: 0,
  total: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: null,
};

function renderWithClient(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <PostAuthSync />
    </QueryClientProvider>,
  );
}

describe('PostAuthSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authState = { isGuest: true, isAuthenticated: false, isLoading: false };
    mockCartStoreState = null;
    mockReadGuestCartSnapshot.mockReturnValue(null);
    mockMergeGuestCartAfterLogin.mockResolvedValue(mockCart);
    mockFetchCurrentCart.mockResolvedValue(mockCart);
    mockRefreshAfterAuth.mockResolvedValue(undefined);
  });

  it('merges cart once on guest to authenticated transition', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockSetCartMergeInProgress).toHaveBeenCalledWith(true);
      expect(mockMergeGuestCartAfterLogin).toHaveBeenCalledTimes(1);
      expect(mockForcePrefetchSearchHistory).toHaveBeenCalledTimes(1);
      expect(mockClearCartRequiresFreshFetch).toHaveBeenCalled();
      expect(mockClearGuestCartSnapshot).toHaveBeenCalled();
      expect(mockRefreshAfterAuth).toHaveBeenCalledTimes(1);
      expect(mockSetCartMergeInProgress).toHaveBeenLastCalledWith(false);
    });
  });

  it('dedupes concurrent guest to authenticated merge calls', async () => {
    let resolveMerge: (value: typeof mockCart) => void = () => {};
    mockMergeGuestCartAfterLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMerge = resolve;
        }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await act(async () => {
      resolveMerge(mockCart);
    });

    await waitFor(() => {
      expect(mockMergeGuestCartAfterLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('clears cart and wallet queries on authenticated to guest transition', async () => {
    authState = { isGuest: false, isAuthenticated: true, isLoading: false };

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const removeQueriesSpy = jest.spyOn(queryClient, 'removeQueries');

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: true, isAuthenticated: false, isLoading: false };
    await act(async () => {
      rerender(
        <QueryClientProvider client={queryClient}>
          <PostAuthSync />
        </QueryClientProvider>,
      );
    });

    await waitFor(() => {
      expect(mockClearLocalCartState).toHaveBeenCalledTimes(1);
      expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: queryKeys.cart.all });
      expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: queryKeys.user.all });
      expect(mockClearSearchHistoryCache).toHaveBeenCalledTimes(1);
      expect(mockMarkCartRequiresFreshFetch).toHaveBeenCalled();
      expect(mockPersistGuestCartSnapshot).toHaveBeenCalled();
      expect(mockRefreshAfterAuth).toHaveBeenCalledTimes(1);
    });
  });

  it('skips sync while auth is still bootstrapping', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    authState = { isGuest: true, isAuthenticated: false, isLoading: true };
    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: true };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    expect(mockMergeGuestCartAfterLogin).not.toHaveBeenCalled();
    expect(mockRefreshAfterAuth).not.toHaveBeenCalled();
  });

  it('preserves prior cart when merge returns empty', async () => {
    const guestCart = {
      id: 'guest-cart',
      items: [{ id: 'line-1' }],
      totalItems: 1,
      subtotal: 100,
      total: 100,
      tax: 0,
      shipping: 0,
      discount: 0,
      currency: 'INR',
      checkoutUrl: null,
    };
    mockCartStoreState = guestCart;
    mockReadGuestCartSnapshot.mockReturnValue(guestCart);
    mockMergeGuestCartAfterLogin.mockResolvedValue({
      ...mockCart,
      id: 'user-cart',
      items: [],
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockMergeGuestCartAfterLogin).toHaveBeenCalledWith(guestCart);
    });

    expect(mockSetCart).not.toHaveBeenCalledWith(expect.objectContaining({ items: [] }));
    expect(queryClient.getQueryData(queryKeys.cart.current())).toEqual(guestCart);
    expect(mockMarkCartRequiresFreshFetch).toHaveBeenCalled();
    expect(mockClearCartRequiresFreshFetch).not.toHaveBeenCalled();
  });

  it('restores previous cart when merge throws', async () => {
    const guestCart = {
      id: 'guest-cart',
      items: [{ id: 'line-1' }],
      totalItems: 1,
      subtotal: 100,
      total: 100,
      tax: 0,
      shipping: 0,
      discount: 0,
      currency: 'INR',
      checkoutUrl: null,
    };
    mockCartStoreState = guestCart;
    mockMergeGuestCartAfterLogin.mockRejectedValue(new Error('merge failed'));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(queryClient.getQueryData(queryKeys.cart.current())).toEqual(guestCart);
    });
    expect(mockMarkCartRequiresFreshFetch).toHaveBeenCalled();
    expect(mockSetCartMergeInProgress).toHaveBeenLastCalledWith(false);
  });

  it('accepts merged cart when merge returns items', async () => {
    const guestCart = {
      id: 'guest-cart',
      items: [{ id: 'line-1' }],
      totalItems: 1,
      subtotal: 100,
      total: 100,
      tax: 0,
      shipping: 0,
      discount: 0,
      currency: 'INR',
      checkoutUrl: null,
    };
    const mergedCart = {
      ...guestCart,
      id: 'user-cart',
      items: [{ id: 'line-1' }, { id: 'line-2' }],
      totalItems: 2,
    };
    mockCartStoreState = guestCart;
    mockMergeGuestCartAfterLogin.mockResolvedValue(mergedCart);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockSetCart).toHaveBeenCalledWith(mergedCart);
      expect(mockClearCartRequiresFreshFetch).toHaveBeenCalled();
    });
  });

  it('skips guest merge and fetches current cart after cart_jwe login', async () => {
    mockConsumeSkipNextGuestCartMerge.mockReturnValueOnce(true);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { rerender } = renderWithClient(queryClient);

    authState = { isGuest: false, isAuthenticated: true, isLoading: false };
    rerender(
      <QueryClientProvider client={queryClient}>
        <PostAuthSync />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(mockMergeGuestCartAfterLogin).not.toHaveBeenCalled();
      expect(mockFetchCurrentCart).toHaveBeenCalled();
      expect(mockClearGuestCartSnapshot).toHaveBeenCalled();
    });
  });
});
