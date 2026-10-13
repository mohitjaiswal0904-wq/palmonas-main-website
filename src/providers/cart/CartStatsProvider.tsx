'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useStore } from 'zustand';

import { useAuth } from '@/hooks/auth/useAuth';
import { readCartStatsSnapshot } from '@/lib/cart/cart-stats.local-data-source';
import {
  cartNeedsImageRefresh,
  readGuestCartSnapshot,
} from '@/lib/cart/guest-cart.local-data-source';
import { queryKeys } from '@/lib/query/keys';
import { hydrateAuthenticatedCartLines } from '@/services/cart/cart-hydrate.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';

const subscribeNoop = (): (() => void) => () => undefined;

/**
 * True only after client hydration — keeps badge HTML matched to SSR (no count).
 * Same protocol as PincodeProvider (`useSyncExternalStore` server snapshot).
 */
function useClientHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

interface SetStatsFromApiOptions {
  applyCartCount?: boolean;
}

export interface CartStatsContextValue {
  cartCount: number;
  cartCountHydrated: boolean;
  wishlistCount: number;
  wishlistCountHydrated: boolean;
  loading: boolean;
  error: string | null;
  refresh: (options?: SetStatsFromApiOptions) => Promise<void>;
  refreshAfterAuth: () => Promise<void>;
  addCart: (amount?: number) => void;
  minusCart: (amount?: number) => void;
  addWishlist: (amount?: number) => void;
  minusWishlist: (amount?: number) => void;
}

const CartStatsContext = createContext<CartStatsContextValue | null>(null);

/** Subscribes to badge store slices for context consumers. */
function useCartStatsStoreValue(): CartStatsContextValue {
  const clientHydrated = useClientHydrated();
  const cartCount = useStore(useCartStatsStore, (state) => state.cartCount);
  const cartCountHydrated = useStore(useCartStatsStore, (state) => state.cartCountHydrated);
  const wishlistCount = useStore(useCartStatsStore, (state) => state.wishlistCount);
  const wishlistCountHydrated = useStore(useCartStatsStore, (state) => state.wishlistCountHydrated);
  const loading = useStore(useCartStatsStore, (state) => state.loading);
  const error = useStore(useCartStatsStore, (state) => state.error);
  const refresh = useStore(useCartStatsStore, (state) => state.refresh);
  const refreshAfterAuth = useStore(useCartStatsStore, (state) => state.refreshAfterAuth);
  const addCart = useStore(useCartStatsStore, (state) => state.addCart);
  const minusCart = useStore(useCartStatsStore, (state) => state.minusCart);
  const addWishlist = useStore(useCartStatsStore, (state) => state.addWishlist);
  const minusWishlist = useStore(useCartStatsStore, (state) => state.minusWishlist);

  // Gate hydrated flags so SSR + first client hydration never emit badge HTML.
  const displayCartCountHydrated = clientHydrated && cartCountHydrated;
  const displayWishlistCountHydrated = clientHydrated && wishlistCountHydrated;

  return useMemo(
    () => ({
      cartCount,
      cartCountHydrated: displayCartCountHydrated,
      wishlistCount,
      wishlistCountHydrated: displayWishlistCountHydrated,
      loading,
      error,
      refresh,
      refreshAfterAuth,
      addCart,
      minusCart,
      addWishlist,
      minusWishlist,
    }),
    [
      addCart,
      addWishlist,
      cartCount,
      displayCartCountHydrated,
      displayWishlistCountHydrated,
      error,
      loading,
      minusCart,
      minusWishlist,
      refresh,
      refreshAfterAuth,
      wishlistCount,
    ],
  );
}

/**
 * Cold-start badge hydration:
 * - Guest: guest cart snapshot + zero wishlist
 * - Authenticated: persisted stats snapshot, `/api/v2/cart/stats`, and cart lines for PLP badges
 */
function useCartStatsBootstrap(enabled: boolean, isGuest: boolean): void {
  const queryClient = useQueryClient();
  const didHydrateRef = useRef(false);

  useEffect(() => {
    if (!enabled || didHydrateRef.current) {
      return;
    }

    didHydrateRef.current = true;

    const { setCart } = useCartStore.getState();
    const { applyPersistedSnapshot, resetWishlistBadge, syncCartCountFromCart, refresh } =
      useCartStatsStore.getState();

    if (isGuest) {
      const snapshot = readGuestCartSnapshot();
      setCart(snapshot);
      syncCartCountFromCart(snapshot);
      resetWishlistBadge();
      if (snapshot) {
        queryClient.setQueryData(queryKeys.cart.current(), snapshot);
        if (cartNeedsImageRefresh(snapshot)) {
          useCartStore.getState().markCartRequiresFreshFetch();
        }
      }
      return;
    }

    const persistedStats = readCartStatsSnapshot();
    if (persistedStats) {
      applyPersistedSnapshot(persistedStats);
    }

    void refresh({ applyCartCount: true });
    void hydrateAuthenticatedCartLines()
      .then((cart) => {
        queryClient.setQueryData(queryKeys.cart.current(), cart);
      })
      .catch(() => undefined);
  }, [enabled, isGuest, queryClient]);
}

/** Global cart/wishlist badge context backed by persisted stats + `/api/v2/cart/stats`. */
export function CartStatsProvider({ children }: { children: ReactNode }) {
  const { session, isLoading, isGuest } = useAuth();
  const value = useCartStatsStoreValue();

  useCartStatsBootstrap(Boolean(session) && !isLoading, isGuest);

  return <CartStatsContext.Provider value={value}>{children}</CartStatsContext.Provider>;
}

/**
 * Returns global cart and wishlist badge counts for header badges.
 *
 * @returns Persisted badge counts, hydration flags, and refresh helpers.
 */
export function useCartStats(): CartStatsContextValue {
  const context = useContext(CartStatsContext);
  if (!context) {
    throw new Error('useCartStats must be used within CartStatsProvider');
  }
  return context;
}
