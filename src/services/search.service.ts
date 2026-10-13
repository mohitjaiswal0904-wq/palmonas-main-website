/**
 * Client-only — uses @/lib/api.
 * SSR pages: @/services/server/search.service.server
 */
import { SEARCH_PRODUCTS_PAGE_SIZE } from '@/components/search/search-constants';
import { SEARCH_HISTORY_LIMIT } from '@/config/search/search.config';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { extractSearchHistoryQueries } from '@/lib/search/parse-search-history';
import {
  toSearchProductsQuery,
  type SearchProductsQueryParams,
} from '@/lib/utils/search-products-query';
import { transformProductList } from '@/services/product-transform';
import type { Product, ProductListEnvelopeApiResponse, ProductListResponse } from '@/types/product';

export type SearchProductsParams = SearchProductsQueryParams;

export async function searchProductsList(
  params: SearchProductsParams,
): Promise<ProductListResponse> {
  try {
    const { data } = await api.get<ProductListEnvelopeApiResponse>(ENDPOINTS.search.products, {
      params: toSearchProductsQuery(params),
    });

    return transformProductList(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await searchProductsList({ query, limit: SEARCH_PRODUCTS_PAGE_SIZE });

  return response.items;
}

/**
 * Fetches the signed-in user's recent search queries.
 *
 * @param limit - Max queries to request (defaults to `SEARCH_HISTORY_LIMIT`).
 * @returns Ordered non-empty query strings.
 * @throws AppError when the request fails.
 */
export async function getSearchHistory(limit: number = SEARCH_HISTORY_LIMIT): Promise<string[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.search.history, {
      params: { limit },
    });

    return extractSearchHistoryQueries(data).slice(0, limit);
  } catch (err) {
    throw normaliseError(err);
  }
}
