'use client';

import { productListingMessages } from '@/config/product-listing/product-listing.config';
import { productTokens } from '@/config/theme/product.tokens';
import {
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';

interface CollectionOfferFilterChipsProps {
  offers: string[];
  selectedOffer: string | null;
  onSelect: (offer: string | null) => void;
  className?: string;
}

/**
 * Horizontal offer chips shown under the collection banner (e.g. Buy 1 Get 1).
 */
export function CollectionOfferFilterChips({
  offers,
  selectedOffer,
  onSelect,
  className,
}: CollectionOfferFilterChipsProps) {
  if (offers.length === 0) {
    return null;
  }

  const chipClass = (isSelected: boolean): string =>
    cn(
      'inline-flex shrink-0 items-center',
      productTokens.offerFilterChip.baseClass,
      isSelected
        ? productTokens.offerFilterChip.selectedClass
        : productTokens.offerFilterChip.idleClass,
    );

  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto overflow-y-visible px-4 py-3',
        HORIZONTAL_SCROLL_PASS_VERTICAL,
        HORIZONTAL_SCROLLBAR_HIDDEN,
        className,
      )}
      role="toolbar"
      aria-label={productListingMessages.a11y.offerFilters}
    >
      <div className="flex w-max min-w-full items-center gap-2">
        <button
          type="button"
          aria-pressed={selectedOffer === null}
          aria-label={productListingMessages.a11y.allOffers}
          className={chipClass(selectedOffer === null)}
          onClick={() => onSelect(null)}
        >
          {productListingMessages.labels.allOffers}
        </button>
        {offers.map((offer) => {
          const isSelected = selectedOffer === offer;

          return (
            <button
              key={offer}
              type="button"
              aria-pressed={isSelected}
              aria-label={offer}
              className={chipClass(isSelected)}
              onClick={() => onSelect(isSelected ? null : offer)}
            >
              {offer}
            </button>
          );
        })}
      </div>
    </div>
  );
}
