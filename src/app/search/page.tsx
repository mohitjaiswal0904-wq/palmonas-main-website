import type { Metadata } from 'next';

import { StreamingPageShell } from '@/components/layout/StreamingPageShell';
import { SearchPageContent, SearchPageSkeleton } from '@/components/search';
import { buildMetadata } from '@/lib/seo/build-metadata';
import {
  resolveSearchPageMetadataQuery,
  resolveSearchPageRequest,
} from '@/lib/utils/search-page-request';
import { serializeSearchSearchParams } from '@/lib/utils/search-search-params';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Shared app-shell prefetch — results stream after navigation. */
export const prefetch = 'partial';

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = await resolveSearchPageMetadataQuery(searchParams);

  if (!query) {
    return buildMetadata({
      title: 'Search',
      path: '/search',
      description: 'Search Palmonas products, collections, and categories.',
    });
  }

  return buildMetadata({
    title: `Search results for ${query}`,
    path: `/search?${serializeSearchSearchParams(query, {}, 'featured')}`,
    description: `Find Palmonas jewellery for ${query}.`,
    noIndex: true,
  });
}

async function SearchPageBody({ searchParams }: SearchPageProps) {
  const {
    query,
    filters,
    sort,
    searchResults,
    suggestions,
    contentKey,
    hasLegacyPaginationParams,
  } = await resolveSearchPageRequest(searchParams);

  return (
    <SearchPageContent
      key={contentKey}
      query={query}
      filters={searchResults?.filters ?? filters}
      sort={searchResults?.sort ?? sort}
      searchResults={searchResults}
      suggestions={suggestions}
      hasLegacyPaginationParams={hasLegacyPaginationParams}
    />
  );
}

/** No route `loading.tsx` — swipe-back must not replace the last results with a chrome skeleton. */
export default function SearchPage(props: SearchPageProps) {
  return (
    <StreamingPageShell showFooter={false} mainFallback={<SearchPageSkeleton />}>
      <SearchPageBody {...props} />
    </StreamingPageShell>
  );
}
