'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import {
  attachNamedHorizontalScrollTracking,
  type NamedHorizontalScrollOptions,
} from '@/lib/analytics/named-horizontal-scroll';
import { cn } from '@/lib/utils/cn';

interface NamedHorizontalScrollTrackProps extends NamedHorizontalScrollOptions {
  className?: string;
  children: ReactNode;
  role?: string;
  ariaLabel?: string;
  tabIndex?: number;
}

/**
 * Scroll container that emits one named analytics event per horizontal swipe burst.
 */
export function NamedHorizontalScrollTrack({
  eventName,
  sectionName,
  pageName,
  className,
  children,
  role,
  ariaLabel,
  tabIndex,
}: NamedHorizontalScrollTrackProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return undefined;
    }

    return attachNamedHorizontalScrollTracking(el, { eventName, sectionName, pageName });
  }, [eventName, pageName, sectionName]);

  return (
    <div ref={ref} className={cn(className)} role={role} aria-label={ariaLabel} tabIndex={tabIndex}>
      {children}
    </div>
  );
}
