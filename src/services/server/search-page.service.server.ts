import { SEARCH_PRODUCTS_PAGE_SIZE } from '@/components/search/search-constants';
import { countIntentMatches } from '@/lib/search/rank-search-results';
import {
  parseSearchIntent,
  SEARCH_INTENT_MIN_MATCHES,
  type SearchIntent,
} from '@/lib/search/search-intent';
import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import { stripPriceFilterGroups, stripPriceFilters } from '@/lib/utils/product-filters';
import { fetchSearchProductsBatch } from '@/lib/utils/search-product-batch';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { searchProductsList } from '@/services/server/search.service.server';
import type { Product, ProductListResponse } from '@/types/product';
import {
  countActiveFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';
import type { SearchResultsData } from '@/types/search';

export interface SearchPageQuery {
  query: string;
  filters?: ProductFilters;
  sort?: ProductSortOption;
}

export type SearchPageServerData = SearchResultsData;

async function resolveFilterGroups(
  query: string,
  filters: ProductFilters,
): Promise<ProductFilterGroup[]> {
  if (countActiveFilters(filters) === 0) {
    return [];
  }

  const bootstrap = await searchProductsList({
    query,
    limit: 1,
    sortBy: 'featured',
  });

  return stripPriceFilterGroups(bootstrap.filterGroups ?? []);
}

export async function getSearchPageServerData(
  query: SearchPageQuery,
): Promise<SearchPageServerData | null> {
  const normalizedQuery = normalizeSearchQuery(query.query);

  if (!normalizedQuery) {
    return null;
  }

  const intent = parseSearchIntent(normalizedQuery);
  const productsPageSize = SEARCH_PRODUCTS_PAGE_SIZE;
  const sort = query.sort ?? 'featured';
  const filters = stripPriceFilters(query.filters ?? {});
  const sendProductType = countActiveFilters(filters) === 0;
  const bootstrapFilterGroups = await resolveFilterGroups(intent.apiQuery, filters);

  const fetchedPages = await fetchSearchProductsBatch(
    (params) =>
      searchProductsList({
        query: params.query,
        ...(params.cursor ? { cursor: params.cursor } : {}),
        limit: params.limit,
        sortBy: params.sortBy,
        filters: params.filters,
        filterGroups: params.filterGroups,
        ...(sendProductType && intent.productType ? { productType: intent.productType } : {}),
      }),
    {
      query: intent.apiQuery,
      sort,
      filters,
      filterGroups: bootstrapFilterGroups,
      productsPageSize,
      startPageNumber: 1,
    },
  );

  const productsPages = await fillThinFirstPage(fetchedPages, intent, productsPageSize, sort);

  const firstPage = productsPages[0];

  if (!firstPage) {
    return null;
  }

  const filterGroups = stripPriceFilterGroups(
    bootstrapFilterGroups.length > 0 ? bootstrapFilterGroups : (firstPage.filterGroups ?? []),
  );

  const latestPage = productsPages[productsPages.length - 1] ?? firstPage;

  return {
    query: normalizedQuery,
    productsPages,
    productsPageSize,
    loadedPageCount: productsPages.length,
    loadedBatchIndex: 1,
    hasMoreProducts: collectionPageHasMore(latestPage),
    nextCursor: latestPage.nextCursor,
    filters,
    sort,
    filterGroups,
    totalResults: firstPage.total,
  };
}

/**
 * Pulls one more search when the first page does not already contain enough intent matches.
 *
 * @param pages - Pages from the primary search.
 * @param intent - Parsed search intent.
 * @param limit - Page size of the extra request.
 * @param sort - Sort shared with the primary search.
 * @returns The same pages, with extra products merged into the first page when needed.
 */
async function fillThinFirstPage(
  pages: ProductListResponse[],
  intent: SearchIntent,
  limit: number,
  sort: ProductSortOption,
): Promise<ProductListResponse[]> {
  const firstPage = pages[0];

  if (!firstPage || !intent.fallbackQuery) {
    return pages;
  }

  if (countIntentMatches(firstPage.items, intent) >= SEARCH_INTENT_MIN_MATCHES) {
    return pages;
  }

  try {
    const extra = await searchProductsList({
      query: intent.fallbackQuery,
      limit,
      sortBy: sort,
    });

    return [
      { ...firstPage, items: mergeSearchProducts(firstPage.items, extra.items) },
      ...pages.slice(1),
    ];
  } catch {
    return pages;
  }
}

function mergeSearchProducts(current: Product[], extra: Product[]): Product[] {
  const seen = new Set(current.map((product) => product.id));
  const merged = [...current];

  for (const product of extra) {
    if (seen.has(product.id)) {
      continue;
    }

    seen.add(product.id);
    merged.push(product);
  }

  return merged;
}
