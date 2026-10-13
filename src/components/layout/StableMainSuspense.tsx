'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useLayoutEffect, type ReactNode } from 'react';

/** Keep a handful of listing/PDP bodies so swipe-back does not remount a skeleton. */
const MAX_CACHED_MAINS = 6;
const cachedMains = new Map<string, ReactNode>();

/**
 * Store a resolved main tree and evict the oldest entry when the cap is hit.
 *
 * @param key - Route pathname used as the cache identity.
 * @param node - Last children that successfully rendered for `key`.
 */
function rememberMain(key: string, node: ReactNode): void {
  cachedMains.delete(key);
  cachedMains.set(key, node);

  while (cachedMains.size > MAX_CACHED_MAINS) {
    const oldest = cachedMains.keys().next().value;
    if (oldest === undefined) {
      break;
    }
    cachedMains.delete(oldest);
  }
}

/**
 * Drop cached mains. Used by tests so route identity does not leak across cases.
 */
export function resetStableMainCache(): void {
  cachedMains.clear();
}

interface StableMainSuspenseProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface StableMainCaptureProps {
  cacheKey: string;
  children: ReactNode;
}

/** Stores the latest resolved main so a remount can reuse it as the Suspense fallback. */
function StableMainCapture({ cacheKey, children }: StableMainCaptureProps) {
  useLayoutEffect(() => {
    rememberMain(cacheKey, children);
  }, [cacheKey, children]);

  return children;
}

/**
 * Suspense boundary that reuses the last resolved body for the current pathname.
 *
 * Route `loading.tsx` + a fresh main Suspense on history-back paints a skeleton
 * while RSC re-streams. Cache Components hides the previous route (Activity);
 * when Next remounts the page anyway, this keeps the last grid/PDP on screen.
 */
export function StableMainSuspense({ fallback, children }: StableMainSuspenseProps) {
  const pathname = usePathname();
  const cached = cachedMains.get(pathname) ?? null;

  return (
    <Suspense fallback={cached ?? fallback}>
      <StableMainCapture cacheKey={pathname}>{children}</StableMainCapture>
    </Suspense>
  );
}
