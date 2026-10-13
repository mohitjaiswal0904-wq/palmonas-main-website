'use client';

import { CollectionGridIcon, SearchIcon } from '@/components/icons';
import { SEARCH_RECENT_SKELETON_ROWS } from '@/components/search/search-constants';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';
import { AppLink } from '@/components/ui/AppLink';
import { searchMessages } from '@/config/search/search.config';
import { cn } from '@/lib/utils/cn';
import { buildCollectionPagePath } from '@/lib/utils/collection-search-params';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';
import type { SearchSuggestions } from '@/types/search-suggestions';

interface SearchMobileDiscoveryProps {
  className?: string;
  suggestions?: SearchSuggestions;
  /** When true, show Recent section skeleton while history loads (logged-in only). */
  isLoadingRecent?: boolean;
}

const sectionHeadingClass =
  'font-nunito-sans px-2.5 py-2.5 text-base font-normal leading-normal text-[#828282]';

const rowClass =
  'font-nunito-sans flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-normal leading-normal text-black';

/**
 * Mobile search discovery lists — Recent + Popular Search + Popular Collection.
 */
export function SearchMobileDiscovery({
  className,
  suggestions = DEFAULT_SEARCH_SUGGESTIONS,
  isLoadingRecent = false,
}: SearchMobileDiscoveryProps) {
  const recentTerms = suggestions.recentSearchTerms.filter(Boolean);
  const showRecentSection = isLoadingRecent || recentTerms.length > 0;
  const popularTerms = (
    suggestions.headerPopularTerms.length > 0
      ? suggestions.headerPopularTerms
      : suggestions.popularTerms
  ).filter(Boolean);

  return (
    <div className={cn('flex w-full flex-col gap-3 bg-white', className)}>
      {showRecentSection ? (
        <section aria-label={searchMessages.a11y.recentSearchRegion} aria-busy={isLoadingRecent}>
          <h2 className={sectionHeadingClass}>{searchMessages.labels.recentSearch}</h2>
          {isLoadingRecent ? (
            <ul aria-label={searchMessages.a11y.recentSearchLoading}>
              {Array.from({ length: SEARCH_RECENT_SKELETON_ROWS }, (_, index) => (
                <li key={`recent-skeleton-${index}`} className="px-4 py-2.5" aria-hidden="true">
                  <span className="bg-palmonas-filterSoft block h-4 w-2/3 animate-pulse rounded" />
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              {recentTerms.map((term) => (
                <li key={`recent-${term}`}>
                  <AppLink
                    href={buildSearchPagePath(term, {}, 'featured')}
                    replace
                    className={rowClass}
                    aria-label={searchMessages.a11y.formatSearchForTerm(term)}
                  >
                    <SearchIcon
                      className="size-[19px] shrink-0 text-[#828282]"
                      aria-hidden="true"
                    />
                    <span>{term}</span>
                  </AppLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {popularTerms.length > 0 ? (
        <section aria-label={searchMessages.a11y.popularSearchRegion}>
          <h2 className={sectionHeadingClass}>{searchMessages.labels.popularSearch}</h2>
          <ul>
            {popularTerms.map((term) => (
              <li key={term}>
                <AppLink
                  href={buildSearchPagePath(term, {}, 'featured')}
                  replace
                  className={rowClass}
                  aria-label={searchMessages.a11y.formatSearchForTerm(term)}
                >
                  <SearchIcon className="size-[19px] shrink-0 text-[#828282]" aria-hidden="true" />
                  <span>{term}</span>
                </AppLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {suggestions.popularCollections.length > 0 ? (
        <section aria-label={searchMessages.a11y.popularCollectionRegion}>
          <h2 className={sectionHeadingClass}>{searchMessages.labels.popularCollection}</h2>
          <ul>
            {suggestions.popularCollections.map((collection) => (
              <li key={collection.handle}>
                <AppLink
                  href={buildCollectionPagePath(collection.handle, {}, 'featured')}
                  className={rowClass}
                  aria-label={searchMessages.a11y.formatBrowseCollection(collection.label)}
                >
                  <CollectionGridIcon
                    className="size-5 shrink-0 text-[#FAC068]"
                    aria-hidden="true"
                  />
                  <span>{collection.label}</span>
                </AppLink>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
