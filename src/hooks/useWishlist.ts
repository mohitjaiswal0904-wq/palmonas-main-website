'use client';

import { useCallback, useMemo, useState } from 'react';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useWishlistListQuery, useWishlistProductIds } from '@/hooks/wishlist/useWishlistListQuery';
import {
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} from '@/hooks/wishlist/useWishlistMutations';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';

/**
 * Wishlist query and mutations for product cards and PDP heart controls.
 */
export function useWishlist(): {
  itemCount: number;
  hasWishlistItem: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isTogglingProduct: (productId: string) => boolean;
  isLoading: boolean;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);

  const wishlistQuery = useWishlistListQuery(isAuthenticated, guardApi);
  const { data: wishlistProductIds = [] } = useWishlistProductIds(isAuthenticated);
  const addMutation = useAddWishlistItemMutation();
  const removeMutation = useRemoveWishlistItemMutation();

  const wishlistProductIdSet = useMemo(
    () => new Set(wishlistProductIds.map((id) => normalizeWishlistProductId(id))),
    [wishlistProductIds],
  );

  const hasWishlistItem = useCallback(
    (productId: string) => wishlistProductIdSet.has(normalizeWishlistProductId(productId)),
    [wishlistProductIdSet],
  );

  const isTogglingProduct = useCallback(
    (productId: string) => togglingProductId === normalizeWishlistProductId(productId),
    [togglingProductId],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const normalizedProductId = normalizeWishlistProductId(productId);
      setTogglingProductId(normalizedProductId);

      try {
        if (hasWishlistItem(productId)) {
          await guardApi(() => removeMutation.mutateAsync(productId), {
            apiId: 'wishlist.remove',
          });
          return;
        }

        await guardApi(() => addMutation.mutateAsync(productId), {
          apiId: 'wishlist.add',
        });
      } finally {
        setTogglingProductId(null);
      }
    },
    [addMutation, guardApi, hasWishlistItem, removeMutation],
  );

  return {
    itemCount: wishlistProductIdSet.size,
    hasWishlistItem,
    toggleWishlist,
    isTogglingProduct,
    isLoading: wishlistQuery.isLoading,
  };
}
