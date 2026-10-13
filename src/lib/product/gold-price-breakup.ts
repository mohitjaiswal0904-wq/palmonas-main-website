import type { MtoPrice } from '@/types/mto-price';

/**
 * Returns whether MTO returned enough data to show the gold price breakup accordion.
 *
 * @param price - Transformed MTO price, if any.
 */
export function hasGoldPriceBreakup(price: MtoPrice | undefined): price is MtoPrice {
  if (!price) {
    return false;
  }

  if (price.showCalculation) {
    return true;
  }

  return price.totalPrice > 0 && price.pricePerGram > 0;
}
