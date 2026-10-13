'use client';

import { useEffect, useRef } from 'react';

import { productMessages } from '@/config/product/product.config';

interface ProductReviewsInfiniteScrollTriggerProps {
  hasMoreReviews: boolean;
  isLoadingMoreReviews: boolean;
  onLoadMoreReviews: () => void;
}

/**
 * Intersection observer sentinel that loads the next reviews page near viewport bottom.
 */
export function ProductReviewsInfiniteScrollTrigger({
  hasMoreReviews,
  isLoadingMoreReviews,
  onLoadMoreReviews,
}: ProductReviewsInfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredForCurrentEntryRef = useRef(false);
  const isLoadingMoreReviewsRef = useRef(isLoadingMoreReviews);

  useEffect(() => {
    isLoadingMoreReviewsRef.current = isLoadingMoreReviews;
  }, [isLoadingMoreReviews]);

  useEffect(() => {
    if (!hasMoreReviews || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          hasTriggeredForCurrentEntryRef.current = false;
          return;
        }

        if (hasTriggeredForCurrentEntryRef.current || isLoadingMoreReviewsRef.current) {
          return;
        }

        hasTriggeredForCurrentEntryRef.current = true;
        onLoadMoreReviews();
      },
      { rootMargin: '0px 0px 45% 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreReviews, onLoadMoreReviews]);

  if (!hasMoreReviews) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="flex min-h-20 justify-center py-8" aria-live="polite">
      {isLoadingMoreReviews ? (
        <span className="text-sm text-[#595959]">{productMessages.reviews.loadingMore}</span>
      ) : null}
    </div>
  );
}
