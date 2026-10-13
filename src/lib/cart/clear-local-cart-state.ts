import { clearGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import { invalidateCartCache } from '@/repositories/cart/cart.repository';
import { clearPersistedCartStats, useCartStatsStore } from '@/store/cart/cart-stats.store';
import { resetCartSession } from '@/store/cart/cart.store';

/**
 * Clears client-side cart state on logout (Zustand, guest snapshot, repo cache, badge counts).
 */
export function clearLocalCartState(): void {
  resetCartSession();
  clearGuestCartSnapshot();
  invalidateCartCache();
  useCartStatsStore.getState().syncCartCountFromCart(null);
  useCartStatsStore.getState().resetWishlistBadge();
  clearPersistedCartStats();
}
