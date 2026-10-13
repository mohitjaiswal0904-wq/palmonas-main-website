'use client';

import { useEffect, type RefObject } from 'react';

import { attachHorizontalMouseScroll } from '@/lib/layout/horizontal-mouse-scroll';

/**
 * Attach mouse-drag and non-vertical wheel scrolling to a horizontal overflow rail.
 *
 * @param ref - Overflow-x container already rendered by the host component
 * @param enabled - When false, no listener is attached
 */
export function useHorizontalMouseScroll(ref: RefObject<HTMLElement | null>, enabled = true): void {
  // Bind after mount so the overflow node exists; skip touch so PW-567 swipe still works.
  useEffect(() => {
    const el = ref.current;

    if (!el || !enabled) {
      return undefined;
    }

    return attachHorizontalMouseScroll(el);
  }, [enabled, ref]);
}
