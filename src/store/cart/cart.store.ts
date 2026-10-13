import { create } from 'zustand';

import type { Cart, CartStatus } from '@/types/cart';

/** Zustand state for optimistic cart display and per-line mutation flags. */
interface CartState {
  cart: Cart | null;
  status: CartStatus;
  error: string | null;
  lastSyncedAt: number | null;
  updatingLineId: string | null;
  removingLineId: string | null;
  /** When true, `/cart` must bypass stale cache and force GET /cart/current. */
  requiresFreshCartFetch: boolean;
  /** True while guest→authenticated cart merge is in flight. */
  cartMergeInProgress: boolean;
  /** Shopify cart GID returned from cart / cart_jwe login — consumed at checkout. */
  postLoginCheckoutCartId: string | null;
  /** Skips PostAuthSync merge once after cart / cart_jwe login. */
  skipNextGuestCartMerge: boolean;
  setCart: (cart: Cart | null) => void;
  setStatus: (status: CartStatus) => void;
  setError: (error: string | null) => void;
  setUpdatingLineId: (lineId: string | null) => void;
  setRemovingLineId: (lineId: string | null) => void;
  markCartRequiresFreshFetch: () => void;
  clearCartRequiresFreshFetch: () => void;
  setCartMergeInProgress: (inProgress: boolean) => void;
  setPostLoginCheckoutCartId: (cartId: string | null) => void;
  consumePostLoginCheckoutCartId: () => string | null;
  setSkipNextGuestCartMerge: (skip: boolean) => void;
  consumeSkipNextGuestCartMerge: () => boolean;
  reset: () => void;
}

const initialState = {
  cart: null as Cart | null,
  status: 'idle' as CartStatus,
  error: null as string | null,
  lastSyncedAt: null as number | null,
  updatingLineId: null as string | null,
  removingLineId: null as string | null,
  requiresFreshCartFetch: false,
  cartMergeInProgress: false,
  postLoginCheckoutCartId: null as string | null,
  skipNextGuestCartMerge: false,
};

/** Client cart store — holds optimistic cart and mutation UX flags. */
export const useCartStore = create<CartState>((set, get) => ({
  ...initialState,
  setCart: (cart) =>
    set({
      cart,
      lastSyncedAt: cart ? Date.now() : null,
    }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? 'error' : 'idle' }),
  setUpdatingLineId: (updatingLineId) => set({ updatingLineId }),
  setRemovingLineId: (removingLineId) => set({ removingLineId }),
  markCartRequiresFreshFetch: () => set({ requiresFreshCartFetch: true }),
  clearCartRequiresFreshFetch: () => set({ requiresFreshCartFetch: false }),
  setCartMergeInProgress: (cartMergeInProgress) => set({ cartMergeInProgress }),
  setPostLoginCheckoutCartId: (postLoginCheckoutCartId) => set({ postLoginCheckoutCartId }),
  consumePostLoginCheckoutCartId: (): string | null => {
    const cartId = get().postLoginCheckoutCartId;
    set({ postLoginCheckoutCartId: null });
    return cartId;
  },
  setSkipNextGuestCartMerge: (skipNextGuestCartMerge) => set({ skipNextGuestCartMerge }),
  consumeSkipNextGuestCartMerge: (): boolean => {
    const skip = get().skipNextGuestCartMerge;
    set({ skipNextGuestCartMerge: false });
    return skip;
  },
  reset: () => set(initialState),
}));

/**
 * Resets cart Zustand state on logout.
 * Called from auth repository after token clear.
 */
export function resetCartSession(): void {
  useCartStore.getState().reset();
}
