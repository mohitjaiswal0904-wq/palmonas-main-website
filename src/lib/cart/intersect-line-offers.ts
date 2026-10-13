import type {
  CartDiscountOffer,
  CartItemApplicableDiscount,
  CartStoreDiscount,
} from '@/types/cart';

/**
 * Normalizes a discount code/key for case-insensitive matching.
 *
 * @param value - Raw code or key.
 * @returns Trimmed uppercase string, or empty when blank.
 */
function normalizeOfferKey(value: string | undefined): string {
  return value?.trim().toUpperCase() ?? '';
}

/**
 * Collects store-offer codes from the discount list API (available + unavailable).
 *
 * @param offers - Discount list entries (store and payment).
 * @returns Uppercased store offer codes.
 */
export function collectStoreOfferCodes(
  offers: ReadonlyArray<CartDiscountOffer> | null | undefined,
): Set<string> {
  const codes = new Set<string>();
  if (!offers?.length) {
    return codes;
  }

  for (const offer of offers) {
    if (offer.offerType !== 'store_offer') {
      continue;
    }
    const store = offer as CartStoreDiscount;
    const code = normalizeOfferKey(store.discountCode);
    if (code) {
      codes.add(code);
    }
  }

  return codes;
}

/**
 * Intersects line `applicable_discounts` with **available** store offers from the discount list API.
 *
 * Product cards only show badges that appear in both sources.
 *
 * @param lineDiscounts - Offers attached to a cart line item.
 * @param availableOffers - Available discounts from the list API (unavailable ignored by caller).
 * @returns Line discounts whose key/code matches an available store offer code.
 */
export function intersectLineOffersWithDiscountList(
  lineDiscounts: ReadonlyArray<CartItemApplicableDiscount> | null | undefined,
  availableOffers: ReadonlyArray<CartDiscountOffer> | null | undefined,
): CartItemApplicableDiscount[] {
  if (!lineDiscounts?.length) {
    return [];
  }

  const listCodes = collectStoreOfferCodes(availableOffers);
  if (listCodes.size === 0) {
    return [];
  }

  return lineDiscounts.filter((discount) => {
    const key = normalizeOfferKey(discount.key);
    const code = normalizeOfferKey(discount.code);
    return (key !== '' && listCodes.has(key)) || (code !== '' && listCodes.has(code));
  });
}
