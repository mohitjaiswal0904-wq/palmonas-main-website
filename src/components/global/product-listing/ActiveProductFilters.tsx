'use client';

import {
  PRODUCT_FILTER_CLEAR_ALL_CLASS,
  PRODUCT_FILTER_TEXT_CLASS,
} from '@/components/global/product-listing/product-listing-classes';
import { useProductListingControls } from '@/hooks/useProductListingControls';
import { cn } from '@/lib/utils/cn';
import { getPriceFilterOptionLabel } from '@/lib/utils/product-filters';

export function ActiveProductFilters() {
  const { filterGroups, filters, toggleFilter, clearFilters, activeFilterCount } =
    useProductListingControls();

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <section className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      <span className={PRODUCT_FILTER_TEXT_CLASS}>Active filters:</span>
      {filterGroups.flatMap((group) =>
        (filters[group.id] ?? []).map((optionId) => {
          const label = getPriceFilterOptionLabel(group, optionId);

          if (!label) {
            return null;
          }

          return (
            <button
              key={`${group.id}-${optionId}`}
              type="button"
              className={cn(
                PRODUCT_FILTER_TEXT_CLASS,
                'border-palmonas-border rounded-full border bg-white px-3 py-1',
              )}
              onClick={() => toggleFilter(group.id, optionId)}
              aria-label={`Remove ${label} filter`}
            >
              {label} ×
            </button>
          );
        }),
      )}
      <button
        type="button"
        className={cn(PRODUCT_FILTER_CLEAR_ALL_CLASS, 'shrink-0')}
        onClick={clearFilters}
        aria-label="Clear all filters"
      >
        Clear All
      </button>
    </section>
  );
}
