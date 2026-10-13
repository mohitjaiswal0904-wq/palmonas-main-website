'use client';

import { NamedHorizontalScrollTrack } from '@/components/analytics/NamedHorizontalScrollTrack';
import { DealsIcon } from '@/components/icons';
import { OfferItem } from '@/components/product/OfferItem';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { ProductOffer } from '@/types/product';

interface OfferBadgesProps {
  offers: ProductOffer[];
}

/** PDP deals section: heading plus horizontally scrollable offer cards. */
export function OfferBadges({ offers }: OfferBadgesProps) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section
      className={productTheme.pdpRhythm.promoClusterClass}
      aria-labelledby="product-deals-heading"
    >
      <h2
        id="product-deals-heading"
        className={cn(productTheme.dealsHeadingClass, themeFonts.sans.className)}
        style={{ color: productTheme.ink }}
      >
        <DealsIcon className="laptop:h-5 laptop:w-5 h-4 w-4 shrink-0" />
        {productMessages.deals}
      </h2>

      <NamedHorizontalScrollTrack
        eventName={analyticsCanonicalEvents.offersRailScrolled}
        sectionName="offers_rail"
        className={cn(
          'w-full min-w-0 snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-visible scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          HORIZONTAL_SCROLL_PASS_VERTICAL,
        )}
        role="region"
        ariaLabel={productMessages.a11y.scrollableOffers}
        tabIndex={0}
      >
        <ul className="flex w-max min-w-full gap-3">
          {offers.map((offer) => (
            <li key={offer.key} className="laptop:w-[24.375rem] w-[17.5rem] shrink-0 snap-start">
              <OfferItem offer={offer} />
            </li>
          ))}
        </ul>
      </NamedHorizontalScrollTrack>
    </section>
  );
}
