'use client';

import { useEffect, useState, type RefObject } from 'react';

interface UseStickyPinStateOptions {
  sentinelRef: RefObject<HTMLElement | null>;
  stickyTop: number;
  enabled?: boolean;
}

/**
 * Tracks when a sticky element is pinned below the site header.
 */
export function useStickyPinState({
  sentinelRef,
  stickyTop,
  enabled = true,
}: UseStickyPinStateOptions): boolean {
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!enabled || !sentinel || stickyTop <= 0) {
      setIsPinned(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        setIsPinned(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `-${stickyTop}px 0px 0px 0px`,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [enabled, sentinelRef, stickyTop]);

  return isPinned;
}
