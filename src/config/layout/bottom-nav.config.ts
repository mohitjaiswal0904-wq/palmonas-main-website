import type { HomePageCategoryId } from '@/config/home-page-categories.config';
import rawConfig from '@/config/layout/bottom-nav.config.json';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import { buildHomePageCategoryHref } from '@/lib/utils/home-page-category';

interface BottomNavRawConfig {
  messages: typeof rawConfig.messages;
  cartItem: BottomNavItemRawConfig;
  routeConfigs: BottomNavRouteConfigRaw[];
}

const bottomNavConfig = rawConfig as BottomNavRawConfig;

interface BottomNavItemRawConfig {
  id: string;
  labelKey: BottomNavLabelKey;
  icon: string;
  iconClassName: string;
  href?: string;
  /** CMS collection handle — resolved via `resolveCollectionPagePath`. */
  collectionHandle?: string;
  homeCategory?: HomePageCategoryId;
}

interface BottomNavRouteConfigRaw {
  id: string;
  routes: string[];
  /** When set, config applies only on `/` for this home category tab. */
  homeCategory?: HomePageCategoryId;
  items: BottomNavItemRawConfig[];
}

type BottomNavLabelKey = keyof typeof rawConfig.messages.labels;

export interface BottomNavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: string;
  iconClassName: string;
  homeCategory?: HomePageCategoryId;
}

export interface BottomNavRouteConfig {
  id: string;
  routes: string[];
  homeCategory?: HomePageCategoryId;
  items: BottomNavItemConfig[];
}

export const bottomNavMessages = bottomNavConfig.messages;

function normalizeBottomNavHref(href: string): string {
  if (href.startsWith('/')) {
    return href;
  }

  return `/${href}`;
}

/**
 * Builds a resolved bottom-nav item from JSON config.
 *
 * @param raw - Raw item entry from `bottom-nav.config.json`.
 * @returns Item with resolved label and href.
 */
function buildBottomNavItem(raw: BottomNavItemRawConfig): BottomNavItemConfig {
  const href = raw.homeCategory
    ? buildHomePageCategoryHref(raw.homeCategory)
    : raw.collectionHandle
      ? resolveCollectionPagePath(raw.collectionHandle)
      : normalizeBottomNavHref(raw.href ?? '/');

  return {
    id: raw.id,
    label: bottomNavMessages.labels[raw.labelKey],
    href,
    icon: raw.icon,
    iconClassName: raw.iconClassName,
    ...(raw.homeCategory ? { homeCategory: raw.homeCategory } : {}),
  };
}

/** Cart tab — always rendered last on mobile bottom nav. */
export const bottomNavCartItem = buildBottomNavItem(bottomNavConfig.cartItem);

/** Route-scoped bottom nav item sets (cart is appended separately at render time). */
export const bottomNavRouteConfigs: BottomNavRouteConfig[] = bottomNavConfig.routeConfigs.map(
  (config) => ({
    id: config.id,
    routes: config.routes,
    ...(config.homeCategory ? { homeCategory: config.homeCategory } : {}),
    items: config.items.map(buildBottomNavItem),
  }),
);
