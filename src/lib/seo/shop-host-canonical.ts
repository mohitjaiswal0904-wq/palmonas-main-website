/**
 * Temporary A/B duplicate hosts (shop.palmonas.com / myshopify) must notindex
 * and must point canonical at the primary palmonas.com origin.
 */

/** Primary storefront origin used for canonical URLs. */
export const PRIMARY_CANONICAL_ORIGIN = 'https://palmonas.com';

/** Hostnames treated as temporary duplicates of the primary storefront. */
export const SHOP_DUPLICATE_HOSTS = new Set(['shop.palmonas.com', 'palmonas.myshopify.com']);

/** DOM id for the shop-host canonical / robots bootstrap script. */
export const SHOP_HOST_CANONICAL_SCRIPT_ID = 'shop-host-canonical';

/**
 * Returns true when the hostname is a temporary shop duplicate of palmonas.com.
 *
 * @param hostname - Request or window hostname (port stripped by caller if needed).
 */
export function isShopDuplicateHost(hostname: string): boolean {
  if (!hostname) {
    return false;
  }

  return SHOP_DUPLICATE_HOSTS.has(hostname.toLowerCase());
}

/**
 * Builds the early inline script that forces canonical → palmonas.com and robots
 * noindex on temporary shop duplicate hosts.
 *
 * @returns Inline script body for Next.js Script (`beforeInteractive`).
 */
export function buildShopHostCanonicalScript(): string {
  return `(function () {
  var PRIMARY_ORIGIN = ${JSON.stringify(PRIMARY_CANONICAL_ORIGIN)};
  var SHOP_HOSTS = {
    'shop.palmonas.com': true,
    'palmonas.myshopify.com': true
  };

  var host = (window.location.hostname || '').toLowerCase();
  var isShopHost = !!SHOP_HOSTS[host];
  if (!isShopHost) return;

  var path = window.location.pathname || '/';
  var canonicalHref = path === '/' ? PRIMARY_ORIGIN : PRIMARY_ORIGIN + path;

  function upsertCanonical() {
    var links = document.querySelectorAll('link[rel="canonical"]');
    var link = links[0];
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
    for (var i = 1; i < links.length; i++) {
      links[i].parentNode.removeChild(links[i]);
    }
  }

  function upsertRobots() {
    var metas = document.querySelectorAll('meta[name="robots"]');
    var meta = metas[0];
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    var content = (meta.getAttribute('content') || '').toLowerCase();
    if (content.indexOf('noindex') === -1) {
      meta.setAttribute('content', 'noindex, follow');
    }
  }

  upsertCanonical();
  upsertRobots();
})();`;
}
