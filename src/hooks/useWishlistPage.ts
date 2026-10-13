'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import {
  useWishlistListQuery,
  WISHLIST_STALE_TIME_MS,
} from '@/hooks/wishlist/useWishlistListQuery';
import { useRemoveWishlistItemMutation } from '@/hooks/wishlist/useWishlistMutations';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import {
  filterWishlistItems,
  getVisibleWishlistCategorySections,
  groupWishlistItemsByCategory,
} from '@/lib/utils/wishlist-filters';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import { clearWishlistCaches, isRenderableWishlistItem } from '@/lib/wishlist/wishlist-cache';
import { clearWishlist, enrichWishlistCatalogFields } from '@/services/wishlist.service';
import { useCartStatsStore } from '@/store/cart/cart-stats.store';
import type { WishlistCategoryFilter, WishlistItem } from '@/types/wishlist';

/** Always-visible wishlist category pills. */
const WISHLIST_CATEGORY_PILLS: WishlistCategoryFilter[] = ['demifine', 'gold', 'all'];

/**
 * Provides wishlist page data, category pill state, and item mutations.
 *
 * Demifine, Gold, and All pills stay visible. The active pill defaults to the
 * first category that has products so categories stay separated until `all`.
 */
export function useWishlistPage(): {
  items: WishlistItem[];
  filteredItems: WishlistItem[];
  itemCount: number;
  activeFilter: WishlistCategoryFilter;
  availableFilters: WishlistCategoryFilter[];
  setActiveFilter: (filter: WishlistCategoryFilter) => void;
  isLoading: boolean;
  isClearing: boolean;
  removingProductId: string | null;
  error: AppError | null;
  isAuthenticated: boolean;
  openLogin: () => void;
  clearAll: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refetch: () => void;
} {
  const queryClient = useQueryClient();
  const { isAuthenticated, openLogin, guardApi } = useRequireAuth();
  const [selectedFilter, setSelectedFilter] = useState<WishlistCategoryFilter | null>(null);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const wishlistQuery = useWishlistListQuery(isAuthenticated, guardApi);
  const catalogFieldsQueryKey = useMemo(
    () =>
      [
        ...queryKeys.wishlist.list(),
        'catalog-fields',
        ...(wishlistQuery.data ?? []).map((item) => item.productId),
      ] as const,
    [wishlistQuery.data],
  );
  const catalogFieldsQuery = useQuery({
    queryKey: catalogFieldsQueryKey,
    queryFn: () => enrichWishlistCatalogFields(wishlistQuery.data ?? []),
    enabled: isAuthenticated && (wishlistQuery.data?.length ?? 0) > 0,
    staleTime: WISHLIST_STALE_TIME_MS,
    retry: shouldRetryQuery,
  });
  const removeMutation = useRemoveWishlistItemMutation();

  const clearMutation = useMutation({
    mutationFn: () => guardApi(() => clearWishlist(), { apiId: 'wishlist.clear' }),
    onSuccess: () => {
      clearWishlistCaches(queryClient);
      // Header badge reads the stats store, not the wishlist query cache.
      useCartStatsStore.getState().resetWishlistBadge();
      void queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
    },
  });

  const items = useMemo(
    () => (catalogFieldsQuery.data ?? wishlistQuery.data ?? []).filter(isRenderableWishlistItem),
    [catalogFieldsQuery.data, wishlistQuery.data],
  );

  const availableFilters = WISHLIST_CATEGORY_PILLS;

  const defaultFilter = useMemo<WishlistCategoryFilter>(() => {
    const sectionsWithItems = getVisibleWishlistCategorySections(
      groupWishlistItemsByCategory(items),
    );
    const pillSection = sectionsWithItems.find(
      (section): section is 'demifine' | 'gold' => section === 'demifine' || section === 'gold',
    );
    return pillSection ?? 'demifine';
  }, [items]);

  const activeFilter =
    selectedFilter && WISHLIST_CATEGORY_PILLS.includes(selectedFilter)
      ? selectedFilter
      : defaultFilter;

  const filteredItems = useMemo(
    () => filterWishlistItems(items, activeFilter),
    [activeFilter, items],
  );

  const clearAll = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const removeItem = useCallback(
    async (productId: string) => {
      setRemovingProductId(normalizeWishlistProductId(productId));
      try {
        await guardApi(() => removeMutation.mutateAsync(productId), {
          apiId: 'wishlist.remove',
        });
      } finally {
        setRemovingProductId(null);
      }
    },
    [guardApi, removeMutation],
  );

  return {
    items,
    filteredItems,
    itemCount: items.length,
    activeFilter,
    availableFilters,
    setActiveFilter: setSelectedFilter,
    isLoading: wishlistQuery.isLoading || catalogFieldsQuery.isLoading,
    isClearing: clearMutation.isPending,
    removingProductId,
    error: isAppError(wishlistQuery.error) ? wishlistQuery.error : null,
    isAuthenticated,
    openLogin,
    clearAll,
    removeItem,
    refetch: () => {
      void wishlistQuery.refetch();
    },
  };
}
