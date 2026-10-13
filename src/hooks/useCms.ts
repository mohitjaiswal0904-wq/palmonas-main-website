'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getHomeSections, getPageSections } from '@/services/cms.service';
import type { CmsSection } from '@/types/cms';

const STALE_TIME = 1000 * 60 * 5;

export function useCmsPage(slug: string): {
  sections: CmsSection[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.cms.page(slug),
    queryFn: () => getPageSections(slug),
    enabled: slug.length > 0,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    sections: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useHomeSections(): {
  sections: CmsSection[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.cms.home(),
    queryFn: getHomeSections,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    sections: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}
