'use client';

import { useQuery } from '@tanstack/react-query';

import { SEARCH_AUTOCOMPLETE_PRODUCT_LIMIT } from '@/components/search/search-constants';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { rankSearchResults } from '@/lib/search/rank-search-results';
import { parseSearchIntent } from '@/lib/search/search-intent';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { searchProductsList } from '@/services/search.service';
import type { Product } from '@/types/product';

interface UseSearchAutocompleteResult {
  products: Product[];
  isLoading: boolean;
  error: AppError | null;
}

/**
 * Fetches a short product list for header search autocomplete while typing.
 *
 * @param query - Current search input value.
 * @returns Matching products plus loading/error state.
 */
export function useSearchAutocomplete(query: string): UseSearchAutocompleteResult {
  const normalizedQuery = normalizeSearchQuery(query);
  const intent = parseSearchIntent(normalizedQuery);
  const enabled = normalizedQuery.length > 0;

  const { data, isFetching, error } = useQuery({
    queryKey: queryKeys.search.autocomplete(intent.apiQuery),
    queryFn: async () => {
      const response = await searchProductsList({
        query: intent.apiQuery,
        limit: SEARCH_AUTOCOMPLETE_PRODUCT_LIMIT,
        page: 1,
        ...(intent.productType ? { productType: intent.productType } : {}),
      });

      return {
        ...response,
        items: rankSearchResults(response.items, intent, { keepUnmatched: true }),
      };
    },
    enabled,
    staleTime: 30_000,
    retry: shouldRetryQuery,
  });

  return {
    products: enabled ? (data?.items ?? []) : [],
    isLoading: enabled && isFetching,
    error: isAppError(error) ? error : null,
  };
}
