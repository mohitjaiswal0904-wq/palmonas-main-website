import { PlatinumPlatedBadge } from '@/components/product/PlatinumPlatedBadge';
import { ProductCardOfferPromo } from '@/components/product/ProductCardOfferPromo';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import type { ProductThemeVariant } from '@/config/theme/product.tokens';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';
import { getProductCardOfferEffectivePrice, getProductCardOfferPromo } from '@/lib/utils/offer';
import type { ProductOffer } from '@/types/product';

interface PriceBlockProps {
  price: number;
  compareAtPrice?: number;
  offers?: ProductOffer[];
  variant?: 'default' | 'card';
  /** PDP category skin — demifine shows % OFF chip beside compare. */
  themeVariant?: ProductThemeVariant;
  /** When true and no offer applies, show New Arrivals instead of limited-stock copy. */
  isNewArrival?: boolean;
  /** When false, hide offer / limited-stock / new-arrivals promo under the price. */
  showOfferPromo?: boolean;
  /** Smaller offer/promo type for narrow cards (e.g. cart recommended carousel). */
  compactOfferPromo?: boolean;
  /** Mutes selling/compare price for unavailable products. */
  disabled?: boolean;
  /**
   * Status line under the price (e.g. Out of Stock). Takes the offer-promo slot so
   * card titles stay aligned with neighbouring in-stock cards.
   */
  statusLabel?: string;
  /** Extra classes for {@link statusLabel} (color/weight). */
  statusLabelClassName?: string;
  /** Platinum listing cards show the plated pill instead of offer/limited-stock copy. */
  showPlatinumPlated?: boolean;
  /** When set, marks this PDP price as the sticky-bar observer target. */
  anchorId?: string;
}

/**
 * Compute discount percent from compare-at price.
 *
 * @param price - Current selling price.
 * @param compareAtPrice - Optional compare-at price.
 * @returns Rounded percent or null when not discounted.
 */
function getDiscountPercent(price: number, compareAtPrice?: number): number | null {
  if (!compareAtPrice || compareAtPrice <= price) {
    return null;
  }

  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/**
 * Interpolates `{{token}}` placeholders in configured copy strings.
 *
 * @param template - Message template containing optional placeholders.
 * @param values - Token values to inject.
 * @returns Interpolated copy string.
 */
function fillMessageTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (message, [token, value]) => message.replaceAll(`{{${token}}}`, value),
    template,
  );
}

export function PriceBlock({
  price,
  compareAtPrice,
  offers = [],
  variant = 'default',
  themeVariant = 'demifine',
  isNewArrival = false,
  showOfferPromo = true,
  compactOfferPromo = false,
  disabled = false,
  statusLabel,
  statusLabelClassName,
  showPlatinumPlated = false,
  anchorId,
}: PriceBlockProps) {
  const showCompareAt = compareAtPrice != null && compareAtPrice > price;
  const discountPercent = getDiscountPercent(price, compareAtPrice);
  const offerPromo =
    variant === 'card' && showOfferPromo && !statusLabel ? getProductCardOfferPromo(offers) : null;
  const offerEffectivePrice = offerPromo ? getProductCardOfferEffectivePrice(offers, price) : null;
  const moreOffersLabel =
    offerPromo && offerPromo.additionalCount > 0
      ? fillMessageTemplate(productMessages.moreOffers, {
          count: String(offerPromo.additionalCount),
        })
      : null;
  const offerPromoTextClass = compactOfferPromo
    ? 'text-xxs pt-[3px] font-normal leading-tight'
    : 'laptop:text-sm text-xs tab:text-xs pt-[3px] font-bold';
  const fallbackPromoTextClass = compactOfferPromo
    ? 'text-xxs pt-[3px] font-normal leading-tight'
    : 'laptop:text-sm text-xs tab:text-xs pt-[3px] font-bold';

  if (variant === 'card') {
    const promo = statusLabel ? (
      <p
        // Join (don't twMerge) — twMerge drops `text-xxs` when `tab:text-xs` is present.
        className={[offerPromoTextClass, statusLabelClassName].filter(Boolean).join(' ')}
        data-testid="price-block-status"
      >
        {statusLabel}
      </p>
    ) : showPlatinumPlated ? (
      <PlatinumPlatedBadge />
    ) : offerPromo ? (
      <ProductCardOfferPromo
        primaryText={offerPromo.primaryText}
        moreOffersLabel={moreOffersLabel}
        effectivePrice={offerEffectivePrice}
        textClass={offerPromoTextClass}
      />
    ) : showOfferPromo && isNewArrival ? (
      <p className={offerPromoTextClass} style={{ color: productTheme.cardOfferPromo }}>
        {productMessages.newArrivals}
      </p>
    ) : showOfferPromo ? (
      <p className={fallbackPromoTextClass} style={{ color: productTheme.ink }}>
        {productMessages.limitedStock.prefix}
        <span className="font-bold" style={{ color: productTheme.sellingFastAccent }}>
          {productMessages.limitedStock.highlight}
        </span>
        {productMessages.limitedStock.suffix}
      </p>
    ) : null;

    return (
      <div className={productTheme.cardOfferCycle.priceContentsClass}>
        <div className={productTheme.cardOfferCycle.priceRowClass}>
          <span
            className={cn(
              'laptop:text-base tab:text-sm text-xs font-bold whitespace-pre-wrap',
              disabled ? 'text-[#9CA3AF]' : 'text-[#151515]',
            )}
          >
            {formatPrice(price)}{' '}
          </span>
          {showCompareAt ? (
            <span
              className={cn(
                'laptop:text-base tab:text-sm shrink-0 text-xs leading-normal font-bold line-through',
                disabled ? 'text-[#C4C4C4]' : 'text-[#595959]',
              )}
            >
              {formatPrice(compareAtPrice)}
            </span>
          ) : null}
        </div>
        {promo ? <div className={productTheme.cardOfferCycle.promoClass}>{promo}</div> : null}
      </div>
    );
  }

  return (
    <div
      id={anchorId}
      data-selling-price={anchorId ? String(price) : undefined}
      data-compare-at-price={anchorId && showCompareAt ? String(compareAtPrice) : undefined}
    >
      <div className="laptop:gap-1.5 flex flex-wrap items-center gap-1">
        {showCompareAt ? (
          <span
            className={cn(productTheme.typography.pdpPriceCompareClass, themeFonts.sans.className)}
            style={{ color: productTheme.compareAt }}
          >
            {formatPrice(compareAtPrice)}
          </span>
        ) : null}
        <span
          className={cn(productTheme.typography.pdpPriceSellingClass, themeFonts.sans.className)}
          style={{ color: productTheme.ink }}
        >
          {formatPrice(price)}
        </span>
        {discountPercent && themeVariant === 'demifine' ? (
          <span
            className={cn(productTheme.typography.pdpPriceOffClass, themeFonts.sans.className)}
            style={{ backgroundColor: productTheme.ink }}
          >
            {discountPercent}
            {productMessages.percentOff}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          productTheme.typography.pdpMetaClass,
          'font-normal',
          themeFonts.sans.className,
        )}
        style={{ color: productTheme.ink }}
      >
        {productMessages.inclusiveOfTaxes}
      </p>
    </div>
  );
}
