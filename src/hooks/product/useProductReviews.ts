'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getProductReviews } from '@/services/product-reviews.service';
import type {
  ProductReview,
  ProductReviewStats,
  ProductReviewsFilter,
} from '@/types/product/reviews';

const STALE_TIME = 1000 * 60 * 5;

interface UseProductReviewsOptions {
  enabled?: boolean;
}

/**
 * Loads paginated product reviews for PDP below-the-fold section.
 *
 * @param productId - Product id for reviews API path.
 * @param pageSize - Reviews per page (initial preview + load-more batches).
 * @param filter - Single active relevant, period, or star-rating filter.
 * @param options - Enable flag.
 */
export function useProductReviews(
  productId: string | undefined,
  pageSize: number,
  filter: ProductReviewsFilter,
  { enabled = true }: UseProductReviewsOptions = {},
): {
  reviews: ProductReview[];
  stats: ProductReviewStats | undefined;
  hasMoreReviews: boolean;
  totalCount: number;
  isLoading: boolean;
  isFetchingReviews: boolean;
  isLoadingMoreReviews: boolean;
  loadMoreReviews: () => void;
  error: AppError | null;
} {
  const params = useMemo(
    () => ({
      filter,
      pageSize,
    }),
    [filter, pageSize],
  );

  const reviewsQuery = useInfiniteQuery({
    queryKey: queryKeys.products.reviews(productId ?? '', params),
    queryFn: ({ pageParam }) =>
      getProductReviews(productId ?? '', {
        ...params,
        page: pageParam,
      }),
    initialPageParam: 1,
    enabled: enabled && Boolean(productId),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    staleTime: STALE_TIME,
    // Keep prior filter results while next request is in flight so layout does not collapse.
    placeholderData: keepPreviousData,
    refetchOnMount: 'always',
    retry: shouldRetryQuery,
  });

  const reviews = useMemo(() => {
    const pages = reviewsQuery.data?.pages;

    if (!pages) {
      return [];
    }

    const reviewIds = new Set<number>();

    return pages
      .flatMap((page) => page.reviews)
      .filter((review) => {
        if (reviewIds.has(review.id)) {
          return false;
        }

        reviewIds.add(review.id);
        return true;
      });
  }, [reviewsQuery.data?.pages]);

  const stats = reviewsQuery.data?.pages[0]?.stats;
  const pageTotal = reviewsQuery.data?.pages[0]?.totalCount ?? 0;
  const totalCount = Math.max(pageTotal, reviews.length);
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = reviewsQuery;

  const loadMoreReviews = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage().catch(() => undefined);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    reviews,
    stats,
    hasMoreReviews: hasNextPage ?? false,
    totalCount,
    isLoading: reviewsQuery.isLoading,
    // Skeleton only when swapping filters (placeholder) or first load — not background refetch.
    isFetchingReviews:
      reviewsQuery.isFetching &&
      !reviewsQuery.isFetchingNextPage &&
      (reviewsQuery.isPlaceholderData || reviewsQuery.isLoading),
    isLoadingMoreReviews: isFetchingNextPage,
    loadMoreReviews,
    error: isAppError(reviewsQuery.error) ? reviewsQuery.error : null,
  };
}

export type { ProductReviewsFilter };
