'use client';

import { productListingMessages } from '@/config/product-listing/product-listing.config';
import { useProductListingControls } from '@/hooks/useProductListingControls';

/**
 * Empty product-grid placeholder with clear-filters CTA.
 */
export function ProductGridEmptyState() {
  const { clearFilters } = useProductListingControls();

  return (
    <div
      className="laptop:px-5 flex flex-col items-start gap-6 px-4 py-10"
      role="status"
      aria-label={productListingMessages.a11y.emptyListing}
    >
      <h2 className="text-palmonas-ink max-w-md text-lg font-semibold tracking-tight">
        {productListingMessages.emptyTitle}
      </h2>
      <button
        type="button"
        onClick={clearFilters}
        className="rounded-palmonas-md bg-palmonas-ink text-palmonas-surface hover:bg-palmonas-muted inline-flex h-11 items-center justify-center px-5 text-sm font-medium transition-colors"
        aria-label={productListingMessages.a11y.clearFilters}
      >
        {productListingMessages.clearFilters}
      </button>
    </div>
  );
}
