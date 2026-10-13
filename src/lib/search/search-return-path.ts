const SEARCH_RETURN_PATH_KEY = 'palmonas:search-return-path';
const SEARCH_RETURN_FALLBACK = '/';

/**
 * Persist the page that opened search so back can leave the search sheet.
 *
 * @param path - Absolute app path including search (e.g. `/` or `/products/ring`).
 */
export function setSearchReturnPath(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const trimmed = path.trim() || SEARCH_RETURN_FALLBACK;
  if (trimmed.startsWith('/search')) {
    return;
  }

  try {
    window.sessionStorage.setItem(SEARCH_RETURN_PATH_KEY, trimmed);
  } catch {
    // sessionStorage may be unavailable in private mode.
  }
}

/**
 * Capture the current location as the search return path (no-op when already on search).
 */
export function captureSearchReturnPathFromLocation(): void {
  if (typeof window === 'undefined') {
    return;
  }

  setSearchReturnPath(`${window.location.pathname}${window.location.search}`);
}

/**
 * Read and clear the stored return path.
 *
 * @returns Path to open when leaving search (defaults to `/`).
 */
export function consumeSearchReturnPath(): string {
  if (typeof window === 'undefined') {
    return SEARCH_RETURN_FALLBACK;
  }

  try {
    const stored = window.sessionStorage.getItem(SEARCH_RETURN_PATH_KEY);
    window.sessionStorage.removeItem(SEARCH_RETURN_PATH_KEY);
    if (stored && stored.startsWith('/') && !stored.startsWith('/search')) {
      return stored;
    }
  } catch {
    // sessionStorage may be unavailable in private mode.
  }

  return SEARCH_RETURN_FALLBACK;
}
