'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

const DEFAULT_OFFSET = 16;
const DEFAULT_HIDE_DISTANCE = 72;
const DEFAULT_TOLERANCE = 12;
const DEFAULT_SETTLE_MS = 0;

interface UseRevealOnScrollUpOptions {
  /** When false, the hook stays fully visible and skips scroll listeners. */
  enabled?: boolean;
  /** Scroll offset from top where the element stays fully visible. */
  offset?: number;
  /** Downward scroll distance required to fully hide (proportional mode) or snap hidden (snap mode). */
  hideDistance?: number;
  /** Upward scroll distance required to snap visible in snap mode. */
  revealDistance?: number;
  /** Ignore scroll deltas smaller than this to absorb enter/iOS chrome jitter. */
  tolerance?: number;
  /** After a snap, ignore scroll for this many ms so header height changes cannot retrigger. */
  settleMs?: number;
  /** When true, visibility snaps to 0 or 1 from scroll direction instead of tracking pixels. */
  snap?: boolean;
}

/**
 * Resolves header visibility for the current scroll position before any scroll events fire.
 *
 * @param scrollY - Current document scroll offset.
 * @param offset - Top offset where the chrome stays fully visible.
 * @param snap - Whether visibility snaps instead of tracking proportional scroll distance.
 */
function resolveInitialVisibility(scrollY: number, offset: number, snap: boolean): number {
  if (scrollY <= offset) {
    return 1;
  }

  return snap ? 0 : 1;
}

/**
 * Returns scroll-linked visibility for a collapsible header region (1 = fully visible).
 *
 * @param options - Enable flag, snap/proportional mode, and scroll thresholds.
 * @returns Visibility ratio from 0 to 1; decreases while scrolling down and increases while scrolling up.
 */
export function useRevealOnScrollUp(options: UseRevealOnScrollUpOptions = {}): number {
  const {
    enabled = true,
    offset = DEFAULT_OFFSET,
    hideDistance = DEFAULT_HIDE_DISTANCE,
    revealDistance = Math.max(options.tolerance ?? DEFAULT_TOLERANCE, Math.round(hideDistance / 2)),
    tolerance = DEFAULT_TOLERANCE,
    settleMs = DEFAULT_SETTLE_MS,
    snap = false,
  } = options;
  const lastScrollY = useRef(0);
  const visibilityRef = useRef(1);
  const initializedRef = useRef(false);
  const snapScrollAccumulator = useRef(0);
  const snapScrollDirection = useRef<'down' | 'up' | null>(null);
  const ignoreUntilRef = useRef(0);

  const resetSnapAccumulator = useCallback(() => {
    snapScrollAccumulator.current = 0;
    snapScrollDirection.current = null;
  }, []);

  const armSettleLock = useCallback(() => {
    if (settleMs > 0) {
      ignoreUntilRef.current = performance.now() + settleMs;
    }
  }, [settleMs]);

  const syncFromScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const scrollY = window.scrollY;
    lastScrollY.current = scrollY;
    visibilityRef.current = resolveInitialVisibility(scrollY, offset, snap);
    resetSnapAccumulator();
    ignoreUntilRef.current = 0;
    initializedRef.current = true;
  }, [offset, resetSnapAccumulator, snap]);

  const getSnapshot = useCallback(() => {
    if (!enabled) {
      return 1;
    }

    if (typeof window !== 'undefined' && !initializedRef.current) {
      syncFromScrollPosition();
    }

    return visibilityRef.current;
  }, [enabled, syncFromScrollPosition]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!enabled) {
        return () => undefined;
      }

      if (!initializedRef.current) {
        const previousVisibility = visibilityRef.current;
        syncFromScrollPosition();

        if (visibilityRef.current !== previousVisibility) {
          onStoreChange();
        }
      } else if (typeof window !== 'undefined') {
        lastScrollY.current = window.scrollY;
      }

      const syncAfterRestore = () => {
        const nextVisibility = resolveInitialVisibility(window.scrollY, offset, snap);
        lastScrollY.current = window.scrollY;
        resetSnapAccumulator();
        ignoreUntilRef.current = 0;

        if (nextVisibility === visibilityRef.current) {
          return;
        }

        visibilityRef.current = nextVisibility;
        onStoreChange();
      };

      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (performance.now() < ignoreUntilRef.current) {
          lastScrollY.current = currentScrollY;
          return;
        }

        let nextVisibility = visibilityRef.current;

        if (currentScrollY <= offset) {
          nextVisibility = 1;
          resetSnapAccumulator();
        } else {
          const delta = currentScrollY - lastScrollY.current;

          if (Math.abs(delta) < tolerance) {
            lastScrollY.current = currentScrollY;
            return;
          }

          if (snap) {
            const direction: 'down' | 'up' = delta > 0 ? 'down' : 'up';

            if (snapScrollDirection.current !== direction) {
              snapScrollDirection.current = direction;
              snapScrollAccumulator.current = 0;
            }

            snapScrollAccumulator.current += Math.abs(delta);

            if (
              direction === 'down' &&
              snapScrollAccumulator.current >= hideDistance &&
              nextVisibility > 0
            ) {
              nextVisibility = 0;
              resetSnapAccumulator();
            } else if (
              direction === 'up' &&
              snapScrollAccumulator.current >= revealDistance &&
              nextVisibility < 1
            ) {
              nextVisibility = 1;
              resetSnapAccumulator();
            }
          } else {
            nextVisibility = Math.min(1, Math.max(0, nextVisibility - delta / hideDistance));
          }
        }

        lastScrollY.current = currentScrollY;

        if (nextVisibility !== visibilityRef.current) {
          visibilityRef.current = nextVisibility;
          armSettleLock();
          onStoreChange();
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('pageshow', syncAfterRestore);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('pageshow', syncAfterRestore);
      };
    },
    [
      armSettleLock,
      enabled,
      hideDistance,
      offset,
      revealDistance,
      resetSnapAccumulator,
      snap,
      syncFromScrollPosition,
      tolerance,
    ],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 1);
}
