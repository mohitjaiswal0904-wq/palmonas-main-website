'use client';

import { useLayoutEffect } from 'react';

import type { AnalyticsPageContext } from '@/config/analytics/analytics.config';
import {
  clearAnalyticsPageContext,
  setAnalyticsPageContext,
} from '@/lib/analytics/analytics-page-context';

/** Publishes SSR-known page metadata before route analytics effects run. */
export function AnalyticsPageContextSync({
  pageType,
  collectionName,
  collectionHandle,
  productName,
  productHandle,
}: AnalyticsPageContext) {
  // useLayoutEffect so collection/product names are available before page_view useEffect.
  useLayoutEffect(() => {
    setAnalyticsPageContext({
      pageType,
      collectionName,
      collectionHandle,
      productName,
      productHandle,
    });

    return () => {
      clearAnalyticsPageContext();
    };
  }, [pageType, collectionName, collectionHandle, productName, productHandle]);

  return null;
}
