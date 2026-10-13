import { canonicalizeAppPath } from '@/lib/navigation/canonical-app-path';

/**
 * Normalize an href to pathname + search for pending-nav comparisons.
 *
 * @param href - Absolute path, full URL, or relative href.
 * @returns Canonical `pathname` + `search` (no hash), or null if unparseable / external.
 */
export function normalizeHref(href: string): { pathname: string; search: string } | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return null;
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      if (typeof window !== 'undefined' && url.origin !== window.location.origin) {
        return null;
      }
      return { pathname: url.pathname, search: url.search };
    }

    const url = new URL(trimmed, 'http://local.invalid');
    return { pathname: url.pathname, search: url.search };
  } catch {
    return null;
  }
}

/**
 * Return whether two hrefs refer to the same path + search.
 *
 * @param a - First href.
 * @param b - Second href.
 */
export function hrefsMatch(a: string, b: string): boolean {
  const left = normalizeHref(a);
  const right = normalizeHref(b);
  if (!left || !right) {
    return false;
  }
  return (
    canonicalizeAppPath(left.pathname) === canonicalizeAppPath(right.pathname) &&
    left.search === right.search
  );
}

/**
 * Build current location string from Next pathname + searchParams string.
 *
 * @param pathname - Current pathname.
 * @param search - Search string with or without leading `?`.
 */
export function buildLocationHref(pathname: string, search = ''): string {
  if (!search) {
    return pathname;
  }
  return search.startsWith('?') ? `${pathname}${search}` : `${pathname}?${search}`;
}
