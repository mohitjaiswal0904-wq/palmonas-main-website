import { pickBestStoreOffer } from '@/lib/cart/pick-best-store-offer';
import type { CartStoreDiscount } from '@/types/cart';

/** Better store offer and how much more it saves than the applied code. */
export interface StoreOfferSwap {
  better: CartStoreDiscount;
  extraSaved: number;
}

/**
 * Finds a better available store offer than the one already applied.
 *
 * @param appliedCode - Currently applied discount code, or null.
 * @param appliedSaved - Rupees already saved by the applied code.
 * @param availableStore - Eligible store offers from the discount list.
 * @returns Better offer and extra save, or null when swap is not worth it.
 */
export function pickStoreOfferSwap(
  appliedCode: string | null,
  appliedSaved: number,
  availableStore: readonly CartStoreDiscount[],
): StoreOfferSwap | null {
  if (!appliedCode) {
    return null;
  }

  const better = pickBestStoreOffer(
    availableStore.filter((offer) => offer.discountCode !== appliedCode),
  );
  if (!better) {
    return null;
  }

  const extraSaved = Math.max(0, Math.round((better.amountSaved ?? 0) - appliedSaved));
  if (extraSaved <= 0) {
    return null;
  }

  return { better, extraSaved };
}
