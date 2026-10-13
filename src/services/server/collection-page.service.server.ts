import 'server-only';

import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { collectionPageHasMore } from '@/lib/utils/collection-pagination';
import { toClientProps } from '@/lib/utils/to-client-props';
import {
  getCollectionByHandle,
  getCollectionProducts,
} from '@/services/server/collection.service.server';
import type { Collection } from '@/types/collection';
import { mergeCollectionWithListMeta } from '@/types/collection';
import type { ProductListResponse } from '@/types/product';
import {
  countActiveFilters,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

export interface CollectionPageQuery {
  filters?: ProductFilters;
  sort?: ProductSortOption;
  /** @deprecated Ignored for SSR — load-more is client-side (avoids 1..N waterfall). */
  page?: number;
}

export interface CollectionPageServerData {
  collection: Collection;
  productsPages: ProductListResponse[];
  productsPageSize: number;
  loadedPageCount: number;
  hasMoreProducts: boolean;
  filters: ProductFilters;
  sort: ProductSortOption;
  filterGroups: ProductFilterGroup[];
}

async function resolveFilterGroups(
  handle: string,
  filters: ProductFilters,
): Promise<ProductFilterGroup[]> {
  if (countActiveFilters(filters) === 0) {
    return [];
  }

  const bootstrap = await getCollectionProducts(handle, {
    page: 1,
    limit: 1,
    sortBy: 'featured',
  });

  return bootstrap.filterGroups ?? [];
}

/**
 * SSR first products page only.
 * Deeper `?page=N` used to fan out N sequential API calls (~seconds each); load-more is client-side.
 * Returned props are JSON-cloned so production Flight matches `unstable_cache` hits.
 */
export async function getCollectionPageServerData(
  handle: string,
  query: CollectionPageQuery = {},
): Promise<CollectionPageServerData> {
  const productsPageSize = DEFAULT_PAGE_SIZE;
  const sort = query.sort ?? 'featured';
  const filters = query.filters ?? {};
  // The bootstrap blocks only the products call, so overlap it with the collection fetch
  // instead of making it a third serial round trip on every filtered load.
  const [collection, { firstPage, bootstrapFilterGroups }] = await Promise.all([
    getCollectionByHandle(handle),
    (async () => {
      const groups = await resolveFilterGroups(handle, filters);

      return {
        bootstrapFilterGroups: groups,
        firstPage: await getCollectionProducts(handle, {
          page: 1,
          limit: productsPageSize,
          sortBy: sort,
          filters,
          filterGroups: groups,
        }),
      };
    })(),
  ]);

  const collectionForPage = mergeCollectionWithListMeta(collection, firstPage.collectionMeta);
  const filterGroups =
    bootstrapFilterGroups.length > 0 ? bootstrapFilterGroups : (firstPage.filterGroups ?? []);

  return toClientProps({
    collection: collectionForPage,
    productsPages: [firstPage],
    productsPageSize,
    loadedPageCount: 1,
    hasMoreProducts: collectionPageHasMore(firstPage),
    filters,
    sort,
    filterGroups,
  });
}
