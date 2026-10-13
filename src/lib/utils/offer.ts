import type { Product, ProductOffer } from '@/types/product';

/** Canonical Shopify collection handle for New Arrivals. */
export const NEW_ARRIVALS_COLLECTION_HANDLE = 'new-arrivals';

/** Normalised tokens that identify the New Arrivals collection or tag. */
const NEW_ARRIVALS_TOKENS = new Set(['new-arrivals', 'new-arrival', 'newarrivals', 'newarrival']);

/** Label shown for "buy one get one" freebie offers. */
const BUY_ONE_GET_ONE_LABEL = 'B1G1';

/** Matches offer names that describe a "buy one get one" deal. */
const BUY_ONE_GET_ONE_PATTERN = /buy\s*1\s*get\s*1|b1g1/i;

/** Extracts a bundled price (e.g. "₹1,499") embedded in an offer name. */
const BUNDLE_PRICE_PATTERN = /₹\s*([\d,]+)/;

/**
 * Normalises a collection handle or product tag for New Arrivals matching.
 *
 * @param value - Raw handle, tag, or badge label.
 * @returns Lowercased hyphenated token.
 */
function normalizeNewArrivalsToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

/**
 * Returns whether a collection handle is the New Arrivals collection.
 *
 * @param collectionHandle - Optional listing or CMS collection handle.
 * @returns True when the handle matches New Arrivals.
 */
export function isNewArrivalsCollectionHandle(collectionHandle?: string | null): boolean {
  if (!collectionHandle) {
    return false;
  }

  return NEW_ARRIVALS_TOKENS.has(normalizeNewArrivalsToken(collectionHandle));
}

/**
 * Returns whether a product belongs to the New Arrivals collection via tags or badge.
 *
 * @param product - Storefront product.
 * @returns True when product tags or badge label identify New Arrivals.
 */
export function isNewArrivalProduct(
  product: Pick<Product, 'badgeLabel' | 'filterAttributes' | 'productTags'>,
): boolean {
  if (
    product.badgeLabel &&
    NEW_ARRIVALS_TOKENS.has(normalizeNewArrivalsToken(product.badgeLabel))
  ) {
    return true;
  }

  const tagValues = [
    ...(product.filterAttributes?.tags ?? []),
    ...(product.productTags?.flatMap((tag) => [tag.name, tag.value]) ?? []),
  ];

  return tagValues.some((tag) => NEW_ARRIVALS_TOKENS.has(normalizeNewArrivalsToken(tag)));
}

/**
 * Returns whether the card should show the New Arrivals fallback instead of limited stock.
 *
 * @param product - Storefront product.
 * @param collectionHandle - Optional parent collection handle from CMS/PLP.
 * @returns True when the product is in New Arrivals by context or tags.
 */
export function shouldShowNewArrivalsFallback(
  product: Pick<Product, 'badgeLabel' | 'filterAttributes' | 'productTags'>,
  collectionHandle?: string | null,
): boolean {
  return isNewArrivalsCollectionHandle(collectionHandle) || isNewArrivalProduct(product);
}

/**
 * Resolves the price to advertise for an offer, preferring an explicit bundle
 * price in the name, then the discount value, then the base product price.
 */
export function getOfferPrice(offer: ProductOffer, productPrice: number): number {
  const bundlePrice = offer.name.match(BUNDLE_PRICE_PATTERN);

  if (bundlePrice?.[1]) {
    const parsed = Number.parseFloat(bundlePrice[1].replace(/,/g, ''));
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (offer.discountValue) {
    return offer.discountValue;
  }

  return productPrice;
}

/** Builds the human-readable description for an offer card. */
export function getOfferDescription(offer: ProductOffer): string {
  const headline = offer.placeholder[0]?.text;
  const note = offer.description.trim();

  if (headline && note) {
    return `${headline}! ${note}`;
  }

  if (note) {
    return note;
  }

  return offer.name;
}

/** Resolves the coupon code label, collapsing freebie offers to "B1G1". */
export function getOfferCodeLabel(offer: ProductOffer): string {
  if (offer.type === 'FREEBIE' && BUY_ONE_GET_ONE_PATTERN.test(offer.name)) {
    return BUY_ONE_GET_ONE_LABEL;
  }

  return offer.code;
}

/**
 * Resolves the primary card promo label from the first API offer.
 *
 * @param offer - Product offer payload from the API.
 * @returns Offer name or placeholder headline when present.
 */
function getProductCardOfferPrimaryText(offer: ProductOffer): string | null {
  const name = offer.name.trim();
  if (name) {
    return name;
  }

  const headline = offer.placeholder[0]?.text.trim();
  if (headline) {
    return headline;
  }

  const description = offer.description.trim();
  return description || null;
}

/**
 * Builds the product-card offer promo row from API offers.
 *
 * @param offers - Product offers returned by the API.
 * @returns Primary label and count of additional offers, or null when empty.
 */
export function getProductCardOfferPromo(
  offers: ProductOffer[],
): { primaryText: string; additionalCount: number } | null {
  if (offers.length === 0) {
    return null;
  }

  const firstOffer = offers[0];
  if (!firstOffer) {
    return null;
  }

  const remainingOffers = offers.slice(1);
  const primaryText = getProductCardOfferPrimaryText(firstOffer);

  if (!primaryText) {
    return null;
  }

  return {
    primaryText,
    additionalCount: remainingOffers.length,
  };
}

/**
 * Read a rupee amount from listing-card offer copy.
 *
 * @param value - Offer name, description, or placeholder text.
 * @returns Parsed amount, or null when none is present.
 */
function readBundlePrice(value: string): number | null {
  const bundlePrice = value.match(BUNDLE_PRICE_PATTERN);

  if (!bundlePrice?.[1]) {
    return null;
  }

  const parsed = Number.parseFloat(bundlePrice[1].replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Join placeholder segments so split copy like “Get it at” + “₹12,911” can be parsed.
 *
 * @param offer - Product offer payload from the API.
 * @returns Combined placeholder text.
 */
function readOfferPlaceholderText(offer: ProductOffer): string {
  return offer.placeholder.map((item) => item.text).join(' ');
}

/**
 * Resolve the “Get it for ₹X” price for the listing-card offer cycle.
 *
 * Uses the first discount’s `payablePrice` (per-unit price after the offer).
 * Does not use bundle totals in the offer name (e.g. “Buy 6 At ₹4999”).
 * When payable price is missing, falls back to cheaper copy rupees, then selling price.
 *
 * @param offers - Product offers returned by the API.
 * @param sellingPrice - Current card selling price.
 * @returns Effective offer price, or null when there are no offers.
 */
export function getProductCardOfferEffectivePrice(
  offers: ProductOffer[],
  sellingPrice: number,
): number | null {
  if (offers.length === 0) {
    return null;
  }

  const firstDiscount = offers.find((offer) => offer.type !== 'FREEBIE') ?? offers[0];
  if (firstDiscount?.payablePrice && firstDiscount.payablePrice > 0) {
    return firstDiscount.payablePrice;
  }

  for (const offer of offers) {
    if (offer.type === 'FREEBIE') {
      continue;
    }

    const parsed =
      readBundlePrice(readOfferPlaceholderText(offer)) ??
      readBundlePrice(offer.name) ??
      readBundlePrice(offer.description);

    if (parsed !== null && parsed < sellingPrice) {
      return parsed;
    }
  }

  return sellingPrice;
}

/** Offer tab shown in the PDP Shop By Offers band. */
export interface ShopByOfferTab {
  key: string;
  name: string;
  handle: string;
}

/**
 * Build Shop By Offers tabs from discounts that include a collection handle.
 *
 * @param offers - Product offers from the PDP payload.
 * @returns Tabs in offer order; empty when no discount has a collection.
 */
export function getShopByOfferTabs(offers: ProductOffer[]): ShopByOfferTab[] {
  const tabs: ShopByOfferTab[] = [];
  const seen = new Set<string>();

  for (const offer of offers) {
    const handle = offer.collections?.find((collection) => collection.handle.trim())?.handle.trim();
    const name = offer.name.trim();
    const key = (offer.key || offer.code).trim();

    if (!handle || !name || !key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tabs.push({ key, name, handle });
  }

  return tabs;
}

/**
 * Returns whether a listing product belongs to a collection offer chip.
 *
 * @param product - Storefront product with listing offers.
 * @param offerLabel - Chip label from collection or product-list offers.
 * @returns True when an offer name or code matches the chip.
 */
export function productMatchesCollectionOffer(
  product: Pick<Product, 'offers'>,
  offerLabel: string,
): boolean {
  const needle = offerLabel.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return product.offers.some((offer) => {
    const name = offer.name.trim().toLowerCase();
    const code = offer.code.trim().toLowerCase();

    return name.includes(needle) || needle.includes(name) || code === needle;
  });
}
