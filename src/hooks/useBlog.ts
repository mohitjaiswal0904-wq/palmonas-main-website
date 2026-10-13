'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getBlogByHandle } from '@/services/blog.service';
import type { BlogArticleDetail } from '@/types/blog';

const STALE_TIME = 1000 * 60 * 5;

interface UseBlogOptions {
  initialArticle?: BlogArticleDetail | null;
}

export function useBlog(
  handle: string,
  { initialArticle }: UseBlogOptions = {},
): {
  blog: BlogArticleDetail | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.blogs.detail(handle),
    queryFn: () => getBlogByHandle(handle),
    enabled: handle.length > 0,
    initialData: initialArticle ?? undefined,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    blog: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}
