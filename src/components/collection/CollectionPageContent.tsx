'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { CollectionOfferFilterChips } from '@/components/collection/CollectionOfferFilterChips';
import { ProductListingControls } from '@/components/global/product-listing';
import { type CollectionInitialData, useCollection } from '@/hooks/useCollection';
import { getCollectionLoadMoreTriggerIndex } from '@/lib/utils/collection-pagination';
import { buildCollectionPagePath, filtersMatchQuery } from '@/lib/utils/collection-search-params';
import { productMatchesCollectionOffer } from '@/lib/utils/offer';
import {
  createEmptyProductFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

interface CollectionPageContentProps {
  handle: string;
  initialFilters: ProductFilters;
  initialSort: ProductSortOption;
  initialData: CollectionInitialData;
}

interface PendingCollectionNavigation {
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

/** Drop legacy `?page=` without triggering an RSC refetch. */
function stripLegacyPageParam(): void {
  const url = new URL(window.location.href);

  if (!url.searchParams.has('page')) {
    return;
  }

  url.searchParams.delete('page');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', next);
}

export function CollectionPageContent({
  handle,
  initialFilters,
  initialSort,
  initialData,
}: CollectionPageContentProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [pendingNavigation, setPendingNavigation] = useState<PendingCollectionNavigation | null>(
    null,
  );
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

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

  // Legacy deep links used `?page=N` to SSR pages 1..N; load-more is client-side now.
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

  const productsForListing = useMemo(() => {
    if (!selectedOffer) {
      return products;
    }

    return products.filter((product) => productMatchesCollectionOffer(product, selectedOffer));
  }, [products, selectedOffer]);

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
      const path = buildCollectionPagePath(handle, nextFilters, nextSort, 1);
      setPendingNavigation({
        filters: nextFilters,
        sort: nextSort,
      });

      startTransition(() => {
        router.push(path, { scroll: false });
      });
    },
    [handle, router],
  );

  const onLoadMoreProducts = useCallback(() => {
    void loadMoreProducts();
  }, [loadMoreProducts]);

  return (
    <main>
      <CollectionOfferFilterChips
        offers={offers}
        selectedOffer={selectedOffer}
        onSelect={setSelectedOffer}
        className="laptop:hidden"
      />
      <div className="laptop:px-5 w-full px-0">
        <ProductListingControls
          products={productsForListing}
          filterGroups={filterGroups}
          filters={filtersForUi}
          sort={initialSort}
          onFiltersChange={(nextFilters) => navigateWithQuery(nextFilters, initialSort)}
          onSortChange={(nextSort) => navigateWithQuery(initialFilters, nextSort)}
          serverFiltered
          collectionHandle={handle}
          offerFilter={{ offers, selectedOffer, onSelect: setSelectedOffer }}
          isRefetchingProducts={isRefetchingProducts}
          hasMoreProducts={hasMoreProducts && !isLoadingMoreProducts}
          isLoadingMoreProducts={isLoadingMoreProducts}
          onLoadMoreProducts={onLoadMoreProducts}
          loadMoreTriggerAfterIndex={loadMoreTriggerAfterIndex}
          loadMoreTriggerResetKey={loadedPageCount}
          layoutClassName="laptop:mt-4"
          productGridClassName="mt-0"
        />
      </div>
    </main>
  );
}
