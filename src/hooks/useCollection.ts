'use client';

import { useCallback, useMemo, useState } from 'react';

import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import { getCollectionProducts } from '@/services/collection.service';
import type { Collection } from '@/types/collection';
import type { Product, ProductListResponse } from '@/types/product';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

export interface CollectionInitialData {
  collection: Collection;
  productsPages: ProductListResponse[];
  productsPageSize: number;
  loadedPageCount: number;
  hasMoreProducts: boolean;
  filters: ProductFilters;
  sort: ProductSortOption;
  filterGroups: ProductFilterGroup[];
}

interface UseCollectionOptions {
  initialData: CollectionInitialData;
}

function dedupeProducts(pages: ProductListResponse[]): Product[] {
  const productIds = new Set<string>();

  return pages
    .flatMap((page) => page.items)
    .filter((product) => {
      if (productIds.has(product.id)) {
        return false;
      }

      productIds.add(product.id);
      return true;
    });
}

function mergeProductPages(
  existingPages: ProductListResponse[],
  incomingPage: ProductListResponse,
): ProductListResponse[] {
  const pagesByNumber = new Map<number, ProductListResponse>();

  for (const page of existingPages) {
    pagesByNumber.set(page.page, page);
  }

  pagesByNumber.set(incomingPage.page, incomingPage);

  return Array.from(pagesByNumber.values()).sort((left, right) => left.page - right.page);
}

/**
 * Collection listing state — SSR seeds page 1; further pages fetch client-side.
 * Filter/sort changes remount callers via `key={serialize…}` so seed state resets without an effect.
 */
export function useCollection(
  handle: string,
  { initialData }: UseCollectionOptions,
): {
  collection: Collection;
  products: Product[];
  filterGroups: ProductFilterGroup[];
  offers: string[];
  hasMoreProducts: boolean;
  isLoadingMoreProducts: boolean;
  loadedPageCount: number;
  loadMoreProducts: () => Promise<void>;
} {
  const [accumulatedPages, setAccumulatedPages] = useState(initialData.productsPages);
  const [hasMoreProducts, setHasMoreProducts] = useState(initialData.hasMoreProducts);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);

  const products = useMemo(() => dedupeProducts(accumulatedPages), [accumulatedPages]);

  const filterGroups = useMemo(
    () =>
      initialData.filterGroups.length > 0
        ? initialData.filterGroups
        : (accumulatedPages[0]?.filterGroups ?? []),
    [accumulatedPages, initialData.filterGroups],
  );

  const offers = useMemo(() => {
    const listOffers = accumulatedPages.flatMap((page) => page.offers ?? []);

    return Array.from(new Set(listOffers.map((offer) => offer.trim()).filter(Boolean)));
  }, [accumulatedPages]);

  const loadedPageCount =
    accumulatedPages.length > 0 ? Math.max(...accumulatedPages.map((page) => page.page)) : 0;

  const latestPage = accumulatedPages[accumulatedPages.length - 1];

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || isLoadingMoreProducts || !latestPage) {
      return;
    }

    setIsLoadingMoreProducts(true);

    try {
      const nextPageNumber = loadedPageCount + 1;
      const nextPage = await getCollectionProducts(handle, {
        page: nextPageNumber,
        ...(latestPage.nextCursor ? { cursor: latestPage.nextCursor } : {}),
        limit: initialData.productsPageSize,
        sortBy: initialData.sort,
        filters: initialData.filters,
        filterGroups,
      });

      // Stamp the requested page — some APIs omit/reset `page`, which would replace page 1.
      setAccumulatedPages((previousPages) =>
        mergeProductPages(previousPages, { ...nextPage, page: nextPageNumber }),
      );
      setHasMoreProducts(collectionPageHasMore(nextPage));
    } catch {
      setHasMoreProducts(false);
    } finally {
      setIsLoadingMoreProducts(false);
    }
  }, [
    filterGroups,
    handle,
    hasMoreProducts,
    initialData.filters,
    initialData.productsPageSize,
    initialData.sort,
    isLoadingMoreProducts,
    latestPage,
    loadedPageCount,
  ]);

  return {
    collection: initialData.collection,
    products,
    filterGroups,
    offers,
    hasMoreProducts,
    isLoadingMoreProducts,
    loadedPageCount,
    loadMoreProducts,
  };
}
