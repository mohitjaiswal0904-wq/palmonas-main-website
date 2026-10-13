'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react';

import { ProductListingControls } from '@/components/global/product-listing';
import { HeaderSearchDropdown } from '@/components/layout/HeaderSearchDropdown';
import { SearchEmptyState } from '@/components/search/SearchEmptyState';
import { SearchMobileDiscovery } from '@/components/search/SearchMobileDiscovery';
import { SearchPopularTerms } from '@/components/search/SearchPopularTerms';
import {
  SEARCH_AUTOCOMPLETE_TERM_LIMIT,
  SEARCH_INPUT_DEBOUNCE_MS,
  SEARCH_PAGE_HERO_SECTION_CLASS,
  SEARCH_PAGE_HORIZONTAL_PADDING_CLASS,
  SEARCH_PRODUCT_GRID_CLASS,
} from '@/components/search/search-constants';
import { searchMessages } from '@/config/search/search.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import {
  getSearchDraftQuery,
  setSearchDraftQuery,
  subscribeSearchDraftQuery,
} from '@/lib/search/search-draft-query';
import { mergeIntentSuggestions, parseSearchIntent } from '@/lib/search/search-intent';
import { cn } from '@/lib/utils/cn';
import { getCollectionLoadMoreTriggerIndex } from '@/lib/utils/collection-pagination';
import { filtersMatchQuery } from '@/lib/utils/collection-search-params';
import {
  collectSearchSuggestionTerms,
  filterSearchSuggestionTerms,
} from '@/lib/utils/filter-search-suggestion-terms';
import {
  compactProductFilters,
  stripPriceFilterGroups,
  stripPriceFilters,
} from '@/lib/utils/product-filters';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { formatSearchResultCount, searchResultCountLabel } from '@/lib/utils/search-results';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';
import {
  createEmptyProductFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';
import type { SearchResultsData } from '@/types/search';
import type { SearchSuggestions } from '@/types/search-suggestions';

interface SearchPageContentProps {
  query: string;
  filters: ProductFilters;
  sort: ProductSortOption;
  searchResults?: SearchResultsData | null;
  suggestions: SearchSuggestions;
  hasLegacyPaginationParams?: boolean;
}

interface PendingSearchNavigation {
  query: string;
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

export function SearchPageContent({
  query: pageQuery,
  filters,
  sort,
  searchResults,
  suggestions,
  hasLegacyPaginationParams = false,
}: SearchPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const [pendingNavigation, setPendingNavigation] = useState<PendingSearchNavigation | null>(null);
  const hasPageParam = searchParams.has('page');
  const hasCursorParam = searchParams.has('cursor');
  const { isAuthenticated, isGuest, isLoading: isBootstrapping } = useAuth();
  const canShowRecent = isAuthenticated && !isGuest && !isBootstrapping;
  const { terms: recentTerms, isLoading: isLoadingRecent } = useSearchHistory({
    isOpen: canShowRecent,
  });
  const {
    query,
    products,
    filterGroups,
    // offers — reserved for future search offer filter chips (Buy 4 At ₹2999, BOGO, etc.)
    hasMoreProducts,
    isLoadingMoreProducts,
    loadedPageCount,
    loadMoreProducts,
    totalResults,
  } = useSearch({ searchResults, pageQuery });

  const liveSuggestions = useMemo(
    (): SearchSuggestions => ({
      ...suggestions,
      recentSearchTerms: canShowRecent ? recentTerms : [],
    }),
    [canShowRecent, recentTerms, suggestions],
  );

  const draftQuery = useSyncExternalStore(subscribeSearchDraftQuery, getSearchDraftQuery, () => '');
  const normalizedDraftQuery = normalizeSearchQuery(draftQuery);
  const showMobileTypedSuggestions =
    normalizedDraftQuery.length > 0 && normalizedDraftQuery !== normalizeSearchQuery(pageQuery);
  const debouncedDraftQuery = useDebounce(draftQuery, SEARCH_INPUT_DEBOUNCE_MS);
  const { products: productSuggestions, isLoading: isLoadingProducts } = useSearchAutocomplete(
    showMobileTypedSuggestions ? debouncedDraftQuery : '',
  );
  const matchedTerms = useMemo(() => {
    if (!showMobileTypedSuggestions) {
      return [];
    }

    const filtered = filterSearchSuggestionTerms(
      collectSearchSuggestionTerms(liveSuggestions),
      draftQuery,
    );

    return mergeIntentSuggestions(draftQuery, filtered, SEARCH_AUTOCOMPLETE_TERM_LIMIT);
  }, [draftQuery, liveSuggestions, showMobileTypedSuggestions]);

  const searchFilterGroups = useMemo(() => stripPriceFilterGroups(filterGroups), [filterGroups]);

  const filtersForUi = useMemo(
    () => mergeFiltersForQuery(filters, searchFilterGroups),
    [searchFilterGroups, filters],
  );

  const loadMoreTriggerAfterIndex = useMemo(
    () =>
      getCollectionLoadMoreTriggerIndex(
        products.length,
        loadedPageCount,
        searchResults?.productsPageSize ?? 24,
      ),
    [loadedPageCount, products.length, searchResults?.productsPageSize],
  );

  const activePendingNavigation = isNavigating ? pendingNavigation : null;
  const pendingFilterOrSortChange =
    activePendingNavigation != null &&
    (activePendingNavigation.query !== pageQuery ||
      !filtersMatchQuery(activePendingNavigation.filters, filters) ||
      activePendingNavigation.sort !== sort);
  const isRefetchingProducts = isNavigating && pendingFilterOrSortChange;

  const navigateWithQuery = useCallback(
    (
      nextQuery: string,
      nextFilters: ProductFilters,
      nextSort: ProductSortOption,
      { replace = false }: { replace?: boolean } = {},
    ) => {
      const normalizedFilters = compactProductFilters(stripPriceFilters(nextFilters));
      const path = buildSearchPagePath(nextQuery, normalizedFilters, nextSort);

      setPendingNavigation({
        query: nextQuery,
        filters: normalizedFilters,
        sort: nextSort,
      });

      startTransition(() => {
        if (replace) {
          router.replace(path, { scroll: false });
          return;
        }

        router.push(path, { scroll: false });
      });
    },
    [router],
  );

  useEffect(() => {
    if (!hasLegacyPaginationParams && !hasPageParam && !hasCursorParam) {
      return undefined;
    }

    const cleanPath = buildSearchPagePath(pageQuery, filters, sort);

    startTransition(() => {
      router.replace(cleanPath, { scroll: false });
    });

    return undefined;
  }, [filters, hasCursorParam, hasLegacyPaginationParams, hasPageParam, pageQuery, router, sort]);

  const handleLoadMoreProducts = useCallback(() => {
    void loadMoreProducts();
  }, [loadMoreProducts]);

  const hasQuery = query.length > 0;
  const hasProducts = products.length > 0;
  const showEmptyState =
    hasQuery && !hasProducts && !isRefetchingProducts && !showMobileTypedSuggestions;
  const showProductListing = (hasProducts || isRefetchingProducts) && !showMobileTypedSuggestions;
  const showMobileDiscovery = !hasQuery && !showProductListing && !showMobileTypedSuggestions;
  const displayedResultCount = formatSearchResultCount(totalResults, false);
  const resultCountNoun = searchResultCountLabel(totalResults, false);

  return (
    <main className="bg-palmonas-surface laptop:block laptop:overflow-visible flex-1 overflow-y-auto">
      {showMobileTypedSuggestions ? (
        <section className="laptop:hidden w-full" data-testid="search-mobile-typed-suggestions">
          <HeaderSearchDropdown
            className="max-h-none rounded-none border-0 shadow-none"
            query={draftQuery}
            matchedTerms={matchedTerms}
            productSuggestions={productSuggestions}
            isLoadingProducts={isLoadingProducts}
            suggestions={liveSuggestions}
            onTermSelect={(term) => {
              if (parseSearchIntent(draftQuery).suggestions.includes(term)) {
                navigateWithQuery(term, {}, sort);
                return;
              }

              setSearchDraftQuery(term);
            }}
            onViewAllResults={() => navigateWithQuery(normalizedDraftQuery, {}, sort)}
            onProductSelect={(handle) => {
              router.push(`/products/${handle}`);
            }}
          />
        </section>
      ) : null}

      <SearchMobileDiscovery
        className={cn('laptop:hidden', !showMobileDiscovery && 'hidden')}
        suggestions={liveSuggestions}
        isLoadingRecent={canShowRecent && isLoadingRecent}
      />

      <section
        className={cn(
          'laptop:block hidden w-full',
          SEARCH_PAGE_HERO_SECTION_CLASS,
          SEARCH_PAGE_HORIZONTAL_PADDING_CLASS,
          showProductListing && 'laptop:pb-2',
        )}
      >
        <div className="font-nunito-sans w-full text-left">
          {hasQuery ? (
            <>
              <p className="text-palmonas-muted text-sm">
                {displayedResultCount} {resultCountNoun} for
              </p>
              <h1 className="text-palmonas-ink mt-1 text-3xl font-semibold tracking-tight">
                &ldquo;{query}&rdquo;
              </h1>
            </>
          ) : (
            <h1 className="text-palmonas-ink text-3xl font-semibold tracking-tight">
              Search Palmonas
            </h1>
          )}

          <SearchPopularTerms
            className="laptop:mt-3"
            suggestions={liveSuggestions}
            isLoadingRecent={canShowRecent && isLoadingRecent}
          />

          {!hasQuery ? (
            <p className="text-palmonas-muted laptop:mt-4 mt-10 text-sm">
              Use the search bar in the header, or pick a popular search.
            </p>
          ) : null}
        </div>
      </section>

      {hasQuery && showProductListing && !showMobileTypedSuggestions ? (
        <section
          className="font-nunito-sans laptop:hidden mt-2 flex w-full flex-col items-start px-4 py-0.5"
          data-testid="search-mobile-result-summary"
        >
          <p className="text-palmonas-muted text-sm leading-5">
            {displayedResultCount} {resultCountNoun} {searchMessages.labels.resultSummarySuffix}
          </p>
          <h1 className="text-palmonas-ink text-xl leading-normal font-bold tracking-[-0.75px]">
            &ldquo;{query}&rdquo;
          </h1>
        </section>
      ) : null}

      {showEmptyState ? (
        <section className={cn('w-full', SEARCH_PAGE_HORIZONTAL_PADDING_CLASS)}>
          <SearchEmptyState query={query} />
        </section>
      ) : null}

      {showProductListing ? (
        <section className={'px-0tab:px-4 laptop:px-5 w-full'}>
          {/*
            Future: offer filter chips on search (desktop toolbar + mobile row).
            import { CollectionOfferFilterChips } from '@/components/collection/CollectionOfferFilterChips';
            Destructure `offers` from useSearch; wire URL `offer` param + productMatchesCollectionOffer.
            {showProductListing && offers.length > 0 ? (
              <CollectionOfferFilterChips
                offers={offers}
                selectedOffer={selectedOffer}
                onSelect={handleOfferSelect}
                className="laptop:hidden"
              />
            ) : null}
            ProductListingControls: offers={offers}
            offerFilter={{ offers, selectedOffer, onSelect: handleOfferSelect }}
          */}
          <ProductListingControls
            products={products}
            filterGroups={searchFilterGroups}
            filters={filtersForUi}
            sort={sort}
            onFiltersChange={(nextFilters) => navigateWithQuery(pageQuery, nextFilters, sort)}
            onSortChange={(nextSort) => navigateWithQuery(pageQuery, filters, nextSort)}
            serverFiltered
            isRefetchingProducts={isRefetchingProducts}
            hasMoreProducts={hasMoreProducts && !isLoadingMoreProducts}
            isLoadingMoreProducts={isLoadingMoreProducts}
            onLoadMoreProducts={handleLoadMoreProducts}
            loadMoreTriggerAfterIndex={loadMoreTriggerAfterIndex}
            loadMoreTriggerResetKey={loadedPageCount}
            productGridClassName={SEARCH_PRODUCT_GRID_CLASS}
            layoutClassName="laptop:mt-4"
          />
        </section>
      ) : null}
    </main>
  );
}
