'use client';

import { useEffect } from 'react';

import { bootstrapWebEngageIfReady } from '@/lib/analytics/bootstrap-webengage';
import { isWebEngageAnalyticsEnabled } from '@/lib/env';

/** Loads WebEngage after validating host support and remote SDK config. */
export function WebEngageAnalyticsScript() {
  useEffect(() => {
    if (!isWebEngageAnalyticsEnabled()) {
      return;
    }

    void bootstrapWebEngageIfReady();
  }, []);

  return null;
}
