'use client';

import { AnalyticsPageContextSync } from '@/components/analytics/AnalyticsPageContextSync';
import type { Collection } from '@/types/collection';

interface CollectionPageAnalyticsProps {
  collection: Pick<Collection, 'title' | 'handle'>;
}

/** Attaches collection metadata to analytics events on collection pages. */
export function CollectionPageAnalytics({ collection }: CollectionPageAnalyticsProps) {
  return (
    <AnalyticsPageContextSync
      pageType="collection"
      collectionName={collection.title}
      collectionHandle={collection.handle}
    />
  );
}
