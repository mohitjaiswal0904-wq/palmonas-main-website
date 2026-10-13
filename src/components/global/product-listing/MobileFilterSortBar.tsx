'use client';

import { useEffect, useState } from 'react';

import { MobileFilterSheet } from '@/components/global/product-listing/MobileFilterSheet';
import { ProductSortSelect } from '@/components/global/product-listing/ProductSortSelect';
import { useProductListingControls } from '@/hooks/useProductListingControls';
import { cn } from '@/lib/utils/cn';

type MobilePanel = 'filter' | 'sort' | null;

function FilterIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M2 3.2h12L9.5 8.1v3.6l-3 1.5V8.1L2 3.2Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M5 2.5v11M5 13.5 2.5 11M5 13.5 7.5 11M11 13.5v-11M11 2.5 8.5 5M11 2.5 13.5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

export function MobileFilterSortBar() {
  const { activeFilterCount, filterGroups } = useProductListingControls();
  const [panel, setPanel] = useState<MobilePanel>(null);
  const hasFilters = filterGroups.length > 0;

  useEffect(() => {
    document.body.style.overflow = panel ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [panel]);

  return (
    <>
      <div className="font-nunito-sans z-fixed laptop:hidden fixed inset-x-0 bottom-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.25)]">
        <div
          className={cn(
            'grid h-12 items-center',
            hasFilters ? 'grid-cols-[1fr_1px_1fr]' : 'grid-cols-1',
          )}
        >
          {hasFilters ? (
            <>
              <button
                type="button"
                className="font-nunito-sans flex h-full items-center justify-center gap-2 p-4 text-sm leading-normal font-normal text-[#151515]"
                aria-label="Open filters"
                onClick={() => setPanel('filter')}
              >
                <FilterIcon />
                <span aria-hidden="true">Filter</span>
                {activeFilterCount > 0 ? (
                  <span className="h-[7px] w-[7px] rounded-full bg-[#151515]" aria-hidden="true" />
                ) : null}
              </button>
              <span className="bg-palmonas-divider h-9 w-px" aria-hidden="true" />
            </>
          ) : null}
          <button
            type="button"
            className="font-nunito-sans flex h-full items-center justify-center gap-2 p-4 text-sm leading-normal font-normal text-[#151515]"
            aria-label="Sort products"
            onClick={() => setPanel('sort')}
          >
            <SortIcon />
            <span aria-hidden="true">Sort By</span>
          </button>
        </div>
      </div>

      {panel ? (
        <div className="z-modal laptop:hidden fixed inset-0 bg-black/40" role="presentation">
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label={panel === 'filter' ? 'Close filters' : 'Close sort options'}
            onClick={() => setPanel(null)}
          />
          <div
            className="absolute inset-x-0 bottom-0 flex h-[75dvh] max-h-[75dvh] w-full flex-col overflow-hidden rounded-t-[20px] bg-white"
            // The clipped panel must never hold a scroll offset: browsers scroll it to reveal a
            // focused option deep in a long list, which pushes the sheet out of view (PW-634).
            onScroll={(event) => {
              event.currentTarget.scrollTop = 0;
              event.currentTarget.scrollLeft = 0;
            }}
            role="dialog"
            aria-modal="true"
            aria-label={panel === 'filter' ? 'Filters' : 'Sort products'}
          >
            {panel === 'filter' ? (
              <MobileFilterSheet onClose={() => setPanel(null)} />
            ) : (
              <ProductSortSelect
                variant="sheet"
                id="mobile-product-sort"
                onClose={() => setPanel(null)}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
