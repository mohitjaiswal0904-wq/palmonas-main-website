import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CollectionPageAnalytics } from '@/components/analytics/CollectionPageAnalytics';
import { CollectionBanner } from '@/components/collection/CollectionBanner';
import { CollectionPageContent } from '@/components/collection/CollectionPageContent';
import { CollectionPageSkeleton } from '@/components/collection/CollectionPageSkeleton';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { productListingMessages } from '@/config/product-listing/product-listing.config';
import { isAppError } from '@/lib/errors';
import { isTransientAppError } from '@/lib/query/retry';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  parseCollectionSearchParams,
  serializeCollectionSearchParams,
} from '@/lib/utils/collection-search-params';
import { getCollectionPageServerData } from '@/services/server/collection-page.service.server';
import { getCollectionByHandle } from '@/services/server/collection.service.server';

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Shared app-shell prefetch — URL data (handle) streams after navigation. */
export const prefetch = 'partial';

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;

  try {
    const collection = await getCollectionByHandle(handle);

    return buildMetadata({
      title: collection.title,
      description: collection.description,
      path: `/collections/${handle}`,
      ogImage: collection.image,
    });
  } catch {
    return buildMetadata({ title: 'Collection', path: `/collections/${handle}` });
  }
}

async function CollectionPageBody({ params, searchParams }: CollectionPageProps) {
  const { handle } = await params;
  const resolvedSearchParams = await searchParams;
  const { filters, sort, page } = parseCollectionSearchParams(resolvedSearchParams);

  let serverData;

  try {
    serverData = await getCollectionPageServerData(handle, { filters, sort, page });
  } catch (err) {
    if (isAppError(err) && err.code === 'NOT_FOUND') {
      notFound();
    }

    if (isTransientAppError(err)) {
      return (
        <ResourceNotFound
          kicker={productListingMessages.loadErrorKicker}
          title={productListingMessages.loadErrorTitle}
          description={productListingMessages.loadErrorDescription}
          ctaHref={`/collections/${handle}`}
          ctaLabel={productListingMessages.loadErrorCta}
        />
      );
    }

    throw err;
  }

  if (serverData.productsPages.length === 0) {
    notFound();
  }

  return (
    <>
      <CollectionPageAnalytics collection={serverData.collection} />
      <CollectionBanner collection={serverData.collection} />
      <CollectionPageContent
        key={serializeCollectionSearchParams(serverData.filters, serverData.sort)}
        handle={handle}
        initialFilters={serverData.filters}
        initialSort={serverData.sort}
        initialData={{
          collection: serverData.collection,
          productsPages: serverData.productsPages,
          productsPageSize: serverData.productsPageSize,
          loadedPageCount: serverData.loadedPageCount,
          hasMoreProducts: serverData.hasMoreProducts,
          filters: serverData.filters,
          sort: serverData.sort,
          filterGroups: serverData.filterGroups,
        }}
      />
    </>
  );
}

/**
 * Collection listing — chrome streams ahead of catalog SSR.
 * No route `loading.tsx`: Cache Components + that file leaves the skeleton stuck
 * after soft-nav. `StreamingPageShell` already owns the fallback.
 */
export default function CollectionPage(props: CollectionPageProps) {
  return (
    <StreamingPageShell mainFallback={<CollectionPageSkeleton />}>
      <CollectionPageBody {...props} />
    </StreamingPageShell>
  );
}
