'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import { MobileFilterSortBar } from '@/components/global/product-listing/MobileFilterSortBar';
import { ProductFilterSidebar } from '@/components/global/product-listing/ProductFilterSidebar';
import { ProductGrid } from '@/components/global/product-listing/ProductGrid';
import { ProductGridSkeleton } from '@/components/global/product-listing/ProductGridSkeleton';
import {
  ProductListingToolbar,
  type CollectionOfferFilterState,
} from '@/components/global/product-listing/ProductListingToolbar';
import {
  PRODUCT_FILTER_DESKTOP_TITLE_CLASS,
  PRODUCT_FILTER_TEXT_CLASS,
  PRODUCT_LISTING_STICKY_PAD_CLASS,
} from '@/components/global/product-listing/product-listing-classes';
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { useSiteHeaderStickyOffset } from '@/hooks/layout/useSiteHeaderStickyOffset';
import {
  ProductListingProvider,
  useProductListingControls,
} from '@/hooks/useProductListingControls';
import { cn } from '@/lib/utils/cn';
import { getDesktopFilterGroups } from '@/lib/utils/product-filters';
import { scrollProductListingIntoView } from '@/lib/utils/product-listing-scroll';
import type { Product } from '@/types/product';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

interface ProductListingLayoutProps {
  products: Product[];
  filterGroups?: ProductFilterGroup[];
  initialSort?: ProductSortOption;
  filters?: ProductFilters;
  sort?: ProductSortOption;
  onFiltersChange?: (filters: ProductFilters) => void;
  onSortChange?: (sort: ProductSortOption) => void;
  serverFiltered?: boolean;
  isRefetchingProducts?: boolean;
  offers?: string[];
  offerFilter?: CollectionOfferFilterState;
  hasMoreProducts?: boolean;
  isLoadingMoreProducts?: boolean;
  onLoadMoreProducts?: () => void;
  loadMoreTriggerAfterIndex?: number;
  loadMoreTriggerResetKey?: number;
  noFiltersMessage?: string;
  productGridClassName?: string;
  layoutClassName?: string;
  /** Collection handle for New Arrivals promo fallback on product cards. */
  collectionHandle?: string;
}

interface ProductInfiniteScrollTriggerProps {
  hasMoreProducts: boolean;
  isLoadingMoreProducts: boolean;
  onLoadMoreProducts?: () => void;
  resetKey?: number;
}

function ProductInfiniteScrollTrigger({
  hasMoreProducts,
  isLoadingMoreProducts,
  onLoadMoreProducts,
  resetKey = 0,
}: ProductInfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredForCurrentEntryRef = useRef(false);
  const isLoadingMoreProductsRef = useRef(isLoadingMoreProducts);

  useEffect(() => {
    isLoadingMoreProductsRef.current = isLoadingMoreProducts;
  }, [isLoadingMoreProducts]);

  useEffect(() => {
    hasTriggeredForCurrentEntryRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!hasMoreProducts || !onLoadMoreProducts || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          hasTriggeredForCurrentEntryRef.current = false;
          return;
        }

        if (hasTriggeredForCurrentEntryRef.current || isLoadingMoreProductsRef.current) {
          return;
        }

        hasTriggeredForCurrentEntryRef.current = true;
        onLoadMoreProducts();
      },
      { rootMargin: '0px 0px 200px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreProducts, onLoadMoreProducts, resetKey]);

  if (!hasMoreProducts) {
    return null;
  }

  return (
    <div
      ref={sentinelRef}
      className="flex min-h-px w-full justify-center py-4"
      aria-live="polite"
      aria-hidden="true"
    />
  );
}

function ProductListingLayout({
  products,
  isRefetchingProducts = false,
  offers = [],
  offerFilter,
  hasMoreProducts = false,
  isLoadingMoreProducts = false,
  onLoadMoreProducts,
  loadMoreTriggerAfterIndex,
  loadMoreTriggerResetKey = 0,
  noFiltersMessage,
  productGridClassName,
  layoutClassName,
  collectionHandle,
}: ProductListingLayoutProps) {
  const { filterGroups, filters, sort } = useProductListingControls();
  const desktopFilterGroups = useMemo(() => getDesktopFilterGroups(filterGroups), [filterGroups]);
  const hasDesktopFilters = desktopFilterGroups.length > 0;
  const listingAnchorRef = useRef<HTMLDivElement | null>(null);
  const wasRefetchingProductsRef = useRef(false);
  const previousListingQueryRef = useRef<string | null>(null);
  const headerOffset = useSiteHeaderStickyOffset();
  const headerOffsetRef = useRef(headerOffset);
  const listingQueryKey = useMemo(() => JSON.stringify({ filters, sort }), [filters, sort]);

  useEffect(() => {
    headerOffsetRef.current = headerOffset;
  }, [headerOffset]);

  // Keep listing at top as soon as a filter/sort refetch starts (before height collapses).
  useEffect(() => {
    if (isRefetchingProducts) {
      if (!wasRefetchingProductsRef.current) {
        scrollProductListingIntoView(listingAnchorRef.current, headerOffsetRef.current);
      }
      wasRefetchingProductsRef.current = true;
      return undefined;
    }

    if (!wasRefetchingProductsRef.current) {
      return undefined;
    }

    wasRefetchingProductsRef.current = false;

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;
    let settleTimer = 0;

    const scrollToListingTop = (): void => {
      if (cancelled) {
        return;
      }

      scrollProductListingIntoView(listingAnchorRef.current, headerOffsetRef.current);
    };

    outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(scrollToListingTop);
    });
    // Late layout (empty state / footer) can collapse after first paint — re-pin once.
    settleTimer = window.setTimeout(scrollToListingTop, 120);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
      window.clearTimeout(settleTimer);
    };
  }, [isRefetchingProducts]);

  // URL filters/sort landed — scroll again after layout (covers empty / few products).
  // Only when the query actually changed while mounted: comparing against the previous key
  // (rather than a one-shot "has mounted" flag) also skips <Activity> re-show, which replays
  // effects with unchanged deps when the router returns to a cached collection. Scrolling
  // there would pin the grid to the top and hide the collection banner.
  useEffect(() => {
    const previousListingQuery = previousListingQueryRef.current;
    previousListingQueryRef.current = listingQueryKey;

    if (previousListingQuery === null || previousListingQuery === listingQueryKey) {
      return undefined;
    }

    let cancelled = false;
    let outerFrame = 0;
    let innerFrame = 0;
    let settleTimer = 0;

    const scrollToListingTop = (): void => {
      if (cancelled) {
        return;
      }

      scrollProductListingIntoView(listingAnchorRef.current, headerOffsetRef.current);
    };

    scrollToListingTop();
    outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(scrollToListingTop);
    });
    settleTimer = window.setTimeout(scrollToListingTop, 120);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
      window.clearTimeout(settleTimer);
    };
  }, [listingQueryKey]);

  return (
    <>
      <div
        ref={listingAnchorRef}
        className={cn('laptop:mt-10 laptop:flex laptop:flex-col', layoutClassName)}
        style={{ scrollMarginTop: headerOffset }}
      >
        <div className="laptop:flex laptop:min-w-0">
          {hasDesktopFilters ? (
            <div
              className={cn(
                'laptop:sticky laptop:block laptop:w-[20vw] laptop:shrink-0 laptop:self-start laptop:overflow-y-auto hidden bg-white',
                PRODUCT_LISTING_STICKY_PAD_CLASS,
              )}
              data-testid="product-listing-filters"
              style={{
                top: headerOffset,
                maxHeight: `calc(100dvh - ${headerOffset}px)`,
              }}
            >
              <div className="laptop:flex laptop:min-h-10 laptop:items-center laptop:pb-5">
                <h2 className={PRODUCT_FILTER_DESKTOP_TITLE_CLASS}>Filters</h2>
              </div>
              <ProductFilterSidebar className="w-full" showTitle={false} />
            </div>
          ) : null}

          <div className="laptop:flex-1 relative min-w-0">
            {/* White sticky pad keeps cards from showing through under the header. */}
            <div
              className={cn(
                'laptop:sticky laptop:z-20 laptop:flex laptop:min-h-10 laptop:items-center laptop:pb-5 hidden bg-white',
                PRODUCT_LISTING_STICKY_PAD_CLASS,
              )}
              data-testid="product-listing-toolbar"
              style={{ top: headerOffset }}
            >
              <ProductListingToolbar
                offers={offers}
                offerFilter={offerFilter}
                noFiltersMessage={!hasDesktopFilters ? noFiltersMessage : undefined}
                className="laptop:flex laptop:min-w-0 laptop:flex-1 hidden"
              />
            </div>
            {!hasDesktopFilters && noFiltersMessage ? (
              <p className={cn(PRODUCT_FILTER_TEXT_CLASS, 'laptop:hidden py-4')}>
                {noFiltersMessage}
              </p>
            ) : null}
            {isRefetchingProducts ? (
              <div className="absolute inset-0 z-10 bg-white" aria-live="polite" aria-busy="true">
                <ProductGridSkeleton className={cn('min-h-full', productGridClassName)} />
              </div>
            ) : null}
            <div aria-hidden={isRefetchingProducts}>
              <ProductGrid
                className={cn(isRefetchingProducts && 'opacity-0', productGridClassName)}
                products={products}
                collectionHandle={collectionHandle}
                loadMoreTriggerAfterIndex={loadMoreTriggerAfterIndex}
                renderLoadMoreTrigger={() => (
                  <ProductInfiniteScrollTrigger
                    hasMoreProducts={hasMoreProducts}
                    isLoadingMoreProducts={isLoadingMoreProducts}
                    onLoadMoreProducts={onLoadMoreProducts}
                    resetKey={loadMoreTriggerResetKey}
                  />
                )}
                trailingContent={
                  isLoadingMoreProducts ? (
                    <>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <ProductCardSkeleton key={`loading-more-product-skeleton-${index}`} />
                      ))}
                    </>
                  ) : null
                }
              />
            </div>
          </div>
        </div>
      </div>
      <MobileFilterSortBar />
    </>
  );
}

interface ProductListingControlsProps extends ProductListingLayoutProps {
  children?: ReactNode;
}

export function ProductListingControls({
  products,
  filterGroups,
  initialSort,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  isRefetchingProducts,
  offers,
  offerFilter,
  hasMoreProducts,
  isLoadingMoreProducts,
  onLoadMoreProducts,
  loadMoreTriggerAfterIndex,
  loadMoreTriggerResetKey,
  noFiltersMessage,
  productGridClassName,
  layoutClassName,
  collectionHandle,
  children,
}: ProductListingControlsProps) {
  return (
    <ProductListingProvider
      filterGroups={filterGroups}
      initialSort={initialSort}
      filters={filters}
      sort={sort}
      onFiltersChange={onFiltersChange}
      onSortChange={onSortChange}
    >
      {children ?? (
        <ProductListingLayout
          products={products}
          isRefetchingProducts={isRefetchingProducts}
          offers={offers}
          offerFilter={offerFilter}
          hasMoreProducts={hasMoreProducts}
          isLoadingMoreProducts={isLoadingMoreProducts}
          onLoadMoreProducts={onLoadMoreProducts}
          loadMoreTriggerAfterIndex={loadMoreTriggerAfterIndex}
          loadMoreTriggerResetKey={loadMoreTriggerResetKey}
          noFiltersMessage={noFiltersMessage}
          productGridClassName={productGridClassName}
          layoutClassName={layoutClassName}
          collectionHandle={collectionHandle}
        />
      )}
    </ProductListingProvider>
  );
}

export { ProductGrid } from '@/components/global/product-listing/ProductGrid';
export { ProductCard } from '@/components/product/ProductCard';
