import { SHRADDHAS_FAVOURITE_PAGE_PATH } from '@/config/shraddhas-favourite.config';
import { serializeCollectionSearchParams } from '@/lib/utils/collection-search-params';
import type { ProductFilters, ProductSortOption } from '@/types/product-listing';

export function buildShraddhasFavouritePagePath(
  filters: ProductFilters,
  sort: ProductSortOption,
  page = 1,
): string {
  const query = serializeCollectionSearchParams(filters, sort, page);

  return query.length > 0
    ? `${SHRADDHAS_FAVOURITE_PAGE_PATH}?${query}`
    : SHRADDHAS_FAVOURITE_PAGE_PATH;
}
