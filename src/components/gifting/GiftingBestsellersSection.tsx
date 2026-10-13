'use client';

import Link from 'next/link';
import { useCallback, useRef, type UIEvent } from 'react';

import { GiftingSectionHeading } from '@/components/gifting/GiftingSectionHeading';
import { GiftingProductCarousel } from '@/components/global/product-listing/GiftingProductCarousel';
import {
  GIFTING_BESTSELLERS,
  GIFTING_CATEGORY_MESSAGES,
  GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
} from '@/config/gifting/gifting.config';
import { useGiftingCategoryProducts } from '@/hooks/useGiftingCategoryProducts';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { ProductListResponse } from '@/types/product';

const SCROLL_END_THRESHOLD_PX = 96;

interface GiftingBestsellersSectionProps {
  initialPage: ProductListResponse | null;
  pageSize?: number;
}

/**
 * Demifine bestsellers rail — same ProductCard UI as Top Styles, different collection handle.
 */
export function GiftingBestsellersSection({
  initialPage,
  pageSize = GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
}: GiftingBestsellersSectionProps) {
  const handle = GIFTING_BESTSELLERS.collectionHandle;

  const { products, hasMoreProducts, isLoading, isLoadingMoreProducts, loadMoreProducts } =
    useGiftingCategoryProducts(handle, {
      pageSize,
      initialHandle: handle,
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

  const viewAllHref = resolveCollectionPagePath(handle);

  return (
    <section className="tab:px-6 px-4 py-8 pb-14" aria-labelledby="demifine-bestsellers-heading">
      <div className="mx-auto w-full max-w-5xl">
        <GiftingSectionHeading
          id="demifine-bestsellers-heading"
          title={GIFTING_BESTSELLERS.title}
          align="center"
          className="mb-5"
        />

        {isLoading ? (
          <p className="py-8 text-center text-sm text-[#666666]" aria-live="polite">
            {GIFTING_CATEGORY_MESSAGES.loadingProducts}
          </p>
        ) : (
          <GiftingProductCarousel
            products={products}
            collectionHandle={handle}
            ariaLabel="Demifine bestsellers"
            className="mt-0"
            onScroll={handleRailScroll}
            aria-busy={isLoadingMoreProducts}
          />
        )}

        <div className="mt-6 flex justify-center">
          <Link
            href={viewAllHref}
            className="rounded-md border border-[#D6D6D6] px-10 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:border-[#151515]"
            aria-label="View all Demifine bestsellers"
          >
            {GIFTING_BESTSELLERS.viewAllLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
