const mockMergeGuestCartAfterLogin = jest.fn();
const mockInvalidateCartCache = jest.fn();
const mockSetCartMergeInProgress = jest.fn();
const mockMarkCartRequiresFreshFetch = jest.fn();
const mockClearCartRequiresFreshFetch = jest.fn();
const mockSetCart = jest.fn();
const mockRefreshAfterAuth = jest.fn();
const mockSyncCartCountFromCart = jest.fn();
const mockReadGuestCartSnapshot = jest.fn();
const mockClearGuestCartSnapshot = jest.fn();

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  readGuestCartSnapshot: () => mockReadGuestCartSnapshot(),
  clearGuestCartSnapshot: () => mockClearGuestCartSnapshot(),
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  mergeGuestCartAfterLogin: (...args: unknown[]) => mockMergeGuestCartAfterLogin(...args),
  invalidateCartCache: () => mockInvalidateCartCache(),
}));

jest.mock('@/store/cart/cart.store', () => ({
  useCartStore: {
    getState: jest.fn(() => ({
      setCart: mockSetCart,
      cart: null,
      setCartMergeInProgress: mockSetCartMergeInProgress,
      markCartRequiresFreshFetch: mockMarkCartRequiresFreshFetch,
      clearCartRequiresFreshFetch: mockClearCartRequiresFreshFetch,
    })),
  },
}));

jest.mock('@/store/cart/cart-stats.store', () => ({
  useCartStatsStore: {
    getState: () => ({
      refreshAfterAuth: mockRefreshAfterAuth,
      syncCartCountFromCart: mockSyncCartCountFromCart,
    }),
  },
}));

import {
  beginGuestCartMerge,
  waitForGuestCartMerge,
} from '@/services/cart/guest-cart-merge.service';

const mockQueryClient = {
  setQueryData: jest.fn(),
};

const mockCart = {
  id: 'cart-merged',
  items: [{ id: 'line-1' }],
  totalItems: 1,
  subtotal: 100,
  total: 100,
  tax: 0,
  shipping: 0,
  discount: 0,
  currency: 'INR',
  checkoutUrl: '',
};

describe('guest-cart-merge.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadGuestCartSnapshot.mockReturnValue(null);
    mockMergeGuestCartAfterLogin.mockResolvedValue(mockCart);
    mockRefreshAfterAuth.mockResolvedValue(undefined);
  });

  it('waitForGuestCartMerge resolves when no merge is in flight', async () => {
    await expect(waitForGuestCartMerge()).resolves.toBeUndefined();
  });

  it('beginGuestCartMerge dedupes concurrent calls', async () => {
    let resolveMerge: () => void = () => {};
    mockMergeGuestCartAfterLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMerge = () => resolve(mockCart);
        }),
    );

    const deps = {
      queryClient: mockQueryClient as never,
      setCart: mockSetCart,
      previousCart: null,
    };

    const first = beginGuestCartMerge(deps);
    const second = beginGuestCartMerge(deps);

    expect(second).toBe(first);
    expect(mockMergeGuestCartAfterLogin).toHaveBeenCalledTimes(1);

    resolveMerge();
    await first;

    expect(mockSetCartMergeInProgress).toHaveBeenCalledWith(true);
    expect(mockSetCartMergeInProgress).toHaveBeenLastCalledWith(false);
  });

  it('waitForGuestCartMerge awaits in-flight merge', async () => {
    const deps = {
      queryClient: mockQueryClient as never,
      setCart: mockSetCart,
      previousCart: null,
    };

    const merge = beginGuestCartMerge(deps);
    let settled = false;
    void waitForGuestCartMerge().then(() => {
      settled = true;
    });

    await Promise.resolve();
    expect(settled).toBe(false);

    await merge;
    await waitForGuestCartMerge();
    expect(settled).toBe(true);
  });
});
