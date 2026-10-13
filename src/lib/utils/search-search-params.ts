import {
  PRODUCT_SORT_OPTIONS,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

const QUERY_PARAM = 'q';
const SORT_PARAM = 'sort';

const RESERVED_PARAMS = new Set([QUERY_PARAM, SORT_PARAM, 'page', 'cursor']);

function isProductSortOption(value: string): value is ProductSortOption {
  return PRODUCT_SORT_OPTIONS.some((option) => option.value === value);
}

function normalizeSearchParamValue(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => entry.split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.length > 0) {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

export function parseSearchSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): { query: string; filters: ProductFilters; sort: ProductSortOption } {
  const rawQuery = searchParams[QUERY_PARAM];
  const query =
    typeof rawQuery === 'string'
      ? rawQuery.trim()
      : Array.isArray(rawQuery)
        ? (rawQuery[0]?.trim() ?? '')
        : '';
  const sortValue = searchParams[SORT_PARAM];
  const sort =
    typeof sortValue === 'string' && isProductSortOption(sortValue) ? sortValue : 'featured';

  const filters: ProductFilters = {};

  Object.entries(searchParams).forEach(([key, value]) => {
    if (RESERVED_PARAMS.has(key)) {
      return;
    }

    const optionIds = normalizeSearchParamValue(value);

    if (optionIds.length > 0) {
      filters[key] = optionIds;
    }
  });

  return { query, filters, sort };
}

export function serializeSearchSearchParams(
  query: string,
  filters: ProductFilters,
  sort: ProductSortOption,
): string {
  const params = new URLSearchParams();
  const normalizedQuery = query.trim();

  if (normalizedQuery.length > 0) {
    params.set(QUERY_PARAM, normalizedQuery);
  }

  if (sort !== 'featured') {
    params.set(SORT_PARAM, sort);
  }

  Object.entries(filters).forEach(([groupId, optionIds]) => {
    if (optionIds.length > 0) {
      params.set(groupId, optionIds.join(','));
    }
  });

  return params.toString();
}

export function buildSearchPagePath(
  query: string,
  filters: ProductFilters,
  sort: ProductSortOption,
): string {
  const search = serializeSearchSearchParams(query, filters, sort);

  return search.length > 0 ? `/search?${search}` : '/search';
}
