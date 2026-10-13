import rawCartConfig from '@/config/cart/cart.config.json';

const LANDING_UTM_STORAGE_KEY = rawCartConfig.constants.landingUtmStorageKey;

/** Standard UTM query keys captured on landing and replayed at checkout. */
export const UTM_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmQueryKey = (typeof UTM_QUERY_KEYS)[number];

/** Prefix applied to every GoKwik / checkout `utm_source` value. */
export const CHECKOUT_UTM_SOURCE_PREFIX = 'new_website';

/** DOM id for the early GoKwik UTM cookie bootstrap script. */
export const GOKWIK_UTM_COOKIE_SCRIPT_ID = 'gokwik-utm-cookie';

const UTM_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/**
 * Builds checkout `utm_source` as `new_website` or `new_website_{original}`.
 *
 * @param originalSource - Landing/ad platform source (e.g. `meta`, `google`).
 * @returns Prefixed source for GoKwik attribution.
 */
export function toCheckoutUtmSource(originalSource?: string | null): string {
  const trimmed = originalSource?.trim() ?? '';
  if (!trimmed) {
    return CHECKOUT_UTM_SOURCE_PREFIX;
  }

  if (
    trimmed === CHECKOUT_UTM_SOURCE_PREFIX ||
    trimmed.startsWith(`${CHECKOUT_UTM_SOURCE_PREFIX}_`)
  ) {
    return trimmed;
  }

  return `${CHECKOUT_UTM_SOURCE_PREFIX}_${trimmed}`;
}

/**
 * Returns the original attribution source, ignoring the bare `new_website` default.
 *
 * @param value - Raw or already-prefixed utm_source.
 * @returns Original source, or undefined when absent / default-only.
 */
export function resolveOriginalUtmSource(value?: string | null): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || trimmed === CHECKOUT_UTM_SOURCE_PREFIX) {
    return undefined;
  }

  if (trimmed.startsWith(`${CHECKOUT_UTM_SOURCE_PREFIX}_`)) {
    const original = trimmed.slice(CHECKOUT_UTM_SOURCE_PREFIX.length + 1).trim();
    return original || undefined;
  }

  return trimmed;
}

/**
 * Builds `utm_source=…&utm_medium=…` for GoKwik's `gk_utm_source` cookie.
 *
 * @param utmParams - Resolved checkout UTM map.
 * @returns Query string without a leading `?`.
 */
export function toGokwikUtmQueryString(utmParams: Record<string, string>): string {
  const parts: string[] = [];

  for (const key of UTM_QUERY_KEYS) {
    const value = utmParams[key]?.trim();
    if (value) {
      parts.push(`${key}=${value}`);
    }
  }

  return parts.join('&');
}

/**
 * Parses UTM params from URL search params.
 *
 * @param searchParams - Current page query string.
 */
export function parseUtmQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const utmParams: Record<string, string> = {};

  for (const key of UTM_QUERY_KEYS) {
    const value = searchParams.get(key)?.trim();
    if (value) {
      utmParams[key] = value;
    }
  }

  return utmParams;
}

/**
 * Persists landing UTMs to localStorage and GoKwik cookies when the URL has UTM keys.
 *
 * @param searchParams - Landing page query string.
 */
export function captureLandingUtmParams(searchParams: URLSearchParams): void {
  if (typeof window === 'undefined') {
    return;
  }

  const utmParams = parseUtmQueryParams(searchParams);
  if (Object.keys(utmParams).length === 0) {
    return;
  }

  try {
    localStorage.setItem(LANDING_UTM_STORAGE_KEY, JSON.stringify(utmParams));
  } catch {
    // localStorage may be unavailable in private mode.
  }

  // GoKwik cookies get the prefixed source; localStorage keeps the original for re-resolve.
  persistCheckoutUtmCookies({
    ...utmParams,
    utm_source: toCheckoutUtmSource(utmParams.utm_source),
  });
}

/**
 * Returns UTMs saved from the user's landing URL, if any.
 */
export function getStoredLandingUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(LANDING_UTM_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    const utmParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) {
        utmParams[key] = value.trim();
      }
    }

    return utmParams;
  } catch {
    return {};
  }
}

/**
 * Merges UTM params onto the current page URL query string for GoKwik SDK attribution.
 *
 * @param utmParams - Resolved checkout UTM map.
 */
export function applyUtmParamsToPageUrl(utmParams: Record<string, string>): void {
  if (typeof window === 'undefined' || Object.keys(utmParams).length === 0) {
    return;
  }

  const url = new URL(window.location.href);
  let changed = false;

  for (const [key, value] of Object.entries(utmParams)) {
    if (value && url.searchParams.get(key) !== value) {
      url.searchParams.set(key, value);
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

/**
 * Writes checkout UTMs to cookies GoKwik actually reads (`gk_utm_source`, not only `utm_*`).
 *
 * @param utmParams - Resolved checkout UTM map.
 */
export function persistCheckoutUtmCookies(utmParams: Record<string, string>): void {
  if (typeof document === 'undefined') {
    return;
  }

  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  const cookieSuffix = `; Path=/; Max-Age=${UTM_COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;

  for (const key of UTM_QUERY_KEYS) {
    const value = utmParams[key]?.trim();
    if (!value) {
      continue;
    }

    document.cookie = `${key}=${encodeURIComponent(value)}${cookieSuffix}`;
  }

  const gkUtmValue = toGokwikUtmQueryString(utmParams);
  if (gkUtmValue) {
    document.cookie = `gk_utm_source=${encodeURIComponent(gkUtmValue)}${cookieSuffix}`;
  }

  if (typeof window !== 'undefined') {
    const landingPath = window.location.pathname || '/';
    document.cookie = `gk_landing_page=${encodeURIComponent(landingPath)}${cookieSuffix}`;
  }
}

/**
 * Builds an early inline script that copies `utm_*` from the live URL into `gk_utm_source`
 * before the GoKwik SDK snapshots cookies.
 *
 * @returns Inline script body for Next.js Script (`beforeInteractive`).
 */
export function buildGokwikUtmCookieScript(): string {
  return `(function () {
  try {
    var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    var prefix = '${CHECKOUT_UTM_SOURCE_PREFIX}';
    var params = new URLSearchParams(window.location.search);
    var parts = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = params.get(key);
      if (!value || !value.trim()) {
        continue;
      }
      value = value.trim();
      if (key === 'utm_source' && value !== prefix && value.indexOf(prefix + '_') !== 0) {
        value = prefix + '_' + value;
      }
      parts.push(key + '=' + value);
    }
    if (!parts.length) {
      return;
    }
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    var suffix = '; Path=/; Max-Age=${UTM_COOKIE_MAX_AGE_SEC}; SameSite=Lax' + secure;
    document.cookie = 'gk_utm_source=' + encodeURIComponent(parts.join('&')) + suffix;
    document.cookie = 'gk_landing_page=' + encodeURIComponent(window.location.pathname || '/') + suffix;
  } catch (e) {}
})();`;
}
