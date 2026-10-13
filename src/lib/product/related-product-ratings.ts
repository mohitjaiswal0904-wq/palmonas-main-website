import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import type { Product, ProductOffer } from '@/types/product';

/** Fetches one catalog product by id — injected so this stays client/server agnostic. */
type ProductByIdFn = (id: string) => Promise<Product>;

type RelatedProductEnrichment = {
  avgRating?: number;
  reviewCount?: number;
  offers: ProductOffer[];
  handle?: string;
};

/**
 * Returns whether a product already carries a usable rating summary.
 *
 * @param product - Product from a list or wishlist payload.
 * @returns True when both average rating and review count are present.
 */
function hasRating(product: Product): boolean {
  return product.avgRating !== undefined && product.reviewCount !== undefined;
}

/**
 * Returns whether a product already carries at least one offer for the card promo.
 *
 * @param product - Product from a list or wishlist payload.
 * @returns True when the offers array is non-empty.
 */
function hasOffers(product: Product): boolean {
  return product.offers.length > 0;
}

/**
 * Returns whether a product still needs catalog fields from the product-by-id API.
 *
 * @param product - Wishlist product, typically missing review and/or offer data.
 * @returns True when the product has an id and is missing rating or offers.
 */
function needsEnrichment(product: Product): boolean {
  return Boolean(product.id) && (!hasRating(product) || !hasOffers(product));
}

/**
 * Fills missing rating summaries and offers on wishlist products.
 *
 * Wishlist payloads often omit review or offer data, so each incomplete product is
 * looked up through `/api/v2/product/id/{id}`. The fetched product is the match —
 * ids are not compared as strings because wishlist and catalog ids differ in format.
 *
 * ponytail: one product-by-id request per incomplete item. Used on the wishlist
 * page only; related products and cart upsell skip enrichment to avoid N+1 on
 * PDP/cart load.
 *
 * @param products - Products missing review and/or offer data.
 * @param getProductById - Product detail fetcher bound to a client API.
 * @returns Products with `avgRating` / `reviewCount` / `offers` filled where a lookup succeeded.
 */
export async function withRelatedProductRatings(
  products: Product[],
  getProductById: ProductByIdFn,
): Promise<Product[]> {
  const incomplete = products.filter(needsEnrichment);

  if (incomplete.length === 0) {
    return products;
  }

  const lookups = await Promise.allSettled(
    incomplete.map((product) => getProductById(normalizeWishlistProductId(product.id))),
  );

  const enrichmentById = new Map<string, RelatedProductEnrichment>();

  lookups.forEach((lookup, index) => {
    if (lookup.status !== 'fulfilled') {
      return;
    }

    const target = incomplete[index];
    const match = lookup.value;

    if (!target || (!hasRating(match) && !hasOffers(match))) {
      return;
    }

    enrichmentById.set(target.id, {
      avgRating: match.avgRating,
      reviewCount: match.reviewCount,
      offers: match.offers,
      handle: match.handle,
    });
  });

  if (enrichmentById.size === 0) {
    return products;
  }

  return products.map((product) => {
    const enrichment = enrichmentById.get(product.id);

    if (!enrichment) {
      return product;
    }

    const handleLooksLikeId = /^\d+$/.test(product.handle.trim());

    return {
      ...product,
      handle: handleLooksLikeId && enrichment.handle ? enrichment.handle : product.handle,
      avgRating: product.avgRating ?? enrichment.avgRating,
      reviewCount: product.reviewCount ?? enrichment.reviewCount,
      offers: hasOffers(product) ? product.offers : enrichment.offers,
    };
  });
}
