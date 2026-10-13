'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { canonicalizeAppHref, canonicalizeAppPath } from '@/lib/navigation/canonical-app-path';
import { buildLocationHref, hrefsMatch, normalizeHref } from '@/lib/navigation/normalize-href';
import { resolveRouteSkeleton } from '@/lib/navigation/resolve-route-skeleton';

const PENDING_TIMEOUT_MS = 12_000;
/** Wait before painting the overlay so cached / fast navigations do not flash a skeleton. */
const PENDING_SHOW_MS = 180;

interface PendingNavigation {
  href: string;
  /**
   * Same-pathname, search-only navigations (e.g. home `/?category=`) must not
   * auto-clear when the URL matches — the RSC body can still be loading.
   * Cleared via {@link NavigationPendingContextValue.clearNavigation} or timeout.
   */
  holdUntilManual: boolean;
}

interface NavigationPendingContextValue {
  pendingHref: string | null;
  /**
   * Mark soft navigation as pending so the destination skeleton overlays the current page.
   *
   * Same-pathname search-only targets hold the overlay until {@link clearNavigation}
   * or the safety timeout. Pathname changes still auto-clear when the location matches.
   *
   * @param href - Target href; no-ops for same URL / unparseable external targets.
   */
  startNavigation: (href: string) => void;
  /** Clear any pending overlay. */
  clearNavigation: () => void;
}

const NavigationPendingContext = createContext<NavigationPendingContextValue | null>(null);

/**
 * Tracks soft-navigation pending state and overlays the destination-shaped skeleton.
 */
export function NavigationPendingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearNavigation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (showDelayRef.current) {
      clearTimeout(showDelayRef.current);
      showDelayRef.current = null;
    }
    setShowOverlay(false);
    setPending(null);
  }, []);

  const startNavigation = useCallback(
    (href: string) => {
      const canonicalHref = canonicalizeAppHref(href);
      const normalized = normalizeHref(canonicalHref);
      if (!normalized) {
        return;
      }

      const current = buildLocationHref(
        pathname,
        searchParams.toString() ? `?${searchParams}` : '',
      );
      const target = `${normalized.pathname}${normalized.search}`;
      if (hrefsMatch(current, target)) {
        return;
      }

      const holdUntilManual =
        normalized.pathname === pathname &&
        normalized.search !== (searchParams.toString() ? `?${searchParams}` : '');

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (showDelayRef.current) {
        clearTimeout(showDelayRef.current);
      }
      setShowOverlay(false);
      setPending({ href: target, holdUntilManual });
      showDelayRef.current = setTimeout(() => {
        setShowOverlay(true);
        showDelayRef.current = null;
      }, PENDING_SHOW_MS);
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        clearNavigation();
      }, PENDING_TIMEOUT_MS);
    },
    [clearNavigation, pathname, searchParams],
  );

  const currentHref = buildLocationHref(
    pathname,
    searchParams.toString() ? `?${searchParams}` : '',
  );
  const pendingPathname = pending ? normalizeHref(pending.href)?.pathname : null;
  const pathnameMatchesPending =
    pendingPathname != null &&
    canonicalizeAppPath(pendingPathname) === canonicalizeAppPath(pathname);
  // Pathname arrival is enough for cross-route nav — cart UTM rewrite must not keep the overlay.
  const locationMatchesPending =
    pending != null &&
    (hrefsMatch(currentHref, pending.href) || (!pending.holdUntilManual && pathnameMatchesPending));
  const pendingHref =
    pending && (pending.holdUntilManual || !locationMatchesPending) ? pending.href : null;

  // Swipe-back / bfcache restore must drop the overlay or the next tap stays blocked.
  useEffect(() => {
    const handlePopState = (): void => {
      clearNavigation();
    };
    const handlePageShow = (event: PageTransitionEvent): void => {
      if (event.persisted) {
        clearNavigation();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [clearNavigation]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (showDelayRef.current) {
        clearTimeout(showDelayRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({ pendingHref, startNavigation, clearNavigation }),
    [pendingHref, startNavigation, clearNavigation],
  );

  return (
    <NavigationPendingContext.Provider value={value}>
      {children}
      {pendingHref && showOverlay ? (
        <div
          className="bg-palmonas-surface fixed inset-0 z-[90] overflow-y-auto"
          aria-busy="true"
          aria-live="polite"
          data-testid="navigation-pending-overlay"
        >
          {resolveRouteSkeleton(pendingHref)}
        </div>
      ) : null}
    </NavigationPendingContext.Provider>
  );
}

/**
 * Access soft-navigation pending controls.
 *
 * @throws If used outside {@link NavigationPendingProvider}.
 */
export function useNavigationPending(): NavigationPendingContextValue {
  const context = useContext(NavigationPendingContext);
  if (!context) {
    throw new Error('useNavigationPending must be used within NavigationPendingProvider');
  }
  return context;
}
