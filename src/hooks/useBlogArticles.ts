'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { BLOG_PAGE_SIZE } from '@/lib/constants';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getBlogArticles } from '@/services/blog.service';
import type { BlogArticle, BlogArticlesQueryParams, BlogArticlesResponse } from '@/types/blog';

const STALE_TIME = 1000 * 60 * 5;

interface UseBlogArticlesOptions {
  initialArticles?: BlogArticlesResponse | null;
}

function canUseInitialArticles(
  params: BlogArticlesQueryParams,
  initialArticles: BlogArticlesResponse | null | undefined,
): initialArticles is BlogArticlesResponse {
  return Boolean(initialArticles) && params.limit === BLOG_PAGE_SIZE;
}

export function useBlogArticles(
  params: BlogArticlesQueryParams,
  { initialArticles }: UseBlogArticlesOptions = {},
): {
  articles: BlogArticle[];
  total: number;
  hasMoreArticles: boolean;
  isLoading: boolean;
  isLoadingMoreArticles: boolean;
  loadMoreArticles: () => void;
  error: AppError | null;
} {
  const useInitialArticles = canUseInitialArticles(params, initialArticles);

  const articlesQuery = useInfiniteQuery({
    queryKey: queryKeys.blogs.list(params),
    queryFn: ({ pageParam }) => getBlogArticles({ ...params, page: pageParam }),
    initialPageParam: 1,
    initialData: useInitialArticles
      ? {
          pages: [initialArticles],
          pageParams: [1],
        }
      : undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext) {
        return lastPage.page + 1;
      }

      return undefined;
    },
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const articles = useMemo(() => {
    const pages = articlesQuery.data?.pages;

    if (!pages) {
      return [];
    }

    const articleIds = new Set<string>();

    return pages
      .flatMap((page) => page.articles)
      .filter((article) => {
        if (articleIds.has(article.id)) {
          return false;
        }

        articleIds.add(article.id);
        return true;
      });
  }, [articlesQuery.data?.pages]);

  const total = articlesQuery.data?.pages[0]?.total ?? 0;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = articlesQuery;

  const loadMoreArticles = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage().catch(() => undefined);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    articles,
    total,
    hasMoreArticles: hasNextPage ?? false,
    isLoading: articlesQuery.isLoading,
    isLoadingMoreArticles: isFetchingNextPage,
    loadMoreArticles,
    error: isAppError(articlesQuery.error) ? articlesQuery.error : null,
  };
}
