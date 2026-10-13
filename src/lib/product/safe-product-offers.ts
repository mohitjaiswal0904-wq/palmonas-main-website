import type { ProductOffer } from '@/types/product';

/**
 * Normalize PDP offers for Client Component rendering.
 *
 * Production Flight omits `undefined` keys that `next dev` keeps. Gold PDP
 * already maps through `resolveGoldLimitedTimeOffer`; demifine cards
 * must do the same so coupon `code`, description, and placeholder survive.
 *
 * @param offers - Product offers from the PDP payload.
 * @returns Offers with string fields filled and unusable entries dropped.
 */
export function toSafeProductOffers(offers: ProductOffer[] | null | undefined): ProductOffer[] {
  if (!offers?.length) {
    return [];
  }

  return offers.flatMap((offer) => {
    const safeOffer = toSafeProductOffer(offer);
    return safeOffer ? [safeOffer] : [];
  });
}

/**
 * Fill string fields and drop offers that have nothing to render.
 *
 * @param offer - Raw offer after SSR clone (fields may be missing).
 * @returns Safe offer, or `null` when there is no title, body, coupon, or freebie.
 */
function toSafeProductOffer(offer: ProductOffer): ProductOffer | null {
  const key = (offer.key ?? '').trim();
  const code = (offer.code ?? '').trim();
  const coupon = code || key;
  const name = (offer.name ?? '').trim();
  const placeholder = (offer.placeholder ?? []).map((item) => ({
    text: (item.text ?? '').trim(),
    style: item.style ?? 'normal',
  }));
  const description =
    (offer.description ?? '').trim() || placeholder.find((entry) => entry.text)?.text || '';
  const freebieImageUrl = offer.freebieImageUrl?.trim();
  const freebieRoute = offer.freebieRoute?.trim();
  const discountCategory = offer.discountCategory?.trim();

  if (!coupon && !name && !description && !freebieImageUrl) {
    return null;
  }

  return {
    key: key || coupon,
    name,
    description,
    code: coupon,
    type: offer.type === 'FREEBIE' ? 'FREEBIE' : 'DISCOUNT',
    discountValue: offer.discountValue ?? null,
    ...(offer.payablePrice && offer.payablePrice > 0 ? { payablePrice: offer.payablePrice } : {}),
    placeholder,
    ...(discountCategory ? { discountCategory } : {}),
    ...(freebieImageUrl ? { freebieImageUrl } : {}),
    ...(freebieRoute ? { freebieRoute } : {}),
    ...(offer.collections?.length ? { collections: offer.collections } : {}),
  };
}
