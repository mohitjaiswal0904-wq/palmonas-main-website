import {
  buildCollectionProductFilterParams,
  toCollectionSortParam,
} from '@/lib/utils/product-filters';
import type { CollectionProductsParams } from '@/types/collection';

/**
 * Build query params for collection products list APIs (client + server).
 */
export function toCollectionProductQuery(
  params: CollectionProductsParams,
): Record<string, string | number> {
  const filterParams =
    params.filters && params.filterGroups
      ? buildCollectionProductFilterParams(params.filters, params.filterGroups)
      : {};
  const sortParam = params.sortBy ? toCollectionSortParam(params.sortBy) : undefined;

  return {
    ...(params.page && { page: params.page }),
    ...(params.cursor && { cursor: params.cursor }),
    ...(params.limit && { page_size: params.limit }),
    ...filterParams,
    ...(sortParam && { sort_by: sortParam }),
  };
}
