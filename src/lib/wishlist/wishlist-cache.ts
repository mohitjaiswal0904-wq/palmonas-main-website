import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import type { WishlistItem } from '@/types/wishlist';

/**
 * Wishlist rows that have enough product data to render a card.
 *
 * @param item - Wishlist line from API or cache.
 * @returns True when the item can be shown on /wishlist.
 */
export function isRenderableWishlistItem(item: WishlistItem): boolean {
  return item.product.handle.trim().length > 0 && item.product.name.trim().length > 0;
}

/**
 * Reads normalised wishlist product ids from the lightweight heart-state cache.
 */
export function readWishlistProductIds(queryClient: QueryClient): string[] {
  return queryClient.getQueryData<string[]>(queryKeys.wishlist.productIds()) ?? [];
}

/**
 * Writes normalised wishlist product ids to the heart-state cache.
 */
export function writeWishlistProductIds(queryClient: QueryClient, productIds: string[]): void {
  queryClient.setQueryData(queryKeys.wishlist.productIds(), productIds);
}

/**
 * Syncs heart-state ids from a full wishlist list response.
 */
export function syncWishlistProductIdsFromItems(
  queryClient: QueryClient,
  items: WishlistItem[],
): void {
  writeWishlistProductIds(
    queryClient,
    items.map((item) => normalizeWishlistProductId(item.productId)),
  );
}

/**
 * Optimistically adds a product id to the heart-state cache.
 *
 * @returns Previous ids for rollback.
 */
export function optimisticallyAddWishlistProductId(
  queryClient: QueryClient,
  productId: string,
): string[] {
  const previousIds = readWishlistProductIds(queryClient);
  const normalizedProductId = normalizeWishlistProductId(productId);

  if (!previousIds.includes(normalizedProductId)) {
    writeWishlistProductIds(queryClient, [...previousIds, normalizedProductId]);
  }

  return previousIds;
}

/**
 * Optimistically removes a product id from heart-state and list caches.
 *
 * @returns Previous cache snapshots for rollback.
 */
export function optimisticallyRemoveWishlistItem(
  queryClient: QueryClient,
  productId: string,
): { previousIds: string[]; previousList: WishlistItem[] | undefined } {
  const normalizedProductId = normalizeWishlistProductId(productId);
  const previousIds = readWishlistProductIds(queryClient);
  const previousList = queryClient.getQueryData<WishlistItem[]>(queryKeys.wishlist.list());

  writeWishlistProductIds(
    queryClient,
    previousIds.filter((id) => id !== normalizedProductId),
  );
  queryClient.setQueryData<WishlistItem[]>(queryKeys.wishlist.list(), (current = []) =>
    current.filter((item) => normalizeWishlistProductId(item.productId) !== normalizedProductId),
  );

  return { previousIds, previousList };
}

/**
 * Clears wishlist list and heart-state caches.
 */
export function clearWishlistCaches(queryClient: QueryClient): void {
  writeWishlistProductIds(queryClient, []);
  queryClient.setQueryData<WishlistItem[]>(queryKeys.wishlist.list(), []);
}
