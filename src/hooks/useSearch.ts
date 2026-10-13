'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import { SEARCH_LOAD_MORE_BATCH_SIZE } from '@/components/search/search-constants';
import { countIntentMatches, rankSearchResults } from '@/lib/search/rank-search-results';
import { parseSearchIntent } from '@/lib/search/search-intent';
import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import { fetchSearchProductsBatch } from '@/lib/utils/search-product-batch';
import { searchProductsList } from '@/services/search.service';
import type { Product, ProductListResponse } from '@/types/product';
import {
  countActiveFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';
import type { SearchResultsData } from '@/types/search';

interface UseSearchOptions {
  searchResults?: SearchResultsData | null;
  /** URL query when SSR data is still streaming or unavailable. */
  pageQuery?: string;
}

export interface SearchInitialData {
  query: string;
  productsPages: ProductListResponse[];
  productsPageSize: number;
  loadedPageCount: number;
  hasMoreProducts: boolean;
  filters: ProductFilters;
  sort: ProductSortOption;
  filterGroups: ProductFilterGroup[];
  totalResults: number;
}

interface LoadMoreSessionState {
  sessionKey: string;
  pages: ProductListResponse[];
  hasMoreProducts: boolean;
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
  incomingPages: ProductListResponse[],
): ProductListResponse[] {
  const pagesByNumber = new Map<number, ProductListResponse>();

  for (const page of existingPages) {
    pagesByNumber.set(page.page, page);
  }

  for (const page of incomingPages) {
    pagesByNumber.set(page.page, page);
  }

  return Array.from(pagesByNumber.values()).sort((left, right) => left.page - right.page);
}

/** Stable key so client load-more pages reset when the URL search session changes. */
function getSearchSessionKey(
  searchResults: SearchResultsData | null | undefined,
  pageQuery: string,
): string {
  if (!searchResults) {
    return `pending:${pageQuery}`;
  }

  return `${searchResults.query}:${searchResults.sort}:${JSON.stringify(searchResults.filters)}`;
}

export function useSearch({ searchResults, pageQuery = '' }: UseSearchOptions = {}) {
  const searchSessionKey = getSearchSessionKey(searchResults, pageQuery);
  const [loadMoreSession, setLoadMoreSession] = useState<LoadMoreSessionState | null>(null);
  const [isLoadingMoreProducts, setIsLoadingMoreProducts] = useState(false);
  const loadMoreInFlightRef = useRef(false);

  const activeLoadMore = loadMoreSession?.sessionKey === searchSessionKey ? loadMoreSession : null;

  const accumulatedPages = useMemo(() => {
    const pages = searchResults?.productsPages ?? [];

    return mergeProductPages(pages, activeLoadMore?.pages ?? []);
  }, [activeLoadMore?.pages, searchResults?.productsPages]);

  const products = useMemo(() => {
    const intent = parseSearchIntent(searchResults?.query ?? pageQuery);
    const rankedPages = accumulatedPages.map((page) => ({
      ...page,
      items: rankSearchResults(page.items, intent, { keepUnmatched: true }),
    }));
    const ordered = dedupeProducts(rankedPages);

    if (countIntentMatches(ordered, intent) === 0) {
      return [];
    }

    return ordered;
  }, [accumulatedPages, pageQuery, searchResults?.query]);

  const filterGroups = useMemo(
    () =>
      searchResults?.filterGroups && searchResults.filterGroups.length > 0
        ? searchResults.filterGroups
        : (accumulatedPages[0]?.filterGroups ?? []),
    [accumulatedPages, searchResults],
  );

  const offers = useMemo(() => {
    const listOffers = accumulatedPages.flatMap((page) => page.offers ?? []);

    return Array.from(new Set(listOffers.map((offer) => offer.trim()).filter(Boolean)));
  }, [accumulatedPages]);

  const loadedPageCount =
    accumulatedPages.length > 0 ? Math.max(...accumulatedPages.map((page) => page.page)) : 0;

  const latestPage = accumulatedPages[accumulatedPages.length - 1];
  const nextCursor = latestPage?.nextCursor;
  const hasMoreProducts =
    activeLoadMore?.hasMoreProducts ?? searchResults?.hasMoreProducts ?? false;

  const loadMoreProducts = useCallback(async () => {
    if (!searchResults || !nextCursor || !hasMoreProducts || loadMoreInFlightRef.current) {
      return;
    }

    loadMoreInFlightRef.current = true;
    setIsLoadingMoreProducts(true);
    const requestedCursor = nextCursor;

    try {
      const intent = parseSearchIntent(searchResults.query);
      const pages = await fetchSearchProductsBatch(
        (params) =>
          searchProductsList({
            query: params.query,
            ...(params.cursor ? { cursor: params.cursor } : {}),
            limit: params.limit,
            sortBy: params.sortBy,
            filters: params.filters,
            filterGroups: params.filterGroups,
            ...(countActiveFilters(searchResults.filters) === 0 && intent.productType
              ? { productType: intent.productType }
              : {}),
          }),
        {
          query: intent.apiQuery,
          sort: searchResults.sort,
          filters: searchResults.filters,
          filterGroups,
          productsPageSize: searchResults.productsPageSize,
          startCursor: requestedCursor,
          startPageNumber: loadedPageCount + 1,
        },
        SEARCH_LOAD_MORE_BATCH_SIZE,
      );

      if (pages.length === 0) {
        setLoadMoreSession({
          sessionKey: searchSessionKey,
          pages: activeLoadMore?.pages ?? [],
          hasMoreProducts: false,
        });
        return;
      }

      const latestBatchPage = pages[pages.length - 1];
      const cursorAdvanced = Boolean(
        latestBatchPage?.nextCursor && latestBatchPage.nextCursor !== requestedCursor,
      );

      setLoadMoreSession({
        sessionKey: searchSessionKey,
        pages: mergeProductPages(activeLoadMore?.pages ?? [], pages),
        hasMoreProducts: Boolean(
          latestBatchPage && collectionPageHasMore(latestBatchPage) && cursorAdvanced,
        ),
      });
    } catch {
      setLoadMoreSession({
        sessionKey: searchSessionKey,
        pages: activeLoadMore?.pages ?? [],
        hasMoreProducts: false,
      });
    } finally {
      loadMoreInFlightRef.current = false;
      setIsLoadingMoreProducts(false);
    }
  }, [
    activeLoadMore,
    filterGroups,
    hasMoreProducts,
    loadedPageCount,
    nextCursor,
    searchResults,
    searchSessionKey,
  ]);

  return {
    query: searchResults?.query ?? pageQuery,
    products,
    filterGroups,
    offers,
    hasMoreProducts,
    isLoadingMoreProducts,
    loadedPageCount,
    loadMoreProducts,
    totalResults: searchResults?.totalResults ?? 0,
  };
}
