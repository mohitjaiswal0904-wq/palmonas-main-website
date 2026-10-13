import { compactProductFilters } from '@/lib/utils/product-filters';
import {
  PRODUCT_SORT_OPTIONS,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

const SORT_PARAM = 'sort';
const PAGE_PARAM = 'page';

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

function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;

  if (typeof raw !== 'string' || raw.length === 0) {
    return 1;
  }

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

export function parseCollectionSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): { filters: ProductFilters; sort: ProductSortOption; page: number } {
  const sortValue = searchParams[SORT_PARAM];
  const sort =
    typeof sortValue === 'string' && isProductSortOption(sortValue) ? sortValue : 'featured';
  const page = parsePageParam(searchParams[PAGE_PARAM]);

  const filters: ProductFilters = {};

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === SORT_PARAM || key === PAGE_PARAM) {
      return;
    }

    const optionIds = normalizeSearchParamValue(value);

    if (optionIds.length > 0) {
      filters[key] = optionIds;
    }
  });

  return { filters, sort, page };
}

export function serializeCollectionSearchParams(
  filters: ProductFilters,
  sort: ProductSortOption,
  page = 1,
): string {
  const params = new URLSearchParams();

  if (sort !== 'featured') {
    params.set(SORT_PARAM, sort);
  }

  if (page > 1) {
    params.set(PAGE_PARAM, String(page));
  }

  Object.entries(filters).forEach(([groupId, optionIds]) => {
    if (optionIds.length > 0) {
      params.set(groupId, optionIds.join(','));
    }
  });

  return params.toString();
}

export function buildCollectionPagePath(
  handle: string,
  filters: ProductFilters,
  sort: ProductSortOption,
  page = 1,
): string {
  const query = serializeCollectionSearchParams(filters, sort, page);

  return query.length > 0 ? `/collections/${handle}?${query}` : `/collections/${handle}`;
}

export function filtersMatchQuery(left: ProductFilters, right: ProductFilters): boolean {
  const compactLeft = compactProductFilters(left);
  const compactRight = compactProductFilters(right);
  const leftKeys = Object.keys(compactLeft).sort();
  const rightKeys = Object.keys(compactRight).sort();

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key, index) => {
    if (key !== rightKeys[index]) {
      return false;
    }

    const leftValues = [...(compactLeft[key] ?? [])].sort();
    const rightValues = [...(compactRight[key] ?? [])].sort();

    if (leftValues.length !== rightValues.length) {
      return false;
    }

    return leftValues.every((value, valueIndex) => value === rightValues[valueIndex]);
  });
}
