import { create } from 'zustand';

import {
  CART_STATS_SYNC_DEBOUNCE_MS,
  CART_STATS_THROTTLE_MS,
  cartMessages,
} from '@/config/cart/cart.config';
import {
  clearCartStatsSnapshot,
  persistCartStatsSnapshot,
  type PersistedCartStatsSnapshot,
} from '@/lib/cart/cart-stats.local-data-source';
import { fetchCartStatsApi } from '@/services/cart/cart.service';
import type { Cart, CartStats } from '@/types/cart';

interface SetStatsFromApiOptions {
  /** When true, apply cartCount from stats (authenticated bootstrap). Default false. */
  applyCartCount?: boolean;
}

interface CartStatsState {
  cartCount: number;
  cartCountHydrated: boolean;
  wishlistCount: number;
  wishlistCountHydrated: boolean;
  loading: boolean;
  error: string | null;
  refresh: (options?: SetStatsFromApiOptions) => Promise<void>;
  refreshAfterAuth: () => Promise<void>;
  setStats: (stats: CartStats) => void;
  setStatsFromApi: (stats: CartStats, options?: SetStatsFromApiOptions) => void;
  applyPersistedSnapshot: (snapshot: PersistedCartStatsSnapshot) => void;
  syncCartCountFromCart: (cart: Cart | null) => void;
  /** Zeroes the wishlist badge — guest bootstrap, post-auth reset, and wishlist clear. */
  resetWishlistBadge: () => void;
  addCart: (amount?: number) => void;
  minusCart: (amount?: number) => void;
  addWishlist: (amount?: number) => void;
  minusWishlist: (amount?: number) => void;
}

let isStatsLoading = false;
let statsLoadPromise: Promise<CartStats> | null = null;
let refreshAfterAuthPromise: Promise<void> | null = null;
let lastStatsFetchTime = 0;
let wishlistSyncTimeoutId: ReturnType<typeof setTimeout> | null = null;
function scheduleWishlistSyncWithBackend() {
  if (wishlistSyncTimeoutId) clearTimeout(wishlistSyncTimeoutId);
  wishlistSyncTimeoutId = setTimeout(() => {
    wishlistSyncTimeoutId = null;
    void useCartStatsStore.getState().refresh();
  }, CART_STATS_SYNC_DEBOUNCE_MS);
}

/** Cancels pending debounced sync before auth-triggered refresh. */
function cancelPendingOptimisticSync() {
  if (wishlistSyncTimeoutId) {
    clearTimeout(wishlistSyncTimeoutId);
    wishlistSyncTimeoutId = null;
  }
}

/**
 * Fetches stats from API with in-flight deduplication and throttle.
 *
 * @param set - Zustand set partial.
 * @param get - Zustand get state.
 * @param options - Whether to apply cartCount from the stats response.
 */
async function fetchStatsFromServer(
  set: (partial: Partial<CartStatsState>) => void,
  get: () => CartStatsState,
  options?: SetStatsFromApiOptions,
): Promise<void> {
  if (isStatsLoading && statsLoadPromise) {
    const stats = await statsLoadPromise;
    get().setStatsFromApi(stats, options);
    return;
  }

  try {
    isStatsLoading = true;
    set({ loading: true, error: null });
    statsLoadPromise = fetchCartStatsApi();
    const stats = await statsLoadPromise;
    lastStatsFetchTime = Date.now();
    get().setStatsFromApi(stats, options);
  } catch (err) {
    const message = err instanceof Error ? err.message : cartMessages.errors.fetchStats;
    set({ loading: false, error: message });
  } finally {
    isStatsLoading = false;
    statsLoadPromise = null;
  }
}

/** Header badge cart/wishlist counts with optimistic local bumps. */
export const useCartStatsStore = create<CartStatsState>((set, get) => ({
  cartCount: 0,
  cartCountHydrated: false,
  wishlistCount: 0,
  wishlistCountHydrated: false,
  loading: false,
  error: null,

  /** Wishlist-only update (legacy alias — does not overwrite cartCount). */
  setStats: (stats) => {
    get().setStatsFromApi(stats, { applyCartCount: false });
  },

  setStatsFromApi: (stats, options) => {
    const applyCartCount = options?.applyCartCount === true;
    set((state) => {
      const nextState = {
        wishlistCount: stats.wishlistCount,
        wishlistCountHydrated: true,
        cartCount: applyCartCount ? stats.cartCount : state.cartCount,
        cartCountHydrated: applyCartCount ? true : state.cartCountHydrated,
        loading: false,
        error: null,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
  },

  applyPersistedSnapshot: (snapshot) => {
    set({
      cartCount: snapshot.cartCount,
      cartCountHydrated: snapshot.cartCountHydrated,
      wishlistCount: snapshot.wishlistCount,
      wishlistCountHydrated: snapshot.wishlistCountHydrated,
      loading: false,
      error: null,
    });
  },

  syncCartCountFromCart: (cart) => {
    cancelPendingOptimisticSync();
    set((state) => {
      const nextState = {
        cartCount: cart?.totalItems ?? 0,
        cartCountHydrated: true,
        wishlistCount: state.wishlistCount,
        wishlistCountHydrated: state.wishlistCountHydrated,
        loading: false,
        error: null,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
  },

  resetWishlistBadge: () => {
    cancelPendingOptimisticSync();
    set((state) => {
      const nextState = {
        wishlistCount: 0,
        wishlistCountHydrated: true,
        cartCount: state.cartCount,
        cartCountHydrated: state.cartCountHydrated,
        loading: false,
        error: null,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: 0,
        wishlistCountHydrated: true,
      });

      return nextState;
    });
  },

  addCart: (amount = 1) => {
    set((state) => {
      const nextState = {
        cartCount: Math.max(0, state.cartCount + amount),
        cartCountHydrated: true,
        wishlistCount: state.wishlistCount,
        wishlistCountHydrated: state.wishlistCountHydrated,
        loading: state.loading,
        error: state.error,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
  },

  minusCart: (amount = 1) => {
    set((state) => {
      const nextState = {
        cartCount: Math.max(0, state.cartCount - amount),
        cartCountHydrated: true,
        wishlistCount: state.wishlistCount,
        wishlistCountHydrated: state.wishlistCountHydrated,
        loading: state.loading,
        error: state.error,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
  },

  addWishlist: (amount = 1) => {
    set((state) => {
      const nextState = {
        wishlistCount: Math.max(0, state.wishlistCount + amount),
        wishlistCountHydrated: true,
        cartCount: state.cartCount,
        cartCountHydrated: state.cartCountHydrated,
        loading: state.loading,
        error: state.error,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
    scheduleWishlistSyncWithBackend();
  },

  minusWishlist: (amount = 1) => {
    set((state) => {
      const nextState = {
        wishlistCount: Math.max(0, state.wishlistCount - amount),
        wishlistCountHydrated: true,
        cartCount: state.cartCount,
        cartCountHydrated: state.cartCountHydrated,
        loading: state.loading,
        error: state.error,
      };

      persistCartStatsSnapshot({
        cartCount: nextState.cartCount,
        cartCountHydrated: nextState.cartCountHydrated,
        wishlistCount: nextState.wishlistCount,
        wishlistCountHydrated: nextState.wishlistCountHydrated,
      });

      return nextState;
    });
    scheduleWishlistSyncWithBackend();
  },

  refresh: async (options) => {
    const now = Date.now();
    if (now - lastStatsFetchTime < CART_STATS_THROTTLE_MS && !isStatsLoading) {
      return;
    }
    await fetchStatsFromServer(set, get, options);
  },

  refreshAfterAuth: async () => {
    if (refreshAfterAuthPromise) {
      await refreshAfterAuthPromise;
      return;
    }

    refreshAfterAuthPromise = (async () => {
      cancelPendingOptimisticSync();
      lastStatsFetchTime = 0;
      await fetchStatsFromServer(set, get, { applyCartCount: true });
    })().finally(() => {
      refreshAfterAuthPromise = null;
    });

    await refreshAfterAuthPromise;
  },
}));

/** Clears persisted badge counts — call on authenticated logout. */
export function clearPersistedCartStats(): void {
  clearCartStatsSnapshot();
}
