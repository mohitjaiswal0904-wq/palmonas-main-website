import type { ProductOffer } from '@/types/product';

const BUNDLE_QTY_PRICE_PATTERN = /(?:buy|get(?:\s+any)?)\s+(\d+)\s+(?:at|for)\s+₹?\s*([\d,]+)/i;

export interface BuyNAtOffer {
  quantity: number;
  bundlePrice: number;
  unitPrice: number;
}

/**
 * Parses a multi-buy PDP offer ("Buy N At ₹X" / "Get any N for ₹X") into per-item price.
 *
 * @param offer - Product offer from the catalog API.
 * @returns Quantity, bundle total, and unit price, or null when the name is not a multi-buy deal.
 */
export function parseBuyNAtOffer(offer: ProductOffer): BuyNAtOffer | null {
  const match = offer.name.match(BUNDLE_QTY_PRICE_PATTERN);
  const quantity = Number(match?.[1]);
  const bundlePrice = Number(match?.[2]?.replace(/,/g, ''));

  if (
    !Number.isFinite(quantity) ||
    quantity < 2 ||
    !Number.isFinite(bundlePrice) ||
    bundlePrice <= 0
  ) {
    return null;
  }

  return {
    quantity,
    bundlePrice,
    unitPrice: bundlePrice / quantity,
  };
}
