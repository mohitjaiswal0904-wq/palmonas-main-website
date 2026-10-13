/** Client-only — calls external wishlist API via @/lib/api. Used by wishlist hooks. */
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { withRelatedProductRatings } from '@/lib/product/related-product-ratings';
import { getProduct } from '@/services/product.service';
import { transformWishlistResponse } from '@/services/wishlist-transform';
import type { WishlistApiResponse, WishlistItem } from '@/types/wishlist';

/**
 * Backfills missing rating/offer fields on wishlist products via product-by-id.
 *
 * Wishlist payloads often omit offers, so card promo stays empty until
 * `/api/v2/product/id/{id}` fills them. Call from the wishlist page only.
 *
 * @param items - Wishlist items after API transform.
 * @returns Items with enriched product offers/ratings where a catalog match exists.
 */
export async function enrichWishlistCatalogFields(items: WishlistItem[]): Promise<WishlistItem[]> {
  const products = await withRelatedProductRatings(
    items.map((item) => ({ ...item.product, id: item.productId })),
    getProduct,
  );

  return items.map((item, index) => {
    const product = products[index];
    return product ? { ...item, product } : item;
  });
}

/**
 * Fetches the authenticated user's wishlist.
 *
 * @returns Wishlist items with product details (no per-item catalog search).
 * @throws Normalised app error when the API request fails.
 */
export async function getWishlist(): Promise<WishlistItem[]> {
  try {
    const { data } = await api.get<WishlistApiResponse>(ENDPOINTS.wishlist.list);
    return transformWishlistResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Adds a product to the user's wishlist.
 *
 * @param productId - Shopify product id.
 * @throws Normalised app error when the API request fails.
 */
export async function addToWishlist(productId: string): Promise<void> {
  try {
    await api.post(ENDPOINTS.wishlist.add, { productId });
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Clears all items from the user's wishlist.
 *
 * @throws Normalised app error when the API request fails.
 */
export async function clearWishlist(): Promise<void> {
  try {
    await api.delete(ENDPOINTS.wishlist.clear);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Removes a product from the wishlist.
 *
 * @param productId - Shopify product id.
 * @throws Normalised app error when the API request fails.
 */
export async function removeWishlistItem(productId: string): Promise<void> {
  try {
    await api.delete(ENDPOINTS.wishlist.removeProduct(productId));
  } catch (err) {
    throw normaliseError(err);
  }
}
