import { SEARCH_SSR_PAGE_BATCH_SIZE } from '@/components/search/search-constants';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import type { ProductListResponse } from '@/types/product';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

export interface SearchProductBatchParams {
  query: string;
  sort: ProductSortOption;
  filters: ProductFilters;
  filterGroups: ProductFilterGroup[];
  productsPageSize?: number;
  startCursor?: string;
  startPageNumber: number;
}

export type SearchProductPageFetcher = (params: {
  query: string;
  cursor?: string;
  limit: number;
  sortBy: ProductSortOption;
  filters: ProductFilters;
  filterGroups: ProductFilterGroup[];
}) => Promise<ProductListResponse>;

/**
 * Fetches up to `pageBatchSize` search product pages, following `nextCursor`.
 * Stops if the API repeats the same cursor so infinite scroll cannot loop.
 *
 * @param fetchPage - Search products page fetcher.
 * @param params - Query, sort, filters, and pagination start.
 * @param pageBatchSize - Max pages to request in this batch.
 * @returns Fetched pages with sequential `page` numbers.
 */
export async function fetchSearchProductsBatch(
  fetchPage: SearchProductPageFetcher,
  {
    query,
    sort,
    filters,
    filterGroups,
    productsPageSize = DEFAULT_PAGE_SIZE,
    startCursor,
    startPageNumber,
  }: SearchProductBatchParams,
  pageBatchSize: number = SEARCH_SSR_PAGE_BATCH_SIZE,
): Promise<ProductListResponse[]> {
  const pages: ProductListResponse[] = [];
  let cursor = startCursor;

  for (let index = 0; index < pageBatchSize; index += 1) {
    const response = await fetchPage({
      query,
      ...(cursor ? { cursor } : {}),
      limit: productsPageSize,
      sortBy: sort,
      filters,
      filterGroups,
    });

    pages.push({
      ...response,
      page: startPageNumber + index,
    });

    const nextCursor = response.nextCursor;

    // Search APIs can echo the request cursor while has_next stays true; stop so
    // infinite scroll does not refetch the same page forever.
    if (!collectionPageHasMore(response) || !nextCursor || nextCursor === cursor) {
      break;
    }

    cursor = nextCursor;
  }

  return pages;
}
