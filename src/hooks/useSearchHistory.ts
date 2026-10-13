'use client';

import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { SEARCH_HISTORY_LIMIT, SEARCH_HISTORY_STALE_MS } from '@/config/search/search.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getSearchHistory } from '@/services/search.service';

interface UseSearchHistoryOptions {
  /** When true and the user is authenticated, run/refetch history. */
  isOpen?: boolean;
}

interface UseSearchHistoryResult {
  terms: string[];
  isLoading: boolean;
  error: AppError | null;
}

/**
 * Clears cached search history (e.g. on logout).
 *
 * @param queryClient - App QueryClient instance.
 */
export function clearSearchHistoryCache(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: queryKeys.search.history() });
}

/**
 * Force-fetches search history, ignoring staleTime. Call once from auth sync on login.
 *
 * @param queryClient - App QueryClient instance.
 */
export function forcePrefetchSearchHistory(queryClient: QueryClient): void {
  clearSearchHistoryCache(queryClient);
  void queryClient
    .prefetchQuery({
      queryKey: queryKeys.search.history(),
      queryFn: () => getSearchHistory(SEARCH_HISTORY_LIMIT),
      staleTime: SEARCH_HISTORY_STALE_MS,
    })
    .catch(() => {
      // Prefetch failures are non-fatal; open-time query surfaces state.
    });
}

/**
 * Loads recent search terms for authenticated (non-guest) users.
 * Refetches on each client route change; open still respects `SEARCH_HISTORY_STALE_MS`
 * between navigations. Guest→login force fetch lives in `PostAuthSync`.
 *
 * @param options.isOpen - Whether the search dropdown is open.
 * @returns Recent terms plus loading/error for the Recent section.
 */
export function useSearchHistory(options: UseSearchHistoryOptions = {}): UseSearchHistoryResult {
  const { isOpen = false } = options;
  const pathname = usePathname();
  const { isAuthenticated, isGuest, isLoading: isBootstrapping } = useAuth();
  const queryClient = useQueryClient();
  const canFetch = isAuthenticated && !isGuest && !isBootstrapping;

  // Refetch recent searches after every client navigation.
  useEffect(() => {
    if (!canFetch) {
      return;
    }

    void queryClient
      .fetchQuery({
        queryKey: queryKeys.search.history(),
        queryFn: () => getSearchHistory(SEARCH_HISTORY_LIMIT),
        // Force network on navigation; open-time staleTime still comes from useQuery.
        staleTime: 0,
      })
      .catch(() => {
        // Prefetch failures are non-fatal; open-time query surfaces state.
      });
  }, [canFetch, pathname, queryClient]);

  const { data, isFetching, isPending, error } = useQuery({
    queryKey: queryKeys.search.history(),
    queryFn: () => getSearchHistory(SEARCH_HISTORY_LIMIT),
    enabled: canFetch && isOpen,
    staleTime: SEARCH_HISTORY_STALE_MS,
    retry: shouldRetryQuery,
  });

  return {
    terms: canFetch ? (data ?? []) : [],
    // Skeleton only when no cached terms yet; stale refetches keep prior list visible.
    isLoading: canFetch && isOpen && isFetching && (isPending || !data),
    error: isAppError(error) ? error : null,
  };
}
