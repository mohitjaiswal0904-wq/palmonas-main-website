import {
  parseSearchSearchParams,
  serializeSearchSearchParams,
} from '@/lib/utils/search-search-params';
import { getSearchPageServerData } from '@/services/server/search-page.service.server';
import { getSearchSuggestions } from '@/services/server/search-suggestions.service.server';
import type { ProductFilters, ProductSortOption } from '@/types/product-listing';
import type { SearchResultsData } from '@/types/search';
import type { SearchSuggestions } from '@/types/search-suggestions';

type SearchPageSearchParams = Record<string, string | string[] | undefined>;

export interface ResolvedSearchPageRequest {
  query: string;
  filters: ProductFilters;
  sort: ProductSortOption;
  searchResults: SearchResultsData | null;
  suggestions: SearchSuggestions;
  contentKey: string;
  hasLegacyPaginationParams: boolean;
}

export async function resolveSearchPageRequest(
  searchParams: Promise<SearchPageSearchParams>,
): Promise<ResolvedSearchPageRequest> {
  const resolvedSearchParams = await searchParams;
  const { query, filters, sort } = parseSearchSearchParams(resolvedSearchParams);
  const [searchResults, suggestions] = await Promise.all([
    query ? getSearchPageServerData({ query, filters, sort }) : Promise.resolve(null),
    getSearchSuggestions(),
  ]);

  return {
    query,
    filters,
    sort,
    searchResults,
    suggestions,
    contentKey: serializeSearchSearchParams(query, filters, sort),
    hasLegacyPaginationParams: 'page' in resolvedSearchParams || 'cursor' in resolvedSearchParams,
  };
}

export async function resolveSearchPageMetadataQuery(
  searchParams: Promise<SearchPageSearchParams>,
): Promise<string> {
  const resolvedSearchParams = await searchParams;
  const { query } = parseSearchSearchParams(resolvedSearchParams);

  return query;
}
