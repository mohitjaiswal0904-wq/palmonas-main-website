'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import { buildClickAnalyticsEvent } from '@/lib/analytics/build-click-analytics-event';
import { isModifiedClick } from '@/lib/navigation/is-modified-click';

/**
 * Delegates click tracking for buttons, links, and tagged interactive elements.
 */
export function AnalyticsInteractionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  // Delegated listener — captures all interactive clicks without per-component wiring.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event)) {
        return;
      }

      const detail = buildClickAnalyticsEvent(event.target, {
        pathname,
        search,
      });

      if (!detail) {
        return;
      }

      void trackAnalyticsEvent(detail).catch(() => {
        // ponytail: tracking failures must not affect UI interactions.
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname, search]);

  return null;
}
