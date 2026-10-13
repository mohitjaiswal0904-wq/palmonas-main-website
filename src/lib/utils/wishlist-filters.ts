import { isRenderableWishlistItem } from '@/lib/wishlist/wishlist-cache';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistCategoryFilter, WishlistItem } from '@/types/wishlist';

/** Category sections rendered in vertical scroll order (excludes `all`). */
export const WISHLIST_CATEGORY_SECTIONS = ['demifine', 'gold', 'silver'] as const;

export type WishlistCategorySection = (typeof WISHLIST_CATEGORY_SECTIONS)[number];

export interface GroupedWishlistItems {
  demifine: WishlistItem[];
  gold: WishlistItem[];
  silver: WishlistItem[];
  other: WishlistItem[];
}

type WishlistItemCategory = WishlistCategoryFilter | 'other';

/**
 * Fine-gold purity in a product title, e.g. "Sleek Bar 9KT Gold ... Pendant".
 * Allows "9 KT"; `\b` keeps it off values like "19KTX".
 */
const GOLD_PURITY_TITLE_PATTERN = /\b9\s*kt\b/i;

/**
 * Resolves the jewellery category tab for a wishlist item.
 *
 * Silver/gold are checked on the display category label first so wishlist chips
 * follow product category copy even when `productCategory` defaults to demifine.
 *
 * The title is the last gold signal: wishlist payloads sometimes omit
 * `product_category`, and `normalizeProductCategory` turns that gap into demifine,
 * which parked 9KT fine-gold products under the Demifine tab.
 */
export function getWishlistItemCategory(item: WishlistItem): WishlistItemCategory {
  const categoryLabel = item.product.category.toLowerCase();

  if (categoryLabel.includes('silver')) {
    return 'silver';
  }

  if (
    categoryLabel.includes('gold') ||
    item.product.productCategory === PRODUCT_CATEGORY.GOLD ||
    GOLD_PURITY_TITLE_PATTERN.test(item.product.name)
  ) {
    return 'gold';
  }

  if (item.product.productCategory === PRODUCT_CATEGORY.DEMIFINE) {
    return 'demifine';
  }

  return 'other';
}

/**
 * Groups wishlist items into vertical category sections for scroll-linked tabs.
 */
export function groupWishlistItemsByCategory(items: WishlistItem[]): GroupedWishlistItems {
  const groups: GroupedWishlistItems = {
    demifine: [],
    gold: [],
    silver: [],
    other: [],
  };

  for (const item of items.filter(isRenderableWishlistItem)) {
    const category = getWishlistItemCategory(item);

    if (category === 'demifine' || category === 'gold' || category === 'silver') {
      groups[category].push(item);
      continue;
    }

    groups.other.push(item);
  }

  return groups;
}

/**
 * Returns category sections that contain at least one item.
 */
export function getVisibleWishlistCategorySections(
  groups: GroupedWishlistItems,
): WishlistCategorySection[] {
  return WISHLIST_CATEGORY_SECTIONS.filter((section) => groups[section].length > 0);
}

/**
 * Filters renderable wishlist items by the active category tab.
 */
export function filterWishlistItems(
  items: WishlistItem[],
  filter: WishlistCategoryFilter,
): WishlistItem[] {
  const renderableItems = items.filter(isRenderableWishlistItem);

  if (filter === 'all') {
    return renderableItems;
  }

  return renderableItems.filter((item) => getWishlistItemCategory(item) === filter);
}

/**
 * Formats the wishlist item count for the page subtitle.
 */
export function formatWishlistItemCount(count: number): string {
  if (count === 1) {
    return '1 item saved';
  }

  return `${count} items saved`;
}
