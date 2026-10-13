import { canonicalizeAppPath } from '@/lib/navigation/canonical-app-path';

/** Static marketing routes — small RSC payloads, safe to prefetch, no nav overlay. */
const STATIC_APP_ROUTES = new Set(['/about', '/contact-us', '/palmonas-stores']);

/**
 * Returns true for lightweight static pages that should prefetch and skip the nav overlay.
 *
 * @param href - Internal app path (optional search).
 */
export function isStaticAppRoute(href: string): boolean {
  const pathname = href.split('?')[0]?.trim();

  if (!pathname || !pathname.startsWith('/')) {
    return false;
  }

  return STATIC_APP_ROUTES.has(canonicalizeAppPath(pathname));
}

/**
 * Returns true when an internal href should use Next.js Link prefetch.
 *
 * @param href - Internal app path (optional search).
 */
export function shouldPrefetchAppRoute(href: string): boolean {
  return isStaticAppRoute(href);
}

/**
 * Returns true when soft navigation should skip the full-screen pending overlay.
 *
 * @param href - Internal app path (optional search).
 */
export function shouldSkipNavigationOverlay(href: string): boolean {
  return isStaticAppRoute(href);
}
