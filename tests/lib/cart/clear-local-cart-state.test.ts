import { clearGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import { clearLocalCartState } from '@/lib/cart/clear-local-cart-state';
import { invalidateCartCache } from '@/repositories/cart/cart.repository';
import { clearPersistedCartStats } from '@/store/cart/cart-stats.store';
import { resetCartSession } from '@/store/cart/cart.store';

const mockSyncCartCountFromCart = jest.fn();
const mockResetWishlistBadge = jest.fn();

jest.mock('@/lib/cart/guest-cart.local-data-source', () => ({
  clearGuestCartSnapshot: jest.fn(),
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  invalidateCartCache: jest.fn(),
}));

jest.mock('@/store/cart/cart.store', () => ({
  resetCartSession: jest.fn(),
}));

jest.mock('@/store/cart/cart-stats.store', () => ({
  clearPersistedCartStats: jest.fn(),
  useCartStatsStore: {
    getState: () => ({
      syncCartCountFromCart: mockSyncCartCountFromCart,
      resetWishlistBadge: mockResetWishlistBadge,
    }),
  },
}));

describe('clearLocalCartState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets cart session and clears guest snapshot', () => {
    clearLocalCartState();

    expect(resetCartSession).toHaveBeenCalledTimes(1);
    expect(clearGuestCartSnapshot).toHaveBeenCalledTimes(1);
    expect(invalidateCartCache).toHaveBeenCalledTimes(1);
    expect(mockSyncCartCountFromCart).toHaveBeenCalledWith(null);
    expect(mockResetWishlistBadge).toHaveBeenCalledTimes(1);
    expect(clearPersistedCartStats).toHaveBeenCalledTimes(1);
  });

  it('zeros badge counts via cart stats store', () => {
    clearLocalCartState();

    expect(mockSyncCartCountFromCart).toHaveBeenCalledWith(null);
    expect(mockResetWishlistBadge).toHaveBeenCalledTimes(1);
  });

  it('does not throw when stats store is already empty', () => {
    mockSyncCartCountFromCart.mockImplementation(() => undefined);

    expect(() => clearLocalCartState()).not.toThrow();
  });

  it('invalidates in-memory cart cache after logout', () => {
    clearLocalCartState();

    expect(invalidateCartCache).toHaveBeenCalledTimes(1);
    expect(clearGuestCartSnapshot).toHaveBeenCalledTimes(1);
  });
});
