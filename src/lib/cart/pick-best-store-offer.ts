import type { CartStoreDiscount } from '@/types/cart';

/**
 * Picks the best eligible store offer (highlighted, then highest save).
 *
 * @param offers - Available store discounts from the list API.
 * @returns Winning offer, or null when the list is empty.
 */
export function pickBestStoreOffer(offers: readonly CartStoreDiscount[]): CartStoreDiscount | null {
  if (offers.length === 0) {
    return null;
  }

  return [...offers].sort((left, right) => {
    const highlightDelta = Number(Boolean(right.highlighted)) - Number(Boolean(left.highlighted));
    if (highlightDelta !== 0) {
      return highlightDelta;
    }
    return (right.amountSaved ?? 0) - (left.amountSaved ?? 0);
  })[0]!;
}
