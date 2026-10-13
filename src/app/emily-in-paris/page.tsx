import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { EmilyInParisPageContent, EmilyInParisPageSkeleton } from '@/components/emily-in-paris';
import { EmilyInParisStaticSections } from '@/components/emily-in-paris/EmilyInParisStaticSections';
import { EMILY_IN_PARIS_PAGE_ROOT_CLASS } from '@/components/emily-in-paris/emily-in-paris-constants';
import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import {
  EMILY_IN_PARIS_COLLECTION_HANDLE,
  EMILY_IN_PARIS_PAGE_PATH,
} from '@/config/emily-in-paris.config';
import { isAppError } from '@/lib/errors';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  parseCollectionSearchParams,
  serializeCollectionSearchParams,
} from '@/lib/utils/collection-search-params';
import { getCollectionPageServerData } from '@/services/server/collection-page.service.server';
import { getCollectionByHandle } from '@/services/server/collection.service.server';

interface EmilyInParisPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Shared app-shell prefetch — listing body streams after navigation. */
export const prefetch = 'partial';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const collection = await getCollectionByHandle(EMILY_IN_PARIS_COLLECTION_HANDLE);

    return buildMetadata({
      title: 'Emily In Paris',
      description:
        collection.description ??
        'Discover Parisian-inspired Demifine® jewellery from the Emily in Paris x Palmonas collection.',
      path: EMILY_IN_PARIS_PAGE_PATH,
      ogImage: collection.image,
    });
  } catch {
    return buildMetadata({
      title: 'Emily In Paris',
      path: EMILY_IN_PARIS_PAGE_PATH,
      description:
        'Discover Parisian-inspired Demifine® jewellery from the Emily in Paris x Palmonas collection.',
    });
  }
}

async function EmilyInParisPageBody({ searchParams }: EmilyInParisPageProps) {
  const resolvedSearchParams = await searchParams;
  const { filters, sort, page } = parseCollectionSearchParams(resolvedSearchParams);

  let serverData;

  try {
    serverData = await getCollectionPageServerData(EMILY_IN_PARIS_COLLECTION_HANDLE, {
      filters,
      sort,
      page,
    });
  } catch (err) {
    if (isAppError(err) && err.code === 'NOT_FOUND') {
      notFound();
    }

    throw err;
  }

  if (serverData.productsPages.length === 0) {
    notFound();
  }

  return (
    <main className={EMILY_IN_PARIS_PAGE_ROOT_CLASS}>
      <EmilyInParisStaticSections />
      <EmilyInParisPageContent
        key={serializeCollectionSearchParams(serverData.filters, serverData.sort)}
        handle={EMILY_IN_PARIS_COLLECTION_HANDLE}
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
    </main>
  );
}

/** Listing chrome streams in-page — no route `loading.tsx` (soft-nav hang). */
export default function EmilyInParisPage(props: EmilyInParisPageProps) {
  return (
    <StreamingPageShell mainFallback={<EmilyInParisPageSkeleton />}>
      <EmilyInParisPageBody {...props} />
    </StreamingPageShell>
  );
}
