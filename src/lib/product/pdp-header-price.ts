/** PDP header price anchor used by the sticky ATC bar. */
export const PRODUCT_PDP_PRICE_ID = 'product-pdp-price';

export interface PdpHeaderPriceReading {
  price: number | null;
  compareAtPrice: number | null;
}

/**
 * Reads selling / compare-at prices from the PDP header price node.
 *
 * @param element - Header price element, or null when it is not mounted.
 * @returns Parsed prices, or nulls when the dataset is missing or invalid.
 */
export function readPdpHeaderPriceFromElement(element: HTMLElement | null): PdpHeaderPriceReading {
  if (!element) {
    return { price: null, compareAtPrice: null };
  }

  const price = Number(element.dataset.sellingPrice);
  if (!Number.isFinite(price)) {
    return { price: null, compareAtPrice: null };
  }

  const rawCompare = element.dataset.compareAtPrice;
  if (!rawCompare) {
    return { price, compareAtPrice: null };
  }

  const compareAtPrice = Number(rawCompare);
  return {
    price,
    compareAtPrice: Number.isFinite(compareAtPrice) ? compareAtPrice : null,
  };
}
