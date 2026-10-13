'use client';

import { CollectionOfferFilterChips } from '@/components/collection/CollectionOfferFilterChips';
import { ActiveProductFilters } from '@/components/global/product-listing/ActiveProductFilters';
import { CollectionOfferPills } from '@/components/global/product-listing/CollectionOfferPills';
import { ProductSortSelect } from '@/components/global/product-listing/ProductSortSelect';
import { PRODUCT_FILTER_TEXT_CLASS } from '@/components/global/product-listing/product-listing-classes';
import { cn } from '@/lib/utils/cn';

export interface CollectionOfferFilterState {
  offers: string[];
  selectedOffer: string | null;
  onSelect: (offer: string | null) => void;
}

interface ProductListingToolbarProps {
  offers?: string[];
  offerFilter?: CollectionOfferFilterState;
  className?: string;
  noFiltersMessage?: string;
}

export function ProductListingToolbar({
  offers = [],
  offerFilter,
  className,
  noFiltersMessage,
}: ProductListingToolbarProps) {
  return (
    <div className={cn('flex min-h-10 items-center gap-4', className)}>
      {offerFilter ? (
        <CollectionOfferFilterChips
          offers={offerFilter.offers}
          selectedOffer={offerFilter.selectedOffer}
          onSelect={offerFilter.onSelect}
          className="min-w-0 flex-1 px-0 py-0"
        />
      ) : (
        <>
          <div className="flex min-w-0 items-center">
            {noFiltersMessage ? (
              <p className={PRODUCT_FILTER_TEXT_CLASS}>{noFiltersMessage}</p>
            ) : (
              <ActiveProductFilters />
            )}
          </div>
          <CollectionOfferPills offers={offers} className="shrink-0 justify-start" />
        </>
      )}
      <div className="ml-auto shrink-0">
        <ProductSortSelect />
      </div>
    </div>
  );
}
