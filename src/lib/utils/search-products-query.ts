import { buildCollectionProductFilterParams, toSearchSortParam } from '@/lib/utils/product-filters';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

export interface SearchProductsQueryParams {
  query: string;
  page?: number;
  cursor?: string;
  limit?: number;
  filters?: ProductFilters;
  filterGroups?: ProductFilterGroup[];
  sortBy?: ProductSortOption;
  /** Catalog product_type, sent only when the search intent is confident. */
  productType?: string;
}

/**
 * Builds query params for GET /api/v2/search/products.
 * Sort is sent as `sort` (not `sort_by`); featured is omitted for relevance.
 * Does not send `available` — GOLD is MTO and must not be excluded by stock/sellable.
 *
 * @param params - Search term, pagination, filters, and sort options.
 * @returns Serialisable query object for the v2 search products endpoint.
 */
export function toSearchProductsQuery(
  params: SearchProductsQueryParams,
): Record<string, string | number | boolean> {
  const filterParams =
    params.filters && params.filterGroups
      ? buildCollectionProductFilterParams(params.filters, params.filterGroups)
      : {};
  const sortParam = params.sortBy ? toSearchSortParam(params.sortBy) : undefined;

  return {
    q: params.query,
    ...(params.cursor ? { cursor: params.cursor } : params.page ? { page: params.page } : {}),
    ...(params.limit && { page_size: params.limit }),
    ...filterParams,
    ...(params.productType ? { product_type: params.productType } : {}),
    ...(sortParam && { sort: sortParam }),
  };
}
