import rawConfig from '@/config/wishlist/wishlist.config.json';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { WishlistCategoryFilter } from '@/types/wishlist';

type WishlistConfigJson = typeof rawConfig;

export const wishlistConfig = rawConfig as WishlistConfigJson;

/** Localization-ready user-facing copy for the wishlist feature. */
export const wishlistMessages = wishlistConfig.messages;

type ExploreLabelKey = keyof typeof wishlistMessages.labels;

export interface WishlistCategoryExploreCta {
  href: string;
  label: string;
  ariaLabel: string;
}

/**
 * Returns the explore-collection CTA for an empty wishlist category pill.
 *
 * @param filter - Active wishlist category pill.
 * @returns CTA href/label when configured for the filter, otherwise `null`.
 */
export function getWishlistCategoryExploreCta(
  filter: WishlistCategoryFilter,
): WishlistCategoryExploreCta | null {
  const explore =
    wishlistConfig.categoryExplore[filter as keyof typeof wishlistConfig.categoryExplore];
  if (!explore) {
    return null;
  }

  const labelKey = explore.labelKey as ExploreLabelKey;

  return {
    href: resolveCollectionPagePath(explore.collectionHandle),
    label: wishlistMessages.labels[labelKey],
    ariaLabel: wishlistMessages.a11y[labelKey],
  };
}
