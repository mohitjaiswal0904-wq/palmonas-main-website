'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useState, type UIEvent } from 'react';

import { GiftingSectionHeading } from '@/components/gifting/GiftingSectionHeading';
import { GiftingProductCarousel } from '@/components/global/product-listing/GiftingProductCarousel';
import {
  GIFTING_CATEGORY_COLLECTION_HANDLE,
  GIFTING_CATEGORY_FILTERS,
  GIFTING_CATEGORY_MESSAGES,
  GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
  GIFTING_SECTION_TITLES,
} from '@/config/gifting/gifting.config';
import { useGiftingCategoryProducts } from '@/hooks/useGiftingCategoryProducts';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { ProductListResponse } from '@/types/product';

const SCROLL_END_THRESHOLD_PX = 96;

type GiftingCategoryFilterId = (typeof GIFTING_CATEGORY_FILTERS)[number]['id'];

interface GiftingCategoryProductsSectionProps {
  /** SSR-seeded collection handle (usually All / best-sellers). */
  initialHandle?: string;
  /** First products page for `initialHandle`. */
  initialPage: ProductListResponse | null;
  pageSize?: number;
}

/**
 * Category filter pills + gifting-only product carousel.
 * Each pill switches collection handle on the client; scroll-end loads the next page.
 */
export function GiftingCategoryProductsSection({
  initialHandle = GIFTING_CATEGORY_COLLECTION_HANDLE,
  initialPage,
  pageSize = GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
}: GiftingCategoryProductsSectionProps) {
  const [activeFilterId, setActiveFilterId] = useState<GiftingCategoryFilterId>(
    GIFTING_CATEGORY_FILTERS[0].id,
  );

  const activeFilter = useMemo(
    () =>
      GIFTING_CATEGORY_FILTERS.find((filter) => filter.id === activeFilterId) ??
      GIFTING_CATEGORY_FILTERS[0],
    [activeFilterId],
  );

  const { products, hasMoreProducts, isLoading, isLoadingMoreProducts, loadMoreProducts } =
    useGiftingCategoryProducts(activeFilter.collectionHandle, {
      pageSize,
      initialHandle,
      initialPage,
    });

  const loadingMoreRef = useRef(false);

  /** Fetch next page when the horizontal rail approaches its trailing edge. */
  const handleRailScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (!hasMoreProducts || isLoadingMoreProducts || isLoading || loadingMoreRef.current) {
        return;
      }

      const rail = event.currentTarget;
      const distanceFromEnd = rail.scrollWidth - rail.scrollLeft - rail.clientWidth;

      if (distanceFromEnd > SCROLL_END_THRESHOLD_PX) {
        return;
      }

      loadingMoreRef.current = true;
      void loadMoreProducts().finally(() => {
        loadingMoreRef.current = false;
      });
    },
    [hasMoreProducts, isLoading, isLoadingMoreProducts, loadMoreProducts],
  );

  const viewAllHref = resolveCollectionPagePath(activeFilter.collectionHandle);

  return (
    <section className="tab:px-6 px-4 py-8" aria-labelledby="new-year-category-heading">
      <div className="mx-auto w-full max-w-5xl">
        <GiftingSectionHeading
          id="new-year-category-heading"
          title={GIFTING_SECTION_TITLES.newYearByCategory}
          align="center"
          className="mb-4"
        />

        <div
          className="mb-5 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Gift categories"
        >
          {GIFTING_CATEGORY_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilterId;

            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="gifting-category-products"
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm',
                  isActive
                    ? 'bg-[#EFEBE6] font-medium text-[#151515]'
                    : 'border border-[#E4E0D8] bg-white text-[#666666]',
                )}
                onClick={() => setActiveFilterId(filter.id)}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div id="gifting-category-products">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-[#666666]" aria-live="polite">
              {GIFTING_CATEGORY_MESSAGES.loadingProducts}
            </p>
          ) : (
            <GiftingProductCarousel
              products={products}
              collectionHandle={activeFilter.collectionHandle}
              ariaLabel={`${activeFilter.label} gift products`}
              className="mt-0"
              onScroll={handleRailScroll}
              aria-busy={isLoadingMoreProducts}
            />
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={viewAllHref}
            className="rounded-md border border-[#D6D6D6] px-10 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:border-[#151515]"
            aria-label={`View all ${activeFilter.label} gift products`}
          >
            {GIFTING_CATEGORY_MESSAGES.viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
