'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ProductCarousel } from '@/components/global/product-listing/ProductCarousel';
import {
  SEARCH_MOST_LOVED_COLLECTION_HANDLE,
  SEARCH_MOST_LOVED_LIMIT,
  searchMessages,
} from '@/config/search/search.config';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import { getCollectionProducts } from '@/services/collection.service';

const STALE_TIME = 1000 * 60 * 5;

/** Skeleton while most-loved products load. */
function SearchMostLovedSkeleton() {
  return (
    <div
      className="flex flex-col gap-3"
      aria-busy="true"
      aria-label={searchMessages.a11y.mostLovedLoading}
    >
      <div className="h-4 w-28 animate-pulse rounded bg-[#f1f5f9]" />
      <div className="laptop:gap-0 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="laptop:h-[280px] laptop:w-[20vw] laptop:max-w-none h-[220px] w-[158px] shrink-0 animate-pulse border border-black/10 bg-[#f1f5f9]"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Empty-search “Most Loved” rail from bestsellers (Figma 2704:55554).
 */
export function SearchMostLovedSection() {
  const handle = SEARCH_MOST_LOVED_COLLECTION_HANDLE;
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.collections.products(handle, { page: 1, limit: SEARCH_MOST_LOVED_LIMIT }),
    queryFn: () => getCollectionProducts(handle, { page: 1, limit: SEARCH_MOST_LOVED_LIMIT }),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  if (isLoading) {
    return <SearchMostLovedSkeleton />;
  }

  if (error || !data?.items.length) {
    return null;
  }

  const viewAllHref = resolveCollectionPagePath(handle);

  return (
    <section
      className="flex w-full flex-col items-center gap-3"
      aria-label={searchMessages.a11y.mostLovedSection}
    >
      <h2 className="w-full text-center text-base font-medium text-[#151515] capitalize">
        {searchMessages.labels.mostLoved}
      </h2>
      <ProductCarousel
        products={data.items}
        ariaLabel={searchMessages.labels.mostLoved}
        className="laptop:w-full laptop:max-w-full mt-0 w-[100vw] max-w-none"
        itemClassName="w-[158px] max-w-[158px] min-w-[158px] shrink-0 snap-start tab:w-[25vw] laptop:w-[20vw] laptop:max-w-none laptop:min-w-0"
        showOfferPromo
        compactOfferPromo
      />
      <Link
        href={viewAllHref}
        className="mt-1 inline-flex items-center justify-center rounded-md border border-[#D6D6D6] px-10 py-2.5 text-sm font-medium text-[#151515] transition-colors hover:border-[#151515]"
        aria-label={searchMessages.a11y.viewAllMostLoved}
      >
        {searchMessages.labels.viewAll}
      </Link>
    </section>
  );
}
