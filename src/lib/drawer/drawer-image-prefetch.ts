import type {
  DrawerHomeType,
  DrawerLayoutType,
  DrawerMenuCategory,
  DrawerMenuForHomeType,
  DrawerPriceRange,
  DrawerTab,
} from '@/types/drawer-menu';

/**
 * Return how many tiles count as first viewport for a drawer layout.
 *
 * @param layoutType - Active category layout
 * @returns Priority / prefetch tile count for that layout
 */
export function getDrawerViewportImageCount(layoutType: DrawerLayoutType): number {
  switch (layoutType) {
    case 'grid-3':
      return 6;
    case 'grid-2-banner':
      return 4;
    case 'banner-list':
      return 3;
    case 'price-range':
      return 4;
    default: {
      const _exhaustive: never = layoutType;
      return _exhaustive;
    }
  }
}

/**
 * Collect first-viewport image URLs for a drawer category.
 *
 * @param category - Menu category (or null)
 * @param priceRanges - Gold price-range images when layout is `price-range`
 * @returns Trimmed non-empty URLs, capped to the layout viewport count
 */
export function collectDrawerCategoryImageUrls(
  category: DrawerMenuCategory | null | undefined,
  priceRanges: DrawerPriceRange[] = [],
): string[] {
  if (!category) {
    return [];
  }

  const limit = getDrawerViewportImageCount(category.layoutType);

  if (category.layoutType === 'price-range') {
    return priceRanges
      .map((range) => range.imageUrl?.trim() ?? '')
      .filter(Boolean)
      .slice(0, limit);
  }

  return category.items
    .map((item) => item.imageUrl.trim())
    .filter(Boolean)
    .slice(0, limit);
}

/**
 * Warm the browser HTTP cache for drawer CDN URLs.
 * Uses the raw CDN `src` (matches `DrawerImage` `unoptimized`) so visit hits cache.
 *
 * @param srcs - Raw CDN src values from menu config
 * @param signal - Optional abort; skips assigning further `src` when aborted
 */
export function prefetchDrawerImageUrls(srcs: string[], signal?: AbortSignal): void {
  if (typeof window === 'undefined' || srcs.length === 0) {
    return;
  }

  const seen = new Set<string>();

  for (const src of srcs) {
    if (signal?.aborted) {
      return;
    }

    const trimmed = src.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);

    const image = new window.Image();
    image.decoding = 'async';
    // Low priority so active-tab next/image tiles keep the Fast 4G pipe first.
    image.fetchPriority = 'low';
    image.src = trimmed;
  }
}

export interface PrefetchAdjacentDrawerImagesArgs {
  activeTab: DrawerHomeType;
  activeCategoryId: string | null;
  menusByHomeType: Record<DrawerHomeType, DrawerMenuForHomeType>;
  tabs: DrawerTab[];
  priceRanges?: DrawerPriceRange[];
  /** How many upcoming sidebar categories to warm (default 2). */
  sidebarLookahead?: number;
  signal?: AbortSignal;
}

/**
 * Resolve visible (non-hidden) categories for a home tab.
 *
 * @param menusByHomeType - Drawer menu map
 * @param tab - Active or candidate home tab
 * @returns Sidebar-visible categories
 */
function visibleCategoriesForTab(
  menusByHomeType: Record<DrawerHomeType, DrawerMenuForHomeType>,
  tab: DrawerHomeType,
): DrawerMenuCategory[] {
  return menusByHomeType[tab].categories.filter((category) => !category.hiddenInSidebar);
}

/**
 * Build raw CDN URLs to warm for the next sidebar categories + next home pill.
 *
 * @param args - Active drawer location + menu data
 * @returns Deduped first-viewport URLs
 */
export function collectAdjacentDrawerImageUrls({
  activeTab,
  activeCategoryId,
  menusByHomeType,
  tabs,
  priceRanges = [],
  sidebarLookahead = 2,
}: Omit<PrefetchAdjacentDrawerImagesArgs, 'signal'>): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (nextUrls: string[]) => {
    for (const url of nextUrls) {
      if (seen.has(url)) {
        continue;
      }
      seen.add(url);
      urls.push(url);
    }
  };

  const categories = visibleCategoriesForTab(menusByHomeType, activeTab);
  const activeIndex = categories.findIndex((category) => category.id === activeCategoryId);
  const startIndex = activeIndex >= 0 ? activeIndex + 1 : 0;

  for (let offset = 0; offset < sidebarLookahead; offset += 1) {
    const nextSidebarCategory = categories[startIndex + offset] ?? null;
    pushUnique(collectDrawerCategoryImageUrls(nextSidebarCategory, priceRanges));
  }

  const tabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const nextHomeTab = tabIndex >= 0 ? tabs[tabIndex + 1] : undefined;

  if (nextHomeTab) {
    const nextHomeCategories = visibleCategoriesForTab(menusByHomeType, nextHomeTab.id);
    const defaultCategory =
      nextHomeCategories.find((category) => category.id === 'category') ??
      nextHomeCategories[0] ??
      null;
    pushUnique(collectDrawerCategoryImageUrls(defaultCategory, priceRanges));
  }

  return urls;
}

/**
 * Prefetch first-viewport images for upcoming sidebar categories and next home pill.
 *
 * @param args - Active drawer location + menu data
 */
export function prefetchAdjacentDrawerImages({
  signal,
  ...args
}: PrefetchAdjacentDrawerImagesArgs): void {
  if (signal?.aborted) {
    return;
  }

  prefetchDrawerImageUrls(collectAdjacentDrawerImageUrls(args), signal);
}
