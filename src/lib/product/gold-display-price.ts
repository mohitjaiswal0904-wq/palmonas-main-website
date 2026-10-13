import type { MtoPrice } from '@/types/mto-price';

/** Shopper-facing gold selling price and optional strikethrough MRP. */
export interface GoldShopperPrices {
  price: number;
  compareAtPrice?: number;
}

/**
 * Resolve the shopper-facing gold price for PDP chrome.
 * Live MTO `total_price` wins so the header matches the breakup grand total
 * instead of a static catalog amount.
 *
 * @param mtoPrice - Live MTO payload for the selected SKU.
 * @param catalogPrice - Product/variant API fallback when MTO is missing or zero.
 * @returns Amount to render as selling price.
 */
export function resolveGoldDisplayPrice(
  mtoPrice: MtoPrice | undefined,
  catalogPrice: number,
): number {
  if (mtoPrice && mtoPrice.totalPrice > 0) {
    return mtoPrice.totalPrice;
  }

  return catalogPrice;
}

/**
 * Return the discounted gold payable amount when MTO `total_price` includes
 * making above `total_price_without_making`.
 *
 * @param mtoPrice - Live MTO payload for the selected SKU.
 * @returns Without-making total, or `undefined` when no discount applies.
 */
export function resolveGoldFinalPrice(mtoPrice: MtoPrice | undefined): number | undefined {
  const totalPrice = mtoPrice?.totalPrice ?? 0;
  const withoutMaking = mtoPrice?.totalPriceWithoutMaking ?? 0;

  if (totalPrice > 0 && withoutMaking > 0 && totalPrice > withoutMaking) {
    return withoutMaking;
  }

  return undefined;
}

/**
 * Resolve gold PDP header prices from the MTO payload.
 * When `total_price` is greater than `total_price_without_making`, the
 * without-making amount is the selling price and `total_price` is struck through.
 * Otherwise selling is `total_price`, with catalog MRP as strikethrough when higher.
 *
 * @param mtoPrice - Live MTO payload for the selected SKU.
 * @param catalogPrice - Product/variant API fallback when MTO is missing or zero.
 * @param catalogCompareAt - Optional catalog MRP from the product API.
 * @returns Selling price and strikethrough amount for {@link PriceBlock}.
 */
export function resolveGoldShopperPrices(
  mtoPrice: MtoPrice | undefined,
  catalogPrice: number,
  catalogCompareAt?: number,
): GoldShopperPrices {
  const totalPrice = resolveGoldDisplayPrice(mtoPrice, catalogPrice);
  const finalPrice = resolveGoldFinalPrice(mtoPrice);

  if (finalPrice != null) {
    return {
      price: finalPrice,
      compareAtPrice: totalPrice,
    };
  }

  const compareAtPrice =
    catalogCompareAt != null && catalogCompareAt > totalPrice ? catalogCompareAt : undefined;

  return { price: totalPrice, compareAtPrice };
}
