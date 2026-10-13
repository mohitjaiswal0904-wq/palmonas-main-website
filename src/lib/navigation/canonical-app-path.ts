/** Legacy CMS paths that redirect to a canonical app route (see `next.config.ts`). */
const CANONICAL_PATH_ALIASES: Readonly<Record<string, string>> = {
  '/pages/about-us': '/about',
  '/page/about-us': '/about',
  '/pages/about': '/about',
  '/page/about': '/about',
  '/page/gifts': '/gifts',
  '/page/offers': '/offers',
  '/pages/faq': '/pages/faqs',
  '/pages/lifetime-warranty-policy': '/pages/warranty-page',
  '/pages/lifetime-buyback-policy': '/pages/lifetime-buy-back-policy',
};

/**
 * Map a legacy or alias pathname to its canonical in-app route.
 *
 * @param pathname - Normalized pathname (leading slash, no hash).
 */
export function canonicalizeAppPath(pathname: string): string {
  return CANONICAL_PATH_ALIASES[pathname] ?? pathname;
}

/**
 * Canonicalize an internal href so soft navigation targets the final route, not a redirect.
 *
 * @param href - Internal app href (optional search).
 * @returns Canonical href, or the original string when unparseable.
 */
export function canonicalizeAppHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return href;
  }

  try {
    const url =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? new URL(trimmed)
        : new URL(trimmed, 'http://local.invalid');

    return `${canonicalizeAppPath(url.pathname)}${url.search}`;
  } catch {
    return href;
  }
}
