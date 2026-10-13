'use client';

import { SEARCH_RECENT_SKELETON_ROWS } from '@/components/search/search-constants';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';
import { AppLink } from '@/components/ui/AppLink';
import { searchMessages } from '@/config/search/search.config';
import { cn } from '@/lib/utils/cn';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';
import type { SearchSuggestions } from '@/types/search-suggestions';

interface SearchPopularTermsProps {
  className?: string;
  suggestions?: SearchSuggestions;
  /** When true, show Recent chips skeleton while history loads (logged-in only). */
  isLoadingRecent?: boolean;
}

const chipClassName =
  'border-palmonas-border text-palmonas-muted rounded-full border px-3 py-1 text-sm transition-colors hover:border-[#B8956A] hover:text-[#B8956A]';

/**
 * Recent + popular search chips for the search page — independently clickable.
 */
export function SearchPopularTerms({
  className,
  suggestions = DEFAULT_SEARCH_SUGGESTIONS,
  isLoadingRecent = false,
}: SearchPopularTermsProps) {
  const recentTerms = suggestions.recentSearchTerms.filter(Boolean);
  const showRecentSection = isLoadingRecent || recentTerms.length > 0;

  return (
    <div className={cn('relative z-0 mt-6 flex flex-col gap-3', className)}>
      {showRecentSection ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label={searchMessages.a11y.recentSearchRegion}
          aria-busy={isLoadingRecent}
        >
          <span className="text-palmonas-subtle text-sm">
            {searchMessages.labels.recentSearch}:
          </span>
          {isLoadingRecent ? (
            <ul
              className="flex flex-wrap gap-2"
              aria-label={searchMessages.a11y.recentSearchLoading}
            >
              {Array.from({ length: SEARCH_RECENT_SKELETON_ROWS }, (_, index) => (
                <li key={`recent-chip-skeleton-${index}`} aria-hidden="true">
                  <span className="bg-palmonas-filterSoft block h-7 w-20 animate-pulse rounded-full" />
                </li>
              ))}
            </ul>
          ) : (
            recentTerms.map((term) => (
              <AppLink
                key={`recent-${term}`}
                href={buildSearchPagePath(term, {}, 'featured')}
                className={chipClassName}
                aria-label={searchMessages.a11y.formatSearchForTerm(term)}
              >
                {term}
              </AppLink>
            ))
          )}
        </div>
      ) : null}

      <div
        className="flex flex-wrap items-center gap-2"
        aria-label={searchMessages.a11y.popularSearchRegion}
      >
        <span className="text-palmonas-subtle text-sm">{searchMessages.labels.popularSearch}:</span>
        {suggestions.popularTerms.map((term) => (
          <AppLink
            key={term}
            href={buildSearchPagePath(term, {}, 'featured')}
            className={chipClassName}
            aria-label={searchMessages.a11y.formatSearchForTerm(term)}
          >
            {term}
          </AppLink>
        ))}
      </div>
    </div>
  );
}
