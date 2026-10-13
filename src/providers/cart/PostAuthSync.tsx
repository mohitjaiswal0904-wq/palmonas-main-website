'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import { clearSearchHistoryCache, forcePrefetchSearchHistory } from '@/hooks/useSearchHistory';
import { clearLocalCartState } from '@/lib/cart/clear-local-cart-state';
import {
  persistGuestCartSnapshot,
  clearGuestCartSnapshot,
} from '@/lib/cart/guest-cart.local-data-source';
import { queryKeys } from '@/lib/query/keys';
import { invalidateCartCache } from '@/repositories/cart/cart.repository';
import {
  beginGuestCartMerge,
  syncCartAfterAuthChange,
} from '@/services/cart/guest-cart-merge.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';

/**
 * Clears user-scoped caches and loads guest cart after authenticated→guest transition.
 * Persists the resulting guest cart so badge survives refresh without a global GET.
 */
async function syncUserToGuestSession(
  queryClient: ReturnType<typeof useQueryClient>,
  setCart: ReturnType<typeof useCartStore.getState>['setCart'],
): Promise<void> {
  clearLocalCartState();
  useCartStore.getState().markCartRequiresFreshFetch();
  queryClient.removeQueries({ queryKey: queryKeys.cart.all });
  queryClient.removeQueries({ queryKey: queryKeys.user.all });
  clearSearchHistoryCache(queryClient);
  const cart = await syncCartAfterAuthChange(queryClient, setCart);
  persistGuestCartSnapshot(cart);
  useCartStatsStore.getState().resetWishlistBadge();
  await useCartStatsStore.getState().refreshAfterAuth();
  useCartStatsStore.getState().syncCartCountFromCart(cart);
}

/**
 * Watches auth transitions and refreshes cart + search-history state without duplicate API calls.
 * Backend merges guest cart via `cart_id` + Bearer + `device_id`; merge helper syncs UI.
 * Search history force-prefetch runs once here on guest→login (not per HeaderSearch mount).
 */
export function PostAuthSync() {
  const { isGuest, isAuthenticated, isLoading } = useAuth();
  const wasGuestRef = useRef<boolean | null>(null);
  const queryClient = useQueryClient();
  const setCart = useCartStore((s) => s.setCart);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const wasGuest = wasGuestRef.current;
    wasGuestRef.current = isGuest;

    if (wasGuest === null) {
      return;
    }

    if (wasGuest === true && isGuest === false && isAuthenticated) {
      forcePrefetchSearchHistory(queryClient);

      if (useCartStore.getState().consumeSkipNextGuestCartMerge()) {
        useCartStore.getState().markCartRequiresFreshFetch();
        invalidateCartCache();
        queryClient.removeQueries({ queryKey: queryKeys.cart.all });
        void syncCartAfterAuthChange(queryClient, setCart).then((cart) => {
          clearGuestCartSnapshot();
          useCartStatsStore.getState().syncCartCountFromCart(cart);
          void useCartStatsStore.getState().refreshAfterAuth();
        });
        return;
      }

      const previousCart = useCartStore.getState().cart;
      void beginGuestCartMerge({ queryClient, setCart, previousCart });
    } else if (wasGuest === false && isGuest === true) {
      void syncUserToGuestSession(queryClient, setCart);
    }
  }, [isAuthenticated, isGuest, isLoading, queryClient, setCart]);

  return null;
}
