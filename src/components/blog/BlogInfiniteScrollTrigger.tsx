'use client';

import { useEffect, useRef } from 'react';

interface BlogInfiniteScrollTriggerProps {
  hasMoreArticles: boolean;
  isLoadingMoreArticles: boolean;
  onLoadMoreArticles: () => void;
}

export function BlogInfiniteScrollTrigger({
  hasMoreArticles,
  isLoadingMoreArticles,
  onLoadMoreArticles,
}: BlogInfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredForCurrentEntryRef = useRef(false);
  const isLoadingMoreArticlesRef = useRef(isLoadingMoreArticles);

  useEffect(() => {
    isLoadingMoreArticlesRef.current = isLoadingMoreArticles;
  }, [isLoadingMoreArticles]);

  useEffect(() => {
    if (!hasMoreArticles || typeof IntersectionObserver === 'undefined') {
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

        if (hasTriggeredForCurrentEntryRef.current || isLoadingMoreArticlesRef.current) {
          return;
        }

        hasTriggeredForCurrentEntryRef.current = true;
        onLoadMoreArticles();
      },
      { rootMargin: '0px 0px 45% 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreArticles, onLoadMoreArticles]);

  if (!hasMoreArticles) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="flex min-h-20 justify-center py-8" aria-live="polite">
      {isLoadingMoreArticles ? (
        <span className="text-palmonas-muted font-nunito-sans text-sm">Loading more posts...</span>
      ) : null}
    </div>
  );
}
