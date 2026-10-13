'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import {
  optimisticallyAddWishlistProductId,
  optimisticallyRemoveWishlistItem,
  writeWishlistProductIds,
} from '@/lib/wishlist/wishlist-cache';
import { addToWishlist, removeWishlistItem } from '@/services/wishlist.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import type { WishlistItem } from '@/types/wishlist';

interface RemoveWishlistRollbackContext {
  previousIds: string[];
  previousList: WishlistItem[] | undefined;
}

/**
 * Add-to-wishlist mutation with heart-state optimistic update and list refetch.
 * Callers must auth-gate with `guardApi` before `mutateAsync` so login cancel
 * never leaves optimistic UI or a stuck pending mutation.
 */
export function useAddWishlistItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => addToWishlist(normalizeWishlistProductId(productId)),
    onMutate: (productId) => {
      useCartStatsStore.getState().addWishlist();
      const previousIds = optimisticallyAddWishlistProductId(queryClient, productId);
      return { previousIds };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.list() });
    },
    onError: (_error, _productId, context) => {
      useCartStatsStore.getState().minusWishlist();
      if (context) {
        writeWishlistProductIds(queryClient, context.previousIds);
      }
    },
  });
}

/**
 * Remove-from-wishlist mutation shared by product cards and wishlist page.
 * Callers must auth-gate with `guardApi` before `mutateAsync` when required.
 */
export function useRemoveWishlistItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeWishlistItem(normalizeWishlistProductId(productId)),
    onMutate: (productId) => {
      useCartStatsStore.getState().minusWishlist();
      return optimisticallyRemoveWishlistItem(queryClient, productId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.wishlist.list(),
        refetchType: 'none',
      });
    },
    onError: (_error, _productId, context?: RemoveWishlistRollbackContext) => {
      useCartStatsStore.getState().addWishlist();
      if (!context) {
        return;
      }

      writeWishlistProductIds(queryClient, context.previousIds);
      queryClient.setQueryData(queryKeys.wishlist.list(), context.previousList);
    },
  });
}
