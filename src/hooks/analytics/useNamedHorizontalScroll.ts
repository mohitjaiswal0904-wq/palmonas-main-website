'use client';

import { useEffect, type RefObject } from 'react';

import {
  attachNamedHorizontalScrollTracking,
  type NamedHorizontalScrollOptions,
} from '@/lib/analytics/named-horizontal-scroll';

/**
 * Attaches one named analytics event per horizontal swipe burst on a scroll ref.
 *
 * @param ref - Overflow-x container already rendered by the host component.
 * @param options - Canonical event name and section identifier.
 * @param enabled - When false, no listener is attached.
 */
export function useNamedHorizontalScroll(
  ref: RefObject<HTMLElement | null>,
  options: NamedHorizontalScrollOptions,
  enabled = true,
): void {
  const { eventName, pageName, sectionName } = options;

  useEffect(() => {
    const el = ref.current;

    if (!el || !enabled) {
      return undefined;
    }

    return attachNamedHorizontalScrollTracking(el, { eventName, pageName, sectionName });
  }, [enabled, eventName, pageName, ref, sectionName]);
}
