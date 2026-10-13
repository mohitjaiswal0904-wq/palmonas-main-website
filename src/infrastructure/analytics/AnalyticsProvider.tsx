'use client';

import { Suspense, useEffect, type ReactNode } from 'react';

import { AnalyticsInteractionTracker } from '@/infrastructure/analytics/AnalyticsInteractionTracker';
import { AnalyticsPageViewTracker } from '@/infrastructure/analytics/AnalyticsPageViewTracker';
import { AnalyticsScripts } from '@/infrastructure/analytics/AnalyticsScripts';
import { AnalyticsScrollDepthTracker } from '@/infrastructure/analytics/AnalyticsScrollDepthTracker';
import { analyticsClient } from '@/infrastructure/analytics/analytics-client';

interface AnalyticsProviderProps {
  children: ReactNode;
}

/** Loads analytics SDK scripts and initializes configured vendor clients. */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Mixpanel + Clarity use npm SDKs; GTM/GA4 bootstrap in root layout; other pixels via AnalyticsScripts.
  useEffect(() => {
    void analyticsClient.initialize().catch(() => {
      // ponytail: init errors are non-fatal — tracking calls no-op when SDKs fail to load.
    });
  }, []);

  return (
    <>
      <AnalyticsScripts />
      <Suspense fallback={null}>
        <AnalyticsPageViewTracker />
        <AnalyticsScrollDepthTracker />
        <AnalyticsInteractionTracker />
      </Suspense>
      {children}
    </>
  );
}
