'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getStores } from '@/services/store.service';
import type { Store, StoreListQueryParams, StoresResponse } from '@/types/store';

const STALE_TIME = 1000 * 60 * 5;

interface UseStoresOptions {
  initialStores?: StoresResponse | null;
}

function canUseInitialStores(
  params: StoreListQueryParams,
  initialStores: StoresResponse | null | undefined,
): initialStores is StoresResponse {
  return Boolean(initialStores) && !params.search;
}

export function useStores(
  params: StoreListQueryParams,
  { initialStores }: UseStoresOptions = {},
): {
  stores: Store[];
  hasMoreStores: boolean;
  isLoading: boolean;
  isLoadingMoreStores: boolean;
  loadMoreStores: () => void;
  error: AppError | null;
} {
  const useInitialStores = canUseInitialStores(params, initialStores);

  const storesQuery = useInfiniteQuery({
    queryKey: queryKeys.stores.list(params),
    queryFn: ({ pageParam }) => getStores({ ...params, page: pageParam }),
    initialPageParam: 1,
    initialData: useInitialStores
      ? {
          pages: [initialStores],
          pageParams: [1],
        }
      : undefined,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasNext) {
        return allPages.length + 1;
      }

      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }

      return lastPage.stores.length === params.limit ? allPages.length + 1 : undefined;
    },
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const stores = useMemo(() => {
    const pages = storesQuery.data?.pages;

    if (!pages) {
      return [];
    }

    const storeIds = new Set<number>();

    return pages
      .flatMap((page) => page.stores)
      .filter((store) => {
        if (storeIds.has(store.id)) {
          return false;
        }

        storeIds.add(store.id);
        return true;
      });
  }, [storesQuery.data?.pages]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = storesQuery;
  const loadMoreStores = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage().catch(() => undefined);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    stores,
    hasMoreStores: hasNextPage,
    isLoading: storesQuery.isLoading,
    isLoadingMoreStores: isFetchingNextPage,
    loadMoreStores,
    error: isAppError(storesQuery.error) ? storesQuery.error : null,
  };
}
