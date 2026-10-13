import type { QueryClient } from '@tanstack/react-query';

import {
  clearGuestCartSnapshot,
  readGuestCartSnapshot,
} from '@/lib/cart/guest-cart.local-data-source';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchCurrentCart,
  invalidateCartCache,
  mergeGuestCartAfterLogin,
} from '@/repositories/cart/cart.repository';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';
import type { Cart } from '@/types/cart';

export interface GuestCartMergeDeps {
  queryClient: QueryClient;
  setCart: (cart: Cart | null) => void;
  previousCart?: Cart | null;
}

let activeMerge: Promise<void> | null = null;

function cartHasItems(cart: Cart | null | undefined): boolean {
  return (cart?.items.length ?? 0) > 0;
}

async function runGuestCartMerge(deps: GuestCartMergeDeps): Promise<void> {
  const { queryClient, setCart, previousCart = null } = deps;
  const store = useCartStore.getState();
  const guestSnapshot = readGuestCartSnapshot() ?? previousCart;

  store.setCartMergeInProgress(true);

  try {
    invalidateCartCache();
    const mergedCart = await mergeGuestCartAfterLogin(guestSnapshot);
    const hadGuestItems = cartHasItems(guestSnapshot) || cartHasItems(previousCart);

    if (!cartHasItems(mergedCart) && hadGuestItems && guestSnapshot) {
      queryClient.setQueryData(queryKeys.cart.current(), guestSnapshot);
      store.markCartRequiresFreshFetch();
      return;
    }

    setCart(mergedCart);
    queryClient.setQueryData(queryKeys.cart.current(), mergedCart);
    useCartStatsStore.getState().syncCartCountFromCart(mergedCart);
    store.clearCartRequiresFreshFetch();
    clearGuestCartSnapshot();
    await useCartStatsStore.getState().refreshAfterAuth();
  } catch {
    if (previousCart) {
      queryClient.setQueryData(queryKeys.cart.current(), previousCart);
      store.markCartRequiresFreshFetch();
    }
  } finally {
    store.setCartMergeInProgress(false);
  }
}

/**
 * Starts guest→user cart merge with in-flight deduplication.
 */
export function beginGuestCartMerge(deps: GuestCartMergeDeps): Promise<void> {
  if (activeMerge) {
    return activeMerge;
  }

  activeMerge = runGuestCartMerge(deps).finally(() => {
    activeMerge = null;
  });

  return activeMerge;
}

/** Awaits in-flight guest cart merge (e.g. before checkout pre-validation). */
export async function waitForGuestCartMerge(): Promise<void> {
  if (activeMerge) {
    await activeMerge;
  }
}

/**
 * Starts merge using current Zustand cart snapshot — for checkout login before effects run.
 */
export function beginGuestCartMergeFromStore(queryClient: QueryClient): Promise<void> {
  const { setCart, cart } = useCartStore.getState();
  return beginGuestCartMerge({ queryClient, setCart, previousCart: cart });
}

/**
 * Fetches cart via TanStack Query and syncs Zustand after authenticated→guest transition.
 */
export async function syncCartAfterAuthChange(
  queryClient: QueryClient,
  setCart: (cart: Cart | null) => void,
): Promise<Cart> {
  invalidateCartCache();

  const cart = await queryClient.fetchQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => fetchCurrentCart({ force: true }),
  });

  setCart(cart);
  queryClient.setQueryData(queryKeys.cart.current(), cart);
  useCartStatsStore.getState().syncCartCountFromCart(cart);
  return cart;
}
