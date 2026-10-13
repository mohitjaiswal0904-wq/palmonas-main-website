import { isProductFeatureEnabled, productMessages } from '@/config/product/product.config';
import type { ProductOffer } from '@/types/product';

/** View model for the gold PDP limited-time offer banner. */
export interface GoldLimitedTimeOfferView {
  /** Offer title from API `name`. */
  title: string;
  /** Offer body from API `description` (or placeholder). */
  description: string;
  /** Coupon code — empty when offer is display-only. */
  code: string;
  /** True when coupon should render (not `discountCategory: display`). */
  showCouponCode: boolean;
  /** Freebie product image from API `freebie_image_url`. */
  freebieImageUrl: string;
  /** Freebie PDP route from API `freebie_route`. */
  freebieRoute: string;
  /** True when subtitle should be a View Details link. */
  showViewDetails: boolean;
}

/**
 * Resolve gold limited-time offer banner from API offers only (no mock).
 *
 * Prefers a FREEBIE with `freebieImageUrl` when present so the Figma freebie
 * thumb + View Details layout can render. Coupon omitted for display-only
 * (`discountCategory === 'display'`), same rule as {@link OfferItem}.
 *
 * @param offers - Product offers from the PDP payload.
 * @returns Banner view model, or `null` when nothing to show.
 */
export function resolveGoldLimitedTimeOffer(
  offers: ProductOffer[],
): GoldLimitedTimeOfferView | null {
  if (!isProductFeatureEnabled('goldLimitedTimeOffer')) {
    return null;
  }

  const offer =
    offers.find((entry) => entry.type === 'FREEBIE' && Boolean(entry.freebieImageUrl?.trim())) ??
    offers[0];
  if (!offer || !isUsableOffer(offer)) {
    return null;
  }

  const title = offer.name.trim();
  const freebieImageUrl = offer.freebieImageUrl?.trim() ?? '';
  const freebieRoute = offer.freebieRoute?.trim() ?? '';
  const showViewDetails = freebieImageUrl.length > 0 && freebieRoute.length > 0;
  const description = showViewDetails ? productMessages.viewDetails : resolveDescription(offer);

  if (!title && !description && !freebieImageUrl) {
    return null;
  }

  const showCouponCode = offer.discountCategory !== 'display' && freebieImageUrl.length === 0;
  const code = showCouponCode ? (offer.code || offer.key).trim() : '';

  return {
    title,
    description,
    code,
    showCouponCode: showCouponCode && code.length > 0,
    freebieImageUrl,
    freebieRoute,
    showViewDetails,
  };
}

function isUsableOffer(offer: ProductOffer): boolean {
  if ((offer.code || offer.key).trim()) {
    return true;
  }

  if (offer.name.trim() || offer.description.trim()) {
    return true;
  }

  if (offer.freebieImageUrl?.trim()) {
    return true;
  }

  return offer.placeholder.some((entry) => entry.text.trim().length > 0);
}

function resolveDescription(offer: ProductOffer): string {
  const description = offer.description.trim();
  if (description) {
    return description;
  }

  return offer.placeholder.find((entry) => entry.text.trim())?.text.trim() ?? '';
}
