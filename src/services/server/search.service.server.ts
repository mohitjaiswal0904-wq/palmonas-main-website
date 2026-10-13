import 'server-only';

import { SEARCH_PRODUCTS_PAGE_SIZE } from '@/components/search/search-constants';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { isNextProductionRuntime } from '@/lib/is-next-production';
import { createPublicServerApi, createServerApi } from '@/lib/server-api';
import {
  toSearchProductsQuery,
  type SearchProductsQueryParams,
} from '@/lib/utils/search-products-query';
import { transformProductList } from '@/services/product-transform';
import type { ProductListEnvelopeApiResponse, ProductListResponse } from '@/types/product';

export type SearchProductsParams = SearchProductsQueryParams;

async function createSearchServerClient() {
  // ponytail: prod uses cookie-less client like collection PLP — stale Bearer tokens
  // on SSR must not empty or skew public search results (PW-718).
  if (isNextProductionRuntime()) {
    return createPublicServerApi();
  }

  return createServerApi();
}

export async function searchProductsList(
  params: SearchProductsParams,
): Promise<ProductListResponse> {
  try {
    const client = await createSearchServerClient();
    const { data } = await client.get<ProductListEnvelopeApiResponse>(ENDPOINTS.search.products, {
      params: toSearchProductsQuery(params),
    });

    return transformProductList(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function searchProducts(query: string): Promise<ProductListResponse['items']> {
  const response = await searchProductsList({ query, limit: SEARCH_PRODUCTS_PAGE_SIZE });

  return response.items;
}
