'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CART_CACHE_MS, cartMessages } from '@/config/cart/cart.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { resolveManualCouponApplyError } from '@/lib/cart/coupon-apply-error';
import { persistGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import { queryKeys } from '@/lib/query/keys';
import {
  addItems,
  applyCartDiscount,
  applyCartLineMutations,
  applyOptimisticQuantity,
  fetchCartDiscounts,
  fetchCurrentCart,
  invalidateCartCache,
  removeLines,
  updateLineQuantity,
  validatePreCheckout,
  clearCart as clearCartRepo,
} from '@/repositories/cart/cart.repository';
import { prepareCheckoutCart } from '@/services/cart/cart-checkout.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import { useCartStore } from '@/store/cart/cart.store';
import {
  cartToSummary,
  resolveCartDiscountApplyFailureMessage,
  type Cart,
  type CartDiscountsState,
  type ClubbedCartMutation,
  type UseCartReturn,
} from '@/types/cart';

function pickDisplayCart(
  fromStore: Cart | null,
  fromQuery: Cart | null | undefined,
  preferNonEmpty: boolean,
): Cart | null {
  if (preferNonEmpty) {
    if (fromStore?.items.length) return fromStore;
    if (fromQuery?.items.length) return fromQuery;
  }
  return fromStore ?? fromQuery ?? null;
}

/** Builds discount request metadata shared by list/apply. */
function buildDiscountRequestMeta(cartId: string) {
  return {
    cart_id: cartId,
    platform_source: 'app',
    utm_details: '',
    request_id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  };
}

/**
 * Resolves the applied store coupon code from discount cache or cart.
 *
 * @param discounts - Cached discount state.
 * @param cart - Current cart (fallback for pre-applied codes).
 * @returns Applied coupon code or null.
 */
function resolveAppliedCouponCode(
  discounts: CartDiscountsState | null,
  cart: Cart | null,
): string | null {
  const fromDiscounts = discounts?.appliedCode?.trim();
  if (fromDiscounts) {
    return fromDiscounts;
  }
  const fromCart = cart?.appliedCouponCodes?.[0]?.trim();
  return fromCart || null;
}

/**
 * Builds discount cache after apply/clear while preserving offer lists.
 *
 * @param previous - Prior cached list state.
 * @param appliedCode - Code to mark applied, or null when cleared.
 * @param amountSaved - Coupon savings from authoritative cart GET.
 */
function mergeAppliedDiscountState(
  previous: CartDiscountsState | null | undefined,
  appliedCode: string | null,
  amountSaved: number,
): CartDiscountsState {
  return {
    availableDiscounts: previous?.availableDiscounts ?? [],
    unavailableDiscounts: previous?.unavailableDiscounts ?? [],
    appliedCode,
    appliedAmountSaved: amountSaved,
    payableAfterDiscount: null,
  };
}

/**
 * Reads applied coupon metadata from a server cart snapshot.
 *
 * @param cart - Authoritative cart from GET /cart/current.
 * @param fallbackCode - Apply-response code when GET omits coupon codes.
 * @param fallbackAmountSaved - Apply-response savings when GET omits discount totals.
 * @returns Applied code and savings for discount cache.
 */
function resolveDiscountMetaFromCart(
  cart: Cart | null,
  fallbackCode?: string | null,
  fallbackAmountSaved?: number,
): { appliedCode: string | null; amountSaved: number } {
  const appliedCode = cart?.appliedCouponCodes?.[0]?.trim() || fallbackCode?.trim() || null;
  if (!appliedCode) {
    return { appliedCode: null, amountSaved: 0 };
  }
  const amountSaved =
    cart && cart.discount > 0
      ? cart.discount
      : Math.max(0, fallbackAmountSaved ?? cart?.discount ?? 0);
  return { appliedCode, amountSaved };
}

/**
 * Cart hook — Zustand optimistic state + TanStack Query full fetch on `/cart/**`.
 *
 * @returns Cart display state, summary, discount state, and mutation actions.
 */
export function useCart(): UseCartReturn {
  const pathname = usePathname();
  const isCartRoute = pathname === '/cart';
  const isCartFamilyRoute = pathname === '/cart' || pathname.startsWith('/cart/');
  const queryClient = useQueryClient();
  const { session, isGuest, isLoading: authLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const cartRef = useRef<Cart | null>(null);
  const mutationChainRef = useRef<Promise<void>>(Promise.resolve());
  const [isDiscountMutating, setIsDiscountMutating] = useState(false);
  const [discountMutationError, setDiscountMutationError] = useState<string | null>(null);

  const zustandCart = useCartStore((s) => s.cart);
  const status = useCartStore((s) => s.status);
  const error = useCartStore((s) => s.error);
  const updatingLineId = useCartStore((s) => s.updatingLineId);
  const removingLineId = useCartStore((s) => s.removingLineId);
  const setCart = useCartStore((s) => s.setCart);
  const setStatus = useCartStore((s) => s.setStatus);
  const setError = useCartStore((s) => s.setError);
  const setUpdatingLineId = useCartStore((s) => s.setUpdatingLineId);
  const setRemovingLineId = useCartStore((s) => s.setRemovingLineId);
  const requiresFreshCartFetch = useCartStore((s) => s.requiresFreshCartFetch);
  const cartMergeInProgress = useCartStore((s) => s.cartMergeInProgress);
  const syncCartCountFromCart = useCartStatsStore((s) => s.syncCartCountFromCart);
  const addCart = useCartStatsStore((s) => s.addCart);

  const enabled = Boolean(session) && isCartFamilyRoute;

  const query = useQuery({
    queryKey: queryKeys.cart.current(),
    queryFn: () => fetchCurrentCart(),
    staleTime: CART_CACHE_MS,
    enabled: enabled && (isCartRoute ? !requiresFreshCartFetch : true),
    refetchInterval: false,
  });

  const isMutating = status === 'loading' || Boolean(updatingLineId) || Boolean(removingLineId);

  const displayCart = pickDisplayCart(
    zustandCart,
    query.data,
    isMutating || status === 'refreshing',
  );

  const isFetching =
    query.isFetching ||
    status === 'refreshing' ||
    cartMergeInProgress ||
    (enabled && requiresFreshCartFetch);

  // Keep mutation fallback in sync; resolveMutableCart prefers store/query first.
  useEffect(() => {
    cartRef.current = !isMutating && isCartRoute && query.data ? query.data : displayCart;
  }, [displayCart, isCartRoute, isMutating, query.data]);

  /** Resolves the live cart for mutations — store/query first, ref as last resort. */
  const resolveMutableCart = useCallback((): Cart | null => {
    return (
      useCartStore.getState().cart ??
      queryClient.getQueryData<Cart>(queryKeys.cart.current()) ??
      cartRef.current
    );
  }, [queryClient]);

  /** Syncs Zustand cart, TanStack Query cache, header badge, and guest localStorage. */
  const syncCart = useCallback(
    (cart: Cart | null, options?: { syncCount?: boolean }) => {
      setCart(cart);
      if (cart) {
        queryClient.setQueryData(queryKeys.cart.current(), cart);
      } else {
        queryClient.setQueryData(queryKeys.cart.current(), null);
      }
      if (options?.syncCount !== false) {
        syncCartCountFromCart(cart);
      }
      if (isGuest) {
        persistGuestCartSnapshot(cart);
      }
    },
    [isGuest, queryClient, setCart, syncCartCountFromCart],
  );

  /** Force GET /cart/current and sync — bypasses repo + query stale cache. */
  const forceFetchAndSync = useCallback(
    async (options?: {
      /** Omit or `null` to refresh without flipping page-level loading UI. */
      loadingStatus?: 'loading' | 'refreshing' | null;
      silent?: boolean;
    }) => {
      const loadingStatus =
        options?.loadingStatus === undefined ? 'refreshing' : options.loadingStatus;
      const silent = options?.silent ?? (loadingStatus === 'refreshing' || loadingStatus === null);
      try {
        if (loadingStatus) {
          setStatus(loadingStatus);
        }
        invalidateCartCache();
        const cart = await fetchCurrentCart({ force: true });
        syncCart(cart);
        // Clear dirty only after successful sync so hydrate cannot overwrite with stale query data.
        useCartStore.getState().clearCartRequiresFreshFetch();
        return cart;
      } catch (err) {
        if (!silent) {
          const message = err instanceof Error ? err.message : cartMessages.errors.refreshCart;
          setError(message);
        }
        // Leave requiresFreshCartFetch set so /cart can retry.
        return cartRef.current;
      } finally {
        if (loadingStatus) {
          setStatus('idle');
        }
      }
    },
    [setError, setStatus, syncCart],
  );

  const refreshAuthoritativeCart = useCallback(
    () => forceFetchAndSync({ loadingStatus: 'refreshing', silent: true }),
    [forceFetchAndSync],
  );

  /** After mutation: refresh immediately on `/cart`, else mark dirty for next visit. */
  const completeMutationSync = useCallback(
    async (cart: Cart) => {
      const prev = useCartStore.getState().cart ?? cartRef.current;
      // Add/update responses can omit price_calculations and briefly report ₹0 — keep prior
      // money fields until the quiet GET below returns authoritative totals.
      const safeCart =
        cart.total <= 0 && prev != null && prev.total > 0
          ? {
              ...cart,
              subtotal: prev.subtotal,
              discount: prev.discount,
              shipping: prev.shipping,
              tax: prev.tax,
              total: prev.total,
            }
          : cart;
      syncCart(safeCart);
      if (isCartRoute) {
        // Mutation payload is already applied — refresh quietly so CTA loaders stay the only spinner.
        await forceFetchAndSync({ loadingStatus: null, silent: true });
      } else {
        useCartStore.getState().markCartRequiresFreshFetch();
      }
    },
    [forceFetchAndSync, isCartRoute, syncCart],
  );

  // Force fresh fetch when visiting `/cart` after mutations. Offers/gift-cards reuse cached cart id.
  useEffect(() => {
    if (!enabled || !requiresFreshCartFetch || !isCartRoute) return;
    void refreshAuthoritativeCart();
  }, [enabled, requiresFreshCartFetch, isCartRoute, refreshAuthoritativeCart]);

  // Hydrate Zustand from query when on cart route and not mid-mutation / forced refresh.
  useEffect(() => {
    if (
      isCartRoute &&
      query.data &&
      !isMutating &&
      !requiresFreshCartFetch &&
      status !== 'refreshing'
    ) {
      syncCart(query.data);
    }
  }, [isCartRoute, query.data, isMutating, requiresFreshCartFetch, status, syncCart]);

  const resolvedCart = isCartRoute && query.data && !isMutating ? query.data : displayCart;
  const cartId = resolvedCart?.id ?? zustandCart?.id ?? query.data?.id ?? null;

  const discountsEnabled = Boolean(session) && isCartFamilyRoute && Boolean(cartId);

  const discountsQuery = useQuery({
    queryKey: queryKeys.cart.discounts(cartId ?? ''),
    queryFn: async (): Promise<CartDiscountsState> => {
      const previous = queryClient.getQueryData<CartDiscountsState>(
        queryKeys.cart.discounts(cartId ?? ''),
      );
      const data = await fetchCartDiscounts(buildDiscountRequestMeta(cartId!));
      return {
        availableDiscounts: data.availableDiscounts,
        unavailableDiscounts: data.unavailableDiscounts,
        appliedCode: previous?.appliedCode ?? null,
        appliedAmountSaved: previous?.appliedAmountSaved ?? 0,
        payableAfterDiscount: previous?.payableAfterDiscount ?? null,
      };
    },
    staleTime: CART_CACHE_MS,
    enabled: discountsEnabled,
    refetchInterval: false,
  });

  // Seed pre-applied coupon from GET cart when discount apply cache is empty.
  useEffect(() => {
    if (!cartId || !resolvedCart?.appliedCouponCodes?.length) {
      return;
    }

    const previous = queryClient.getQueryData<CartDiscountsState>(queryKeys.cart.discounts(cartId));
    if (previous?.appliedCode) {
      return;
    }

    const appliedCode = resolvedCart.appliedCouponCodes[0]?.trim();
    if (!appliedCode) {
      return;
    }

    queryClient.setQueryData(
      queryKeys.cart.discounts(cartId),
      mergeAppliedDiscountState(previous, appliedCode, resolvedCart.discount),
    );
  }, [cartId, queryClient, resolvedCart]);

  const discounts = discountsEnabled ? (discountsQuery.data ?? null) : null;
  const discountsAwaitingCartId =
    isCartFamilyRoute &&
    !cartId &&
    (authLoading ||
      (enabled &&
        (query.isLoading || query.isFetching || (isCartRoute && requiresFreshCartFetch))));
  const discountsLoading =
    discountsAwaitingCartId || (discountsEnabled && discountsQuery.isLoading);
  const discountsListError =
    discountsQuery.error instanceof Error
      ? discountsQuery.error.message
      : discountsQuery.error
        ? cartMessages.errors.fetchDiscounts
        : null;
  const discountsError = discountMutationError ?? discountsListError;

  /** Invalidates discount list after cart contents change; clears applied overlay (totals may change). */
  const invalidateDiscounts = useCallback(() => {
    if (!cartId) return;
    const previous = queryClient.getQueryData<CartDiscountsState>(queryKeys.cart.discounts(cartId));
    if (previous?.appliedCode) {
      queryClient.setQueryData(
        queryKeys.cart.discounts(cartId),
        mergeAppliedDiscountState(previous, null, 0),
      );
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.cart.discounts(cartId) });
  }, [cartId, queryClient]);

  /** Serializes cart mutations so rapid clicks cannot race the API. */
  const runCartMutation = useCallback((task: () => Promise<void>) => {
    const run = mutationChainRef.current.then(task);
    mutationChainRef.current = run.catch(() => {});
    return run;
  }, []);

  /** Refetches authoritative cart on `/cart` after line-item mutations. */
  const reconcileCart = useCallback(async () => {
    if (!isCartRoute) return cartRef.current;
    return refreshAuthoritativeCart();
  }, [isCartRoute, refreshAuthoritativeCart]);

  /** Adds variant after API confirms — no ₹0 optimistic line (cart page keeps current totals). */
  const addItem = useCallback(
    async (
      variantId: string,
      quantity = 1,
      options?: { attributes?: Array<Record<string, unknown>> },
    ) => {
      if (!session) {
        const message = cartMessages.errors.addItem;
        showError(message);
        throw new Error(message);
      }
      return runCartMutation(async () => {
        const prev = resolveMutableCart();
        try {
          setStatus('loading');
          // PLP often has a badge but no cart body — bump count without inventing a ₹0 line.
          if (!prev) {
            addCart(quantity);
          }
          // Cart page needs Shopify-synced cart back; elsewhere keep the fast add path.
          const cart = await addItems(variantId, quantity, {
            ...options,
            waitForShopify: isCartRoute,
          });
          await completeMutationSync(cart);
          invalidateDiscounts();
          showSuccess(cartMessages.toasts.addItem);
        } catch (err) {
          const message = err instanceof Error ? err.message : cartMessages.errors.addItem;
          setError(message);
          showError(message);
          throw err;
        } finally {
          setStatus('idle');
        }
      });
    },
    [
      session,
      runCartMutation,
      resolveMutableCart,
      setError,
      setStatus,
      showError,
      showSuccess,
      addCart,
      completeMutationSync,
      invalidateDiscounts,
      isCartRoute,
    ],
  );

  /** Removes line via API, then refetches authoritative cart. */
  const removeItem = useCallback(
    async (lineId: string) => {
      if (!session) return;
      return runCartMutation(async () => {
        const prev = resolveMutableCart();
        if (!prev) return;
        const cartItem = prev.items.find((item) => item.id === lineId);
        if (!cartItem) {
          setError(cartMessages.errors.itemNotFound);
          await reconcileCart();
          return;
        }
        setRemovingLineId(lineId);
        setStatus('loading');
        try {
          const serverCart = await removeLines([lineId]);
          await completeMutationSync(serverCart);
          invalidateDiscounts();
          showSuccess(cartMessages.toasts.removeItem);
        } catch (err) {
          const message = err instanceof Error ? err.message : cartMessages.errors.removeItem;
          setError(message);
          showError(message);
          await reconcileCart();
        } finally {
          setRemovingLineId(null);
          setStatus('idle');
        }
      });
    },
    [
      session,
      reconcileCart,
      runCartMutation,
      resolveMutableCart,
      setError,
      setRemovingLineId,
      setStatus,
      showError,
      showSuccess,
      completeMutationSync,
      invalidateDiscounts,
    ],
  );

  /** Updates quantity; removes line when quantity reaches zero. */
  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!session) return;
      if (quantity <= 0) {
        await removeItem(lineId);
        return;
      }
      return runCartMutation(async () => {
        const prev = resolveMutableCart();
        if (!prev) return;
        const cartItem = prev.items.find((item) => item.id === lineId);
        if (!cartItem) {
          setError(cartMessages.errors.itemNotFound);
          await reconcileCart();
          return;
        }
        const optimistic = applyOptimisticQuantity(prev, lineId, quantity);
        syncCart(optimistic);
        cartRef.current = optimistic;
        setUpdatingLineId(lineId);
        setStatus('loading');
        try {
          const serverCart = await updateLineQuantity(lineId, quantity);
          await completeMutationSync(serverCart);
          invalidateDiscounts();
        } catch (err) {
          const message = err instanceof Error ? err.message : cartMessages.errors.updateQuantity;
          setError(message);
          showError(message);
          await reconcileCart();
        } finally {
          setUpdatingLineId(null);
          setStatus('idle');
        }
      });
    },
    [
      removeItem,
      session,
      reconcileCart,
      runCartMutation,
      resolveMutableCart,
      setError,
      setStatus,
      setUpdatingLineId,
      showError,
      syncCart,
      completeMutationSync,
      invalidateDiscounts,
    ],
  );

  /** Applies batched clubbed-line mutations in one cart reconcile cycle. */
  const applyClubbedCartMutations = useCallback(
    async (mutations: ClubbedCartMutation[]) => {
      if (!session || mutations.length === 0) {
        return;
      }

      const isRemoveOnly = mutations.every((mutation) => mutation.action === 'remove');

      return runCartMutation(async () => {
        // Remove/wishlist confirm modal already shows a CTA spinner — skip page-level loading.
        if (!isRemoveOnly) {
          setStatus('loading');
        }
        try {
          const serverCart = await applyCartLineMutations(
            mutations.map((mutation) =>
              mutation.action === 'remove'
                ? { type: 'remove', lineId: mutation.lineId }
                : { type: 'update', lineId: mutation.lineId, quantity: mutation.quantity },
            ),
          );
          await completeMutationSync(serverCart);
          invalidateDiscounts();

          if (isRemoveOnly) {
            showSuccess(cartMessages.toasts.removeItem);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : cartMessages.errors.updateQuantity;
          setError(message);
          showError(message);
          await reconcileCart();
        } finally {
          if (!isRemoveOnly) {
            setStatus('idle');
          }
        }
      });
    },
    [
      session,
      runCartMutation,
      setError,
      setStatus,
      showError,
      showSuccess,
      completeMutationSync,
      invalidateDiscounts,
      reconcileCart,
    ],
  );

  /** Clears all cart lines via API and resets header stats. */
  const clearCartAction = useCallback(async () => {
    if (!session) return;
    const prev = resolveMutableCart();
    try {
      setStatus('loading');
      const cart = await clearCartRepo();
      await completeMutationSync(cart);
      invalidateDiscounts();
      showSuccess(cartMessages.toasts.clearCart);
    } catch (err) {
      syncCart(prev);
      const message = err instanceof Error ? err.message : cartMessages.errors.clearCart;
      setError(message);
      showError(message);
    } finally {
      setStatus('idle');
    }
  }, [
    session,
    resolveMutableCart,
    setError,
    setStatus,
    showError,
    showSuccess,
    syncCart,
    completeMutationSync,
    invalidateDiscounts,
  ]);

  const validateStock = useCallback(async () => {
    return validatePreCheckout();
  }, []);

  const prepareCheckout = useCallback(async () => {
    const result = await prepareCheckoutCart();
    syncCart(result.cart);
    useCartStore.getState().clearCartRequiresFreshFetch();
    return result;
  }, [syncCart]);

  /** Force-refreshes cart from API with loading indicator. */
  const refreshCart = useCallback(async () => {
    await forceFetchAndSync({ loadingStatus: 'loading', silent: false });
  }, [forceFetchAndSync]);

  /** Background cart refresh without error surfacing. */
  const refreshCartSilent = useCallback(async () => {
    await forceFetchAndSync({ loadingStatus: 'refreshing', silent: true });
  }, [forceFetchAndSync]);

  /** Force GET /cart/current after coupon apply/remove so totals and line items match backend. */
  const refreshCartFromBackend = useCallback(async (): Promise<Cart | null> => {
    try {
      invalidateCartCache();
      const cart = await fetchCurrentCart({ force: true });
      syncCart(cart);
      return cart;
    } catch {
      // Keep last known cart when GET fails after discount mutation.
      return cartRef.current;
    }
  }, [syncCart]);

  /**
   * Applies a store coupon, then refetches cart for authoritative totals and line items.
   *
   * @param code - Coupon code to apply.
   * @param options.silent - Skip success/error toasts (auto-apply).
   */
  const applyDiscount = useCallback(
    async (code: string, options?: { silent?: boolean }) => {
      if (!session || !cartId || isDiscountMutating) return;
      const trimmed = code.trim();
      if (!trimmed) return;
      setIsDiscountMutating(true);
      setDiscountMutationError(null);
      try {
        const existingCart = resolveMutableCart() ?? displayCart;
        const data = await applyCartDiscount(
          {
            ...buildDiscountRequestMeta(cartId),
            coupon_codes: [trimmed],
          },
          { existingCart },
        );

        const applied = data.appliedDiscounts[0];

        if (!applied) {
          const message =
            resolveManualCouponApplyError(
              resolveCartDiscountApplyFailureMessage(data.applyFailures),
            ) ?? cartMessages.errors.applyDiscount;
          setDiscountMutationError(message);
          throw new Error(message);
        }

        const refetchedCart = await refreshCartFromBackend();
        const { appliedCode, amountSaved } = resolveDiscountMetaFromCart(
          refetchedCart,
          applied.title?.trim() || trimmed,
          applied.discount_amount,
        );
        const previous = queryClient.getQueryData<CartDiscountsState>(
          queryKeys.cart.discounts(cartId),
        );
        queryClient.setQueryData(
          queryKeys.cart.discounts(cartId),
          mergeAppliedDiscountState(previous, appliedCode, amountSaved),
        );
        try {
          const list = await fetchCartDiscounts(buildDiscountRequestMeta(cartId));
          queryClient.setQueryData(queryKeys.cart.discounts(cartId), {
            availableDiscounts: list.availableDiscounts,
            unavailableDiscounts: list.unavailableDiscounts,
            appliedCode,
            appliedAmountSaved: amountSaved,
            payableAfterDiscount: null,
          });
        } catch {
          // Keep applied state even if list refresh fails.
        }
        if (!options?.silent) {
          showSuccess(cartMessages.toasts.couponApplied);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : cartMessages.errors.applyDiscount;
        setDiscountMutationError(message);
        if (!options?.silent) {
          showError(message);
        }
        throw err;
      } finally {
        setIsDiscountMutating(false);
      }
    },
    [
      session,
      cartId,
      isDiscountMutating,
      displayCart,
      resolveMutableCart,
      queryClient,
      showError,
      showSuccess,
      refreshCartFromBackend,
    ],
  );

  /** Removes applied coupon, then refetches cart for authoritative totals and line items. */
  const removeDiscount = useCallback(async () => {
    if (!session || !cartId || isDiscountMutating) return;
    const codeToRemove = resolveAppliedCouponCode(discounts, resolvedCart);
    if (!codeToRemove) return;
    setIsDiscountMutating(true);
    setDiscountMutationError(null);
    try {
      const existingCart = resolveMutableCart() ?? displayCart;
      await applyCartDiscount(
        {
          ...buildDiscountRequestMeta(cartId),
          remove_coupon_codes: [codeToRemove],
        },
        { existingCart },
      );

      const refetchedCart = await refreshCartFromBackend();
      const { appliedCode, amountSaved } = resolveDiscountMetaFromCart(refetchedCart);
      const previous = queryClient.getQueryData<CartDiscountsState>(
        queryKeys.cart.discounts(cartId),
      );
      queryClient.setQueryData(
        queryKeys.cart.discounts(cartId),
        mergeAppliedDiscountState(previous, appliedCode, amountSaved),
      );
      try {
        const list = await fetchCartDiscounts(buildDiscountRequestMeta(cartId));
        queryClient.setQueryData(queryKeys.cart.discounts(cartId), {
          availableDiscounts: list.availableDiscounts,
          unavailableDiscounts: list.unavailableDiscounts,
          appliedCode,
          appliedAmountSaved: amountSaved,
          payableAfterDiscount: null,
        });
      } catch {
        // Keep cleared applied state even if list refresh fails.
      }
      showSuccess(cartMessages.toasts.couponRemoved);
    } catch (err) {
      const message = err instanceof Error ? err.message : cartMessages.errors.removeDiscount;
      setDiscountMutationError(message);
      showError(message);
      throw err;
    } finally {
      setIsDiscountMutating(false);
    }
  }, [
    session,
    cartId,
    isDiscountMutating,
    discounts,
    resolvedCart,
    displayCart,
    resolveMutableCart,
    queryClient,
    showError,
    showSuccess,
    refreshCartFromBackend,
  ]);

  const summary = useMemo(() => {
    const cart = isCartRoute && query.data && !isMutating ? query.data : displayCart;
    return cartToSummary(cart);
  }, [displayCart, isCartRoute, isMutating, query.data]);

  const isEmpty = !resolvedCart || resolvedCart.items.length === 0;
  // Keep empty UI once we have an empty cart snapshot; only block while still waiting on first fetch.
  const showEmpty =
    isEmpty && !isMutating && !(enabled && query.isLoading) && !(isFetching && !resolvedCart);

  return {
    cart: resolvedCart,
    loading:
      status === 'loading' || cartMergeInProgress || (enabled && query.isLoading && !displayCart),
    isFetching,
    isMutating,
    error,
    actions: {
      addItem,
      removeItem,
      updateQuantity,
      applyClubbedCartMutations,
      clearCart: clearCartAction,
      validateStock,
      prepareCheckout,
      refreshCart,
      refreshCartSilent,
      applyDiscount,
      removeDiscount,
    },
    summary,
    isEmpty,
    showEmpty,
    checkoutUrl: resolvedCart?.checkoutUrl ?? null,
    updatingLineId,
    removingLineId,
    cartMergeInProgress,
    discounts,
    discountsLoading,
    discountsError,
    isDiscountMutating,
  };
}
