'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { EmilyInParisSectionHeading } from '@/components/emily-in-paris/EmilyInParisSectionHeading';
import {
  EMILY_IN_PARIS_LISTING_HEADING_CLASS,
  EMILY_IN_PARIS_LISTING_SECTION_ID,
} from '@/components/emily-in-paris/emily-in-paris-constants';
import { ProductListingControls } from '@/components/global/product-listing';
import { type CollectionInitialData, useCollection } from '@/hooks/useCollection';
import { getCollectionLoadMoreTriggerIndex } from '@/lib/utils/collection-pagination';
import { filtersMatchQuery } from '@/lib/utils/collection-search-params';
import { buildEmilyInParisPagePath } from '@/lib/utils/emily-in-paris-search-params';
import {
  createEmptyProductFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

interface EmilyInParisPageContentProps {
  handle: string;
  initialFilters: ProductFilters;
  initialSort: ProductSortOption;
  initialData: CollectionInitialData;
}

interface PendingEmilyInParisNavigation {
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

export function EmilyInParisPageContent({
  handle,
  initialFilters,
  initialSort,
  initialData,
}: EmilyInParisPageContentProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [pendingNavigation, setPendingNavigation] = useState<PendingEmilyInParisNavigation | null>(
    null,
  );

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
      const path = buildEmilyInParisPagePath(nextFilters, nextSort, 1);
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
    <section
      id={EMILY_IN_PARIS_LISTING_SECTION_ID}
      aria-label="Emily in Paris collection"
      className="scroll-mt-24"
    >
      <div className={EMILY_IN_PARIS_LISTING_HEADING_CLASS}>
        <EmilyInParisSectionHeading title="Emily In Paris X Palmonas" />
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
  );
}
