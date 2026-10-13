import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import {
  ShraddhasFavouritePageContent,
  ShraddhasFavouritePageSkeleton,
} from '@/components/shraddhas-favourite';
import {
  SHRADDHAS_FAVOURITE_LOOK_PRODUCT_COUNT,
  SHRADDHAS_FAVOURITE_SIGNATURE_PRODUCT_COUNT,
} from '@/components/shraddhas-favourite/shraddhas-favourite-constants';
import {
  SHRADDHAS_FAVOURITE_HANDLE,
  SHRADDHAS_FAVOURITE_PAGE_PATH,
  SHRADDHAS_LOOK_COLLECTION_HANDLE,
} from '@/config/shraddhas-favourite.config';
import { isAppError } from '@/lib/errors';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  parseCollectionSearchParams,
  serializeCollectionSearchParams,
} from '@/lib/utils/collection-search-params';
import { getCollectionPageServerData } from '@/services/server/collection-page.service.server';
import {
  getCollectionByHandle,
  getCollectionProducts,
} from '@/services/server/collection.service.server';
import type { Product } from '@/types/product';

interface ShraddhasFavouritePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Shared app-shell prefetch — listing body streams after navigation. */
export const prefetch = 'partial';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const collection = await getCollectionByHandle(SHRADDHAS_FAVOURITE_HANDLE);

    return buildMetadata({
      title: "Shraddha's Favourite",
      description:
        collection.description ??
        "Explore Shraddha Kapoor's personal edit of Palmonas Demifine® jewellery.",
      path: SHRADDHAS_FAVOURITE_PAGE_PATH,
      ogImage: collection.image,
    });
  } catch {
    return buildMetadata({
      title: "Shraddha's Favourite",
      path: SHRADDHAS_FAVOURITE_PAGE_PATH,
      description: "Explore Shraddha Kapoor's personal edit of Palmonas Demifine® jewellery.",
    });
  }
}

async function ShraddhasFavouritePageBody({ searchParams }: ShraddhasFavouritePageProps) {
  const resolvedSearchParams = await searchParams;
  const { filters, sort, page } = parseCollectionSearchParams(resolvedSearchParams);

  let serverData;

  try {
    serverData = await getCollectionPageServerData(SHRADDHAS_FAVOURITE_HANDLE, {
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

  const signatureProducts =
    serverData.productsPages[0]?.items.slice(0, SHRADDHAS_FAVOURITE_SIGNATURE_PRODUCT_COUNT) ?? [];

  let lookProducts: Product[] = [];

  try {
    const lookData = await getCollectionProducts(SHRADDHAS_LOOK_COLLECTION_HANDLE, {
      limit: SHRADDHAS_FAVOURITE_LOOK_PRODUCT_COUNT,
    });
    lookProducts = lookData.items;
  } catch {
    lookProducts = [];
  }

  return (
    <ShraddhasFavouritePageContent
      key={serializeCollectionSearchParams(serverData.filters, serverData.sort)}
      handle={SHRADDHAS_FAVOURITE_HANDLE}
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
      signatureProducts={signatureProducts}
      lookProducts={lookProducts}
    />
  );
}

/** Listing chrome streams in-page — no route `loading.tsx` (soft-nav hang). */
export default function ShraddhasFavouritePage(props: ShraddhasFavouritePageProps) {
  return (
    <StreamingPageShell mainFallback={<ShraddhasFavouritePageSkeleton />}>
      <ShraddhasFavouritePageBody {...props} />
    </StreamingPageShell>
  );
}
