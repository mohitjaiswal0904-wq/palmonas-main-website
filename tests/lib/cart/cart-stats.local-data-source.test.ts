import {
  clearCartStatsSnapshot,
  persistCartStatsSnapshot,
  readCartStatsSnapshot,
} from '@/lib/cart/cart-stats.local-data-source';

describe('cart-stats.local-data-source', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists and reads badge snapshot', () => {
    persistCartStatsSnapshot({
      cartCount: 5,
      cartCountHydrated: true,
      wishlistCount: 16,
      wishlistCountHydrated: true,
    });

    expect(readCartStatsSnapshot()).toEqual({
      cartCount: 5,
      cartCountHydrated: true,
      wishlistCount: 16,
      wishlistCountHydrated: true,
    });
  });

  it('returns null for invalid persisted JSON', () => {
    localStorage.setItem('palmonas_cart_stats', '{"cartCount":"bad"}');
    expect(readCartStatsSnapshot()).toBeNull();
  });

  it('clears persisted snapshot', () => {
    persistCartStatsSnapshot({
      cartCount: 1,
      cartCountHydrated: true,
      wishlistCount: 2,
      wishlistCountHydrated: true,
    });

    clearCartStatsSnapshot();
    expect(readCartStatsSnapshot()).toBeNull();
  });
});
