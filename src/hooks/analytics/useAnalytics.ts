'use client';

import { useCallback } from 'react';

import { analyticsClickPropertyKeys } from '@/config/analytics/analytics.config';
import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import type { AnalyticsEventDetail, AnalyticsPropertyValue } from '@/types/analytics';

export interface TrackClickOptions {
  /** Named canonical event — generic `click` is not sent to Mixpanel. */
  eventName: string;
  properties?: Record<string, AnalyticsPropertyValue>;
}

/**
 * Exposes imperative analytics tracking for hooks and client components.
 *
 * @returns Stable `track` and `trackClick` helpers backed by the shared analytics client.
 */
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEventDetail) => {
    void trackAnalyticsEvent(event).catch(() => {
      // ponytail: tracking failures must not affect UI flows.
    });
  }, []);

  const trackClick = useCallback(
    (label: string, options: TrackClickOptions) => {
      track({
        name: options.eventName,
        properties: {
          [analyticsClickPropertyKeys.label]: label,
          ...options.properties,
        },
      });
    },
    [track],
  );

  return { track, trackClick };
}
