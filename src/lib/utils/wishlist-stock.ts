import { isProductPurchasable } from '@/lib/utils/variant-options';
import { getWishlistItemCategory } from '@/lib/utils/wishlist-filters';
import { extractNumericId } from '@/types/cart';
import type { WishlistItem } from '@/types/wishlist';

/**
 * Returns whether the wishlist line's variant (or any fallback variant) can be sold.
 * Gold-section items (same signals as {@link getWishlistItemCategory}) always stay purchasable.
 *
 * @param item - Wishlist item with product variants.
 * @returns False when the matched variant is not purchasable.
 */
export function isWishlistItemInStock(item: WishlistItem): boolean {
  // Match Gold tab classification so 9KT / gold-labelled lines skip stock even when
  // API omitted product_category and normalized to demifine.
  if (getWishlistItemCategory(item) === 'gold') {
    return true;
  }

  const { product, variantId } = item;

  if (product.variants.length === 0) {
    return isProductPurchasable(product, undefined);
  }

  const numericVariantId = variantId ? extractNumericId(variantId) : null;
  const matchedVariant = product.variants.find((variant) => {
    if (variant.id === variantId) {
      return true;
    }

    return numericVariantId != null && extractNumericId(variant.id) === numericVariantId;
  });

  if (matchedVariant) {
    return isProductPurchasable(product, matchedVariant);
  }

  return product.variants.some((variant) => isProductPurchasable(product, variant));
}
