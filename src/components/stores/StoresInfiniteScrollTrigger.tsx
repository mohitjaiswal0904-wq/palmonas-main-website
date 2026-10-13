'use client';

import { useEffect, useRef } from 'react';

interface StoresInfiniteScrollTriggerProps {
  hasMoreStores: boolean;
  isLoadingMoreStores: boolean;
  onLoadMoreStores: () => void;
}

export function StoresInfiniteScrollTrigger({
  hasMoreStores,
  isLoadingMoreStores,
  onLoadMoreStores,
}: StoresInfiniteScrollTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasTriggeredForCurrentEntryRef = useRef(false);
  const isLoadingMoreStoresRef = useRef(isLoadingMoreStores);

  useEffect(() => {
    isLoadingMoreStoresRef.current = isLoadingMoreStores;
  }, [isLoadingMoreStores]);

  useEffect(() => {
    if (!hasMoreStores || typeof IntersectionObserver === 'undefined') {
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

        if (hasTriggeredForCurrentEntryRef.current || isLoadingMoreStoresRef.current) {
          return;
        }

        hasTriggeredForCurrentEntryRef.current = true;
        onLoadMoreStores();
      },
      { rootMargin: '0px 0px 45% 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMoreStores, onLoadMoreStores]);

  if (!hasMoreStores) {
    return null;
  }

  return (
    <div ref={sentinelRef} className="flex min-h-20 justify-center py-8" aria-live="polite">
      {isLoadingMoreStores ? (
        <span className="text-palmonas-muted text-sm">Loading more stores...</span>
      ) : null}
    </div>
  );
}
