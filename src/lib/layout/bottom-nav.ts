import { HOME_PAGE_CATEGORY_QUERY_PARAM } from '@/config/home-page-categories.config';
import {
  bottomNavCartItem,
  bottomNavRouteConfigs,
  type BottomNavItemConfig,
  type BottomNavRouteConfig,
} from '@/config/layout/bottom-nav.config';
import { resolveHomePageCategory } from '@/lib/utils/home-page-category';

/**
 * Returns whether a pathname matches a bottom-nav route prefix.
 *
 * @param pathname - Current Next.js pathname.
 * @param routePrefix - Exact `/` or a path prefix such as `/cart`.
 * @returns True when the pathname belongs to the route group.
 */
export function matchesBottomNavRoute(pathname: string, routePrefix: string): boolean {
  if (routePrefix === '/') {
    return pathname === '/';
  }

  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

/**
 * Returns whether a route config matches the current pathname and home category.
 *
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @param config - Resolved bottom-nav route config.
 * @returns True when the config should apply.
 */
export function matchesBottomNavRouteConfig(
  pathname: string,
  categoryParam: string | undefined,
  config: BottomNavRouteConfig,
): boolean {
  const routeMatches = config.routes.some((route) => matchesBottomNavRoute(pathname, route));

  if (!routeMatches) {
    return false;
  }

  if (config.homeCategory) {
    return pathname === '/' && resolveHomePageCategory(categoryParam) === config.homeCategory;
  }

  return true;
}

/**
 * Resolves the route config for the current pathname and optional home category.
 *
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @returns Matching route config, or null when the bar should not render.
 */
export function resolveBottomNavRouteConfig(
  pathname: string,
  categoryParam?: string,
): BottomNavRouteConfig | null {
  for (const config of bottomNavRouteConfigs) {
    if (matchesBottomNavRouteConfig(pathname, categoryParam, config)) {
      return config;
    }
  }

  return null;
}

/**
 * Returns route-scoped bottom-nav items for the current pathname.
 *
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @returns Items for the matched route config, or an empty list when hidden.
 */
export function resolveBottomNavItemsForPath(
  pathname: string,
  categoryParam?: string,
): BottomNavItemConfig[] {
  return resolveBottomNavRouteConfig(pathname, categoryParam)?.items ?? [];
}

/**
 * Returns bottom-nav items for the current route with cart appended last.
 *
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @returns Route items plus cart, or an empty list when hidden.
 */
export function resolveMobileBottomNavItems(
  pathname: string,
  categoryParam?: string,
): BottomNavItemConfig[] {
  const routeItems = resolveBottomNavItemsForPath(pathname, categoryParam);

  if (routeItems.length === 0) {
    return [];
  }

  return [...routeItems, bottomNavCartItem];
}

/**
 * Returns whether the mobile bottom nav should render for the current route.
 *
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @returns True when the bar should be shown on mobile.
 */
export function isMobileBottomNavVisible(pathname: string, categoryParam?: string): boolean {
  return resolveBottomNavRouteConfig(pathname, categoryParam) !== null;
}

/**
 * Resolves whether a bottom-nav item is active for the current route.
 *
 * @param item - Resolved bottom-nav item config.
 * @param pathname - Current Next.js pathname.
 * @param categoryParam - Raw `category` search param from the URL.
 * @returns True when the item should use the active visual state.
 */
export function isBottomNavItemActive(
  item: Pick<BottomNavItemConfig, 'id' | 'href' | 'homeCategory'>,
  pathname: string,
  categoryParam: string | undefined,
): boolean {
  if (item.homeCategory) {
    return pathname === '/' && resolveHomePageCategory(categoryParam) === item.homeCategory;
  }

  if (item.href === '/cart') {
    return pathname === '/cart' || pathname.startsWith('/cart/');
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Query param key used to resolve home category active states. */
export const bottomNavCategoryQueryParam = HOME_PAGE_CATEGORY_QUERY_PARAM;
