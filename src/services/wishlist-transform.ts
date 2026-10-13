import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import { transformProduct } from '@/services/product-transform';
import type { ProductApiResponse } from '@/types/product';
import type { WishlistApiResponse, WishlistItem, WishlistItemApi } from '@/types/wishlist';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unwrapWishlistItems(raw: WishlistApiResponse): WishlistItemApi[] {
  if (Array.isArray(raw.items)) {
    return raw.items;
  }

  if (Array.isArray(raw.products)) {
    return raw.products;
  }

  if (isRecord(raw.data)) {
    if (Array.isArray(raw.data.items)) {
      return raw.data.items;
    }

    if (Array.isArray(raw.data.products)) {
      return raw.data.products;
    }
  }

  return [];
}

function toProductApiResponse(item: WishlistItemApi): ProductApiResponse {
  if (isRecord(item.product)) {
    return item.product as ProductApiResponse;
  }

  return item as ProductApiResponse;
}

function resolveWishlistIds(
  item: WishlistItemApi,
  product: ReturnType<typeof transformProduct>,
): {
  productId: string;
  variantId: string;
} {
  const productId = normalizeWishlistProductId(String(item.product_id ?? item.id ?? product.id));

  if (item.variant_id != null && String(item.variant_id).trim().length > 0) {
    return { productId, variantId: String(item.variant_id) };
  }

  const firstVariantId = product.variants[0]?.id;
  if (firstVariantId) {
    return { productId, variantId: firstVariantId };
  }

  return { productId, variantId: '' };
}

/**
 * Maps wishlist API payload into domain wishlist items.
 *
 * @param raw - Wishlist list API response envelope.
 * @returns Normalised wishlist items with product cards.
 */
export function transformWishlistResponse(raw: WishlistApiResponse): WishlistItem[] {
  return unwrapWishlistItems(raw).map((item) => {
    const product = transformProduct(toProductApiResponse(item));
    const { productId, variantId } = resolveWishlistIds(item, product);

    return {
      productId,
      variantId,
      product,
    };
  });
}
