'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { ProductListingControls } from '@/components/global/product-listing';
import { ShraddhasFavouriteCategoryPills } from '@/components/shraddhas-favourite/ShraddhasFavouriteCategoryPills';
import { ShraddhasFavouriteHero } from '@/components/shraddhas-favourite/ShraddhasFavouriteHero';
import { ShraddhasFavouriteSectionHeading } from '@/components/shraddhas-favourite/ShraddhasFavouriteSectionHeading';
import { ShraddhasFavouriteShopByLook } from '@/components/shraddhas-favourite/ShraddhasFavouriteShopByLook';
import { ShraddhasFavouriteSignatureStyles } from '@/components/shraddhas-favourite/ShraddhasFavouriteSignatureStyles';
import { ShraddhasFavouriteStoryTimeline } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryTimeline';
import {
  SHRADDHAS_FAVOURITE_BESTSELLERS_HEADING_CLASS,
  SHRADDHAS_FAVOURITE_BESTSELLERS_SECTION_ID,
  SHRADDHAS_FAVOURITE_PAGE_ROOT_CLASS,
} from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import { type CollectionInitialData, useCollection } from '@/hooks/useCollection';
import { getCollectionLoadMoreTriggerIndex } from '@/lib/utils/collection-pagination';
import { filtersMatchQuery } from '@/lib/utils/collection-search-params';
import { buildShraddhasFavouritePagePath } from '@/lib/utils/shraddhas-favourite-search-params';
import type { Product } from '@/types/product';
import {
  createEmptyProductFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

interface ShraddhasFavouritePageContentProps {
  handle: string;
  initialFilters: ProductFilters;
  initialSort: ProductSortOption;
  initialData: CollectionInitialData;
  signatureProducts: Product[];
  lookProducts: Product[];
}

interface PendingShraddhasFavouriteNavigation {
  filters: ProductFilters;
  sort: ProductSortOption;
}

function mergeFiltersForQuery(
  filters: ProductFilters,
  filterGroups: ProductFilterGroup[] | undefined,
): ProductFilters {
  if (!filterGroups?.length) {
    return filters;
  }

  const emptyFilters = createEmptyProductFilters(filterGroups);

  return filterGroups.reduce<ProductFilters>((merged, group) => {
    merged[group.id] = filters[group.id] ?? emptyFilters[group.id] ?? [];
    return merged;
  }, {});
}

function stripLegacyPageParam(): void {
  const url = new URL(window.location.href);

  if (!url.searchParams.has('page')) {
    return;
  }

  url.searchParams.delete('page');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function ShraddhasFavouritePageContent({
  handle,
  initialFilters,
  initialSort,
  initialData,
  signatureProducts,
  lookProducts,
}: ShraddhasFavouritePageContentProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingShraddhasFavouriteNavigation | null>(null);

  const {
    collection,
    products,
    filterGroups,
    offers: productListOffers,
    hasMoreProducts,
    isLoadingMoreProducts,
    loadedPageCount,
    loadMoreProducts,
  } = useCollection(handle, { initialData });

  useEffect(() => {
    stripLegacyPageParam();
  }, []);

  const filtersForUi = useMemo(
    () => mergeFiltersForQuery(initialFilters, filterGroups),
    [filterGroups, initialFilters],
  );

  const offers = useMemo(() => {
    const mergedOffers = [...(collection.offers ?? []), ...productListOffers];

    return Array.from(new Set(mergedOffers.map((offer) => offer.trim()).filter(Boolean)));
  }, [collection.offers, productListOffers]);

  const loadMoreTriggerAfterIndex = useMemo(
    () =>
      getCollectionLoadMoreTriggerIndex(
        products.length,
        loadedPageCount,
        initialData.productsPageSize,
      ),
    [initialData.productsPageSize, loadedPageCount, products.length],
  );

  const activePendingNavigation = isNavigating ? pendingNavigation : null;
  const isRefetchingProducts =
    activePendingNavigation != null &&
    (!filtersMatchQuery(activePendingNavigation.filters, initialFilters) ||
      activePendingNavigation.sort !== initialSort);

  const navigateWithQuery = useCallback(
    (nextFilters: ProductFilters, nextSort: ProductSortOption) => {
      const path = buildShraddhasFavouritePagePath(nextFilters, nextSort, 1);
      setPendingNavigation({
        filters: nextFilters,
        sort: nextSort,
      });

      startTransition(() => {
        router.push(path, { scroll: false });
      });
    },
    [router],
  );

  const onLoadMoreProducts = useCallback(() => {
    void loadMoreProducts();
  }, [loadMoreProducts]);

  return (
    <main className={SHRADDHAS_FAVOURITE_PAGE_ROOT_CLASS}>
      <ShraddhasFavouriteHero />
      <ShraddhasFavouriteCategoryPills />
      <ShraddhasFavouriteSignatureStyles products={signatureProducts} />
      <ShraddhasFavouriteShopByLook products={lookProducts} />
      <ShraddhasFavouriteStoryTimeline />

      <section
        id={SHRADDHAS_FAVOURITE_BESTSELLERS_SECTION_ID}
        aria-label="Bestsellers"
        className="scroll-mt-24"
      >
        <div className={SHRADDHAS_FAVOURITE_BESTSELLERS_HEADING_CLASS}>
          <ShraddhasFavouriteSectionHeading title="Bestsellers" />
        </div>

        <div className="laptop:px-5 w-full px-0">
          <ProductListingControls
            products={products}
            filterGroups={filterGroups}
            filters={filtersForUi}
            sort={initialSort}
            onFiltersChange={(nextFilters) => navigateWithQuery(nextFilters, initialSort)}
            onSortChange={(nextSort) => navigateWithQuery(initialFilters, nextSort)}
            serverFiltered
            offers={offers}
            isRefetchingProducts={isRefetchingProducts}
            hasMoreProducts={hasMoreProducts && !isLoadingMoreProducts}
            isLoadingMoreProducts={isLoadingMoreProducts}
            onLoadMoreProducts={onLoadMoreProducts}
            loadMoreTriggerAfterIndex={loadMoreTriggerAfterIndex}
            loadMoreTriggerResetKey={loadedPageCount}
            layoutClassName="laptop:mt-6"
            productGridClassName="mt-6 tab:mt-0"
          />
        </div>
      </section>
    </main>
  );
}
