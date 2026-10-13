'use client';

import { useEffect, useRef, useState, type ReactNode, type TransitionEvent } from 'react';

import { minWidthQuery } from '@/config/breakpoints';
import { registerSearchMobileSlideExit } from '@/lib/search/search-mobile-slide';
import { cn } from '@/lib/utils/cn';

/** Mobile slide duration in ms — keep in sync with `duration-200`. */
export const SEARCH_MOBILE_SLIDE_MS = 200;

type SlidePhase = 'closed' | 'open' | 'open-settled' | 'closing';

interface SearchMobileSlideShellProps {
  children: ReactNode;
}

/**
 * Mobile-only sheet: slides up from the bottom on enter, down on exit.
 * Desktop renders children in normal document flow with no transition.
 */
export function SearchMobileSlideShell({ children }: SearchMobileSlideShellProps) {
  const [phase, setPhase] = useState<SlidePhase>('closed');
  // Non-null only while an exit is in flight, so it doubles as the "already closing" flag.
  const pendingNavigateRef = useRef<(() => void) | null>(null);
  const exitFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Defer the open transform by a frame so the initial off-screen paint can apply.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('open'));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  // Register exit so the search header back control can slide down before navigating.
  useEffect(() => {
    return registerSearchMobileSlideExit((navigate) => {
      if (typeof window !== 'undefined' && window.matchMedia(minWidthQuery('laptop')).matches) {
        navigate();
        return true;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate();
        return true;
      }

      if (pendingNavigateRef.current) {
        pendingNavigateRef.current = navigate;
        return true;
      }

      pendingNavigateRef.current = navigate;
      setPhase('closing');

      if (exitFallbackRef.current) {
        clearTimeout(exitFallbackRef.current);
      }
      // ponytail: transitionend can miss under rapid remounts — timeout still navigates.
      exitFallbackRef.current = setTimeout(() => {
        const pending = pendingNavigateRef.current;
        pendingNavigateRef.current = null;
        pending?.();
      }, SEARCH_MOBILE_SLIDE_MS + 50);

      return true;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (exitFallbackRef.current) {
        clearTimeout(exitFallbackRef.current);
      }
    };
  }, []);

  /** Finish exit after the transform settles, then run the deferred navigation. */
  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    // Ignore non-transform transitions if the browser reports a property name.
    if (event.propertyName && event.propertyName !== 'transform') {
      return;
    }

    // Once the enter transition completes, move to 'open-settled' to remove the CSS
    // transform. This prevents the transform property from acting as a containing block,
    // which allows fixed-position descendants (like the bottom sort/filter bar) to position
    // themselves relative to the viewport.
    if (phase === 'open') {
      setPhase('open-settled');
      return;
    }

    if (!pendingNavigateRef.current) {
      return;
    }

    if (exitFallbackRef.current) {
      clearTimeout(exitFallbackRef.current);
      exitFallbackRef.current = null;
    }

    const pending = pendingNavigateRef.current;
    pendingNavigateRef.current = null;
    pending?.();
  }

  const hasTransform = phase !== 'open-settled';

  return (
    <div
      className={cn(
        'bg-white',
        'z-modal fixed inset-0 flex flex-col overflow-hidden overscroll-contain',
        hasTransform && 'will-change-transform motion-reduce:transition-none',
        hasTransform && 'transition-transform duration-200',
        phase === 'closing' ? 'ease-in' : 'ease-out',
        phase === 'closed' || phase === 'closing' ? 'translate-y-full' : '',
        phase === 'open' ? 'translate-y-0' : '',
        'laptop:static laptop:z-auto laptop:translate-y-0 laptop:overflow-visible laptop:transition-none laptop:will-change-auto',
      )}
      data-testid="search-mobile-slide-shell"
      data-slide-phase={phase}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}
