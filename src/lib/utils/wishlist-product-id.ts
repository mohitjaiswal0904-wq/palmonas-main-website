/**
 * Normalises Shopify product ids (numeric or GID) for wishlist comparisons.
 *
 * @param id - Product id from API or product card.
 * @returns Comparable product id string.
 */
export function normalizeWishlistProductId(id: string): string {
  const trimmed = id.trim();
  const gidMatch = trimmed.match(/Product\/(\d+)/i);
  if (gidMatch?.[1]) {
    return gidMatch[1];
  }

  return trimmed;
}
