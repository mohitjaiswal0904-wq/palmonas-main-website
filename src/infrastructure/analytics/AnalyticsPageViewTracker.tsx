'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import {
  setAnalyticsSuperProperties,
  trackAnalyticsEvent,
} from '@/infrastructure/analytics/analytics-client';
import { buildRouteAnalyticsEvent } from '@/lib/analytics/build-route-analytics-event';

let lastTrackedRouteKey: string | null = null;

/**
 * Clears the route-view dedupe key. Tests only.
 */
export function resetRouteAnalyticsDedupe(): void {
  lastTrackedRouteKey = null;
}

/**
 * Sends semantic screen/view events on App Router route changes.
 * Also fires the Google Ads Page View conversion (`…/5h6uCN3igaMDEL_C1bgo`).
 */
export function AnalyticsPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  // Track SPA navigations with semantic view events (PDP Viewed, PLP Viewed, etc.).
  useEffect(() => {
    const routeKey = `${pathname}?${search}`;

    if (lastTrackedRouteKey === routeKey) {
      return;
    }

    const priorPathname = lastTrackedRouteKey?.split('?')[0];
    lastTrackedRouteKey = routeKey;

    const semanticEvent = buildRouteAnalyticsEvent({
      pathname,
      search,
      previousPathname: priorPathname,
    });

    const pageName =
      typeof semanticEvent.properties?.screen_name === 'string'
        ? semanticEvent.properties.screen_name
        : pathname;

    setAnalyticsSuperProperties({
      platform: 'web',
      page_name: pageName,
    });

    void trackAnalyticsEvent(semanticEvent).catch(() => {
      // ponytail: page-view tracking failures must not block rendering.
    });

    // Google Ads Shopping App Page View conversion (label 5h6uCN3igaMDEL_C1bgo).
    void trackAnalyticsEvent({
      name: analyticsCanonicalEvents.pageView,
      properties: {
        path: pathname,
        ...(search ? { search } : {}),
      },
      value: 1,
      currency: 'INR',
    }).catch(() => {
      // ponytail: Ads page_view failures must not block rendering.
    });
  }, [pathname, search]);

  return null;
}
