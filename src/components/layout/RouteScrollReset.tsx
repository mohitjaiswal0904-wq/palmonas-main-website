'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Send the viewport to the top of the document whenever the route pathname changes.
 *
 * Next's built-in scroll-to-top measures the top edge of the incoming route segment and
 * skips scrolling when that edge is already visible. `StreamingPageShell` renders the
 * `sticky top-0` site header *inside* every page segment, so the measurement always
 * reports top `0` and Next always skips — which is why collection pages opened at the
 * previous page's scroll offset. Resetting here is independent of that heuristic.
 *
 * Keyed on pathname only, on purpose: same-path query changes (collection filter and sort)
 * must leave the shopper where they are.
 */
export function RouteScrollReset() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);
  const isHistoryNavigationRef = useRef(false);

  // Back/forward should restore the previous offset, so flag those before the route commits.
  useEffect(() => {
    const markHistoryNavigation = (): void => {
      isHistoryNavigationRef.current = true;
    };

    window.addEventListener('popstate', markHistoryNavigation);

    return () => {
      window.removeEventListener('popstate', markHistoryNavigation);
    };
  }, []);

  // Pathname committed — decide whether this navigation owes the shopper a reset.
  useEffect(() => {
    const previousPathname = previousPathnameRef.current;
    previousPathnameRef.current = pathname;

    const wasHistoryNavigation = isHistoryNavigationRef.current;
    isHistoryNavigationRef.current = false;

    // First commit: leave the browser's own restore and any hash target alone.
    if (previousPathname === null || previousPathname === pathname) {
      return;
    }

    if (wasHistoryNavigation || window.location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
