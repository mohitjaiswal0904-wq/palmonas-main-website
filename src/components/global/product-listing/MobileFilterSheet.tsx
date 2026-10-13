'use client';

import { useCallback, useRef, useState } from 'react';

import { ProductFilterSidebar } from '@/components/global/product-listing/ProductFilterSidebar';
import {
  ProductListingProvider,
  useProductListingControls,
} from '@/hooks/useProductListingControls';
import { withFilterApplyCommit } from '@/lib/utils/filter-apply-commit';
import type { ProductFilters } from '@/types/product-listing';

interface MobileFilterSheetProps {
  onClose: () => void;
}

export function MobileFilterSheet({ onClose }: MobileFilterSheetProps) {
  const { filters: appliedFilters, filterGroups, commitFilters } = useProductListingControls();
  // Snapshot the groups the sheet opened with: a background listing refresh that resolves
  // to zero groups would otherwise leave an empty white sheet with no way out (PW-634).
  const [sheetFilterGroups] = useState(filterGroups);
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const draftFiltersRef = useRef(draftFilters);

  /** Keep a synchronous copy so Apply can read edits committed during its own click. */
  const updateDraftFilters = useCallback((nextFilters: ProductFilters) => {
    draftFiltersRef.current = nextFilters;
    setDraftFilters(nextFilters);
  }, []);

  const handleApply = () => {
    // Blur commits a manually typed price before we read the draft, so one Apply tap is
    // enough (PW-622). Suppress the equal-price toast — validation is input-only (PW-623).
    withFilterApplyCommit(() => {
      const active = document.activeElement;

      if (active instanceof HTMLElement) {
        active.blur();
      }
    });
    commitFilters(draftFiltersRef.current);
    onClose();
  };

  return (
    <ProductListingProvider
      filterGroups={sheetFilterGroups}
      filters={draftFilters}
      onFiltersChange={updateDraftFilters}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <ProductFilterSidebar variant="sheet" onApply={handleApply} onClose={onClose} />
      </div>
    </ProductListingProvider>
  );
}
