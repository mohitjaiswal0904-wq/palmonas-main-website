import { extractNumericId } from '@/types/cart';

/** Minimal cart line shape needed for gift-wrap matching. */
export interface GiftWrapCartLine {
  id: string;
  quantity: number;
  product: { variantId: string };
}

/**
 * Returns whether a cart line is the gift-wrap SKU.
 *
 * @param item - Cart line with product.variantId.
 * @param giftWrapVariantId - Configured gift-wrap variant id (numeric or GID).
 * @returns True when variant ids match numerically.
 */
export function isGiftWrapLine(item: GiftWrapCartLine, giftWrapVariantId: string): boolean {
  if (!giftWrapVariantId) return false;
  return extractNumericId(item.product.variantId) === extractNumericId(giftWrapVariantId);
}

/**
 * Sums cart line quantities excluding the gift-wrap SKU (PW-609).
 *
 * @param items - Cart lines.
 * @param giftWrapVariantId - Configured gift-wrap variant id.
 * @returns Total units that should be gift-wrapped.
 */
export function sumCartQuantityExcludingGiftWrap(
  items: GiftWrapCartLine[],
  giftWrapVariantId: string,
): number {
  return items.reduce((sum, item) => {
    if (isGiftWrapLine(item, giftWrapVariantId)) return sum;
    return sum + item.quantity;
  }, 0);
}

/**
 * Finds the gift-wrap cart line id when present.
 *
 * @param items - Cart lines.
 * @param giftWrapVariantId - Configured gift-wrap variant id.
 * @returns Line id or null.
 */
export function findGiftWrapLineId(
  items: GiftWrapCartLine[],
  giftWrapVariantId: string,
): string | null {
  const line = items.find((item) => isGiftWrapLine(item, giftWrapVariantId));
  return line?.id ?? null;
}

/**
 * Finds gift-wrap line quantity when present.
 *
 * @param items - Cart lines.
 * @param giftWrapVariantId - Configured gift-wrap variant id.
 * @returns Current wrap quantity or 0.
 */
export function findGiftWrapQuantity(items: GiftWrapCartLine[], giftWrapVariantId: string): number {
  const line = items.find((item) => isGiftWrapLine(item, giftWrapVariantId));
  return line?.quantity ?? 0;
}
