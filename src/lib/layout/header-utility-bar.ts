import {
  headerUtilityBarDefaults,
  headerUtilityBarRouteConfigs,
  type HeaderUtilityBarRouteConfig,
  type HeaderUtilityBarVisibility,
} from '@/config/layout/header-utility-bar.config';
import { matchesBottomNavRoute } from '@/lib/layout/bottom-nav';

/**
 * Resolves the route config for the current pathname.
 *
 * @param pathname - Current Next.js pathname.
 * @returns Matching route config, or null when defaults apply.
 */
export function resolveHeaderUtilityBarRouteConfig(
  pathname: string,
): HeaderUtilityBarRouteConfig | null {
  for (const config of headerUtilityBarRouteConfigs) {
    if (config.routes.some((route) => matchesBottomNavRoute(pathname, route))) {
      return config;
    }
  }

  return null;
}

/**
 * Merges default visibility with optional route overrides for one breakpoint.
 *
 * @param breakpoint - Mobile or laptop utility bar layout.
 * @param routeConfig - Matched route override, if any.
 * @returns Resolved visibility flags.
 */
export function mergeHeaderUtilityBarVisibility(
  breakpoint: keyof typeof headerUtilityBarDefaults,
  routeConfig: HeaderUtilityBarRouteConfig | null,
): HeaderUtilityBarVisibility {
  return {
    ...headerUtilityBarDefaults[breakpoint],
    ...routeConfig?.[breakpoint],
  };
}

/**
 * Returns resolved header utility visibility for mobile and laptop layouts.
 *
 * @param pathname - Current Next.js pathname.
 * @returns Visibility flags per breakpoint.
 */
export function resolveHeaderUtilityBarVisibility(pathname: string): {
  mobile: HeaderUtilityBarVisibility;
  laptop: HeaderUtilityBarVisibility;
} {
  const routeConfig = resolveHeaderUtilityBarRouteConfig(pathname);

  return {
    mobile: mergeHeaderUtilityBarVisibility('mobile', routeConfig),
    laptop: mergeHeaderUtilityBarVisibility('laptop', routeConfig),
  };
}

/**
 * Whether the sticky site header keeps elevation (shadow, bottom border, blur).
 * Route `showHeaderElevation: false` in header-utility-bar.config.json flattens it.
 *
 * @param pathname - Current Next.js pathname.
 */
export function shouldShowHeaderDropShadow(pathname: string): boolean {
  return resolveHeaderUtilityBarRouteConfig(pathname)?.showHeaderElevation !== false;
}

/**
 * Mobile back-nav title for the current route, when configured.
 *
 * @param pathname - Current Next.js pathname.
 */
export function resolveHeaderBackNavTitle(pathname: string): string | undefined {
  return resolveHeaderUtilityBarRouteConfig(pathname)?.backNavTitle;
}
