import type { CSSProperties } from 'react';

import { OfferPercentStarIcon } from '@/components/icons/OfferPercentStarIcon';
import { productConfig, productMessages, productTheme } from '@/config/product/product.config';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';

interface ProductCardOfferPromoProps {
  primaryText: string;
  moreOffersLabel: string | null;
  effectivePrice: number | null;
  textClass: string;
}

/**
 * Listing-card offer row (Figma 3896:45125) — vertical text carousel between the green line and gold pill.
 */
export function ProductCardOfferPromo({
  primaryText,
  moreOffersLabel,
  effectivePrice,
  textClass,
}: ProductCardOfferPromoProps) {
  const original = (
    <p className={textClass} style={{ color: productTheme.cardOfferPromo }}>
      {primaryText}
      {moreOffersLabel ? (
        <>
          {' '}
          <span className="font-normal" style={{ color: productTheme.cardOfferMore }}>
            {moreOffersLabel}
          </span>
        </>
      ) : null}
    </p>
  );

  if (effectivePrice === null) {
    return original;
  }

  const formattedPrice = formatPrice(effectivePrice);
  const cycleLabel = `${primaryText}${moreOffersLabel ? ` ${moreOffersLabel}` : ''}. ${productMessages.getItForPrefix}${formattedPrice}${productMessages.getItForSuffix}`;
  const trackStyle: CSSProperties & {
    '--card-offer-cycle-ms': string;
    '--card-offer-pill-border': string;
    '--card-offer-pill-shadow': string;
  } = {
    '--card-offer-cycle-ms': `${productConfig.timing.cardOfferCycleMs}ms`,
    '--card-offer-pill-border': productTheme.cardOfferCycle.pillBorder,
    '--card-offer-pill-shadow': productTheme.cardOfferCycle.pillShadow,
  };

  return (
    <div
      className={productTheme.cardOfferCycle.trackClass}
      style={trackStyle}
      role="status"
      aria-label={cycleLabel}
    >
      <div className={productTheme.cardOfferCycle.originalClass} aria-hidden="true">
        {original}
      </div>
      <p
        className={productTheme.cardOfferCycle.pillClass}
        style={{
          backgroundImage: productTheme.cardOfferCycle.pillGradient,
        }}
        aria-hidden="true"
      >
        <OfferPercentStarIcon />
        <span className={cn(productTheme.cardOfferCycle.copyClass)}>
          <span style={{ color: productTheme.cardOfferCycle.copyMuted }}>
            {productMessages.getItForPrefix}
          </span>
          <span
            className="font-bold tracking-[0.08px]"
            style={{ color: productTheme.cardOfferCycle.copyPrice }}
          >
            {formattedPrice}
          </span>
          <span style={{ color: productTheme.cardOfferCycle.copyMuted }}>
            {productMessages.getItForSuffix}
          </span>
        </span>
      </p>
    </div>
  );
}
