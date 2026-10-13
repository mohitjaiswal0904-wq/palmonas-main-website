'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { syncWishlistProductIdsFromItems } from '@/lib/wishlist/wishlist-cache';
import { getWishlist } from '@/services/wishlist.service';
import type { AuthContextValue } from '@/types/auth/auth.types';

export const WISHLIST_STALE_TIME_MS = 1000 * 60;

/**
 * Fetches the authenticated wishlist and syncs heart-state product ids.
 */
export function useWishlistListQuery(
  isAuthenticated: boolean,
  guardApi: AuthContextValue['guardApi'],
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: async () => {
      const items = await guardApi(() => getWishlist(), { apiId: 'wishlist.list' });
      syncWishlistProductIdsFromItems(queryClient, items);
      return items;
    },
    enabled: isAuthenticated,
    staleTime: WISHLIST_STALE_TIME_MS,
    retry: shouldRetryQuery,
  });
}

/**
 * Subscribes to the lightweight wishlist heart-state cache.
 */
export function useWishlistProductIds(isAuthenticated: boolean) {
  return useQuery({
    queryKey: queryKeys.wishlist.productIds(),
    queryFn: (): string[] => [],
    enabled: isAuthenticated,
    staleTime: Number.POSITIVE_INFINITY,
    initialData: [],
  });
}
