import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { CartStoreDiscount } from '@/types/cart';

/** Resolved unlock prompt for an unavailable store offer. */
export interface UnavailableOfferUnlock {
  /** Items still required before the offer can apply. */
  itemCountMissing: number;
  /** Collection path for Add Items, or null when no handle is known. */
  href: string | null;
}

/**
 * Reads how many entitled items are still missing for an unavailable offer.
 *
 * @param offer - Store offer from `unavailableDiscounts`.
 * @returns Non-negative missing item count (defaults to 1 when unknown).
 */
export function resolveUnavailableItemCountMissing(offer: CartStoreDiscount): number {
  const fromEntitled = offer.failure_data?.missingEntitledDetails?.itemCountMissing;
  const fromFailure = offer.failure_data?.itemCountMissing;
  const raw = fromEntitled ?? fromFailure;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return 1;
}

/**
 * Resolves the collection route for unlocking an unavailable offer.
 *
 * @param offer - Store offer from `unavailableDiscounts`.
 * @returns Storefront collection path, or null when no handle exists.
 */
export function resolveUnavailableOfferHref(offer: CartStoreDiscount): string | null {
  const handle =
    offer.collections?.find((collection) => collection.handle?.trim())?.handle?.trim() ||
    offer.entitledCollectionHandles?.find((value) => value.trim())?.trim() ||
    null;
  if (!handle) {
    return null;
  }
  return resolveCollectionPagePath(handle);
}

/**
 * Builds unlock CTA data for an unavailable store offer.
 *
 * @param offer - Store offer from `unavailableDiscounts`.
 * @returns Missing count and optional collection href.
 */
export function resolveUnavailableOfferUnlock(offer: CartStoreDiscount): UnavailableOfferUnlock {
  return {
    itemCountMissing: resolveUnavailableItemCountMissing(offer),
    href: resolveUnavailableOfferHref(offer),
  };
}
