import { EMILY_IN_PARIS_PAGE_PATH } from '@/config/emily-in-paris.config';
import { serializeCollectionSearchParams } from '@/lib/utils/collection-search-params';
import type { ProductFilters, ProductSortOption } from '@/types/product-listing';

export function buildEmilyInParisPagePath(
  filters: ProductFilters,
  sort: ProductSortOption,
  page = 1,
): string {
  const query = serializeCollectionSearchParams(filters, sort, page);

  return query.length > 0 ? `${EMILY_IN_PARIS_PAGE_PATH}?${query}` : EMILY_IN_PARIS_PAGE_PATH;
}
