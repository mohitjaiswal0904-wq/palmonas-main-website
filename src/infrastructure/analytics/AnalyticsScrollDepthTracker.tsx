'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import { pathnameToScreenName } from '@/lib/analytics/build-route-analytics-event';

const DEPTH_PERCENT_MARKS = [25, 50, 75, 100] as const;

/**
 * Fires `page_scrolled` once per 25/50/75/100% depth on each route.
 */
export function AnalyticsScrollDepthTracker() {
  const pathname = usePathname();
  const firedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedRef.current = new Set();
  }, [pathname]);

  useEffect(() => {
    const onScroll = (): void => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      if (scrollable <= 0) {
        return;
      }

      const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

      for (const mark of DEPTH_PERCENT_MARKS) {
        if (percent < mark || firedRef.current.has(mark)) {
          continue;
        }

        firedRef.current.add(mark);
        void trackAnalyticsEvent({
          name: analyticsCanonicalEvents.pageScrolled,
          properties: {
            depth_percent: mark,
            page_name: pathnameToScreenName(pathname),
            path: pathname,
          },
        }).catch(() => {
          // ponytail: depth tracking must not affect scroll.
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  return null;
}
