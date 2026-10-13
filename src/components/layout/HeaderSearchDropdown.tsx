'use client';

import Image from 'next/image';

import { CollectionGridIcon, SearchIcon } from '@/components/icons';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';
import { AppLink } from '@/components/ui/AppLink';
import { searchMessages } from '@/config/search/search.config';
import { cn } from '@/lib/utils/cn';
import { buildCollectionPagePath } from '@/lib/utils/collection-search-params';
import type { Product } from '@/types/product';
import type { SearchSuggestions } from '@/types/search-suggestions';

interface HeaderSearchDropdownProps {
  className?: string;
  query?: string;
  matchedTerms?: string[];
  productSuggestions?: Product[];
  isLoadingProducts?: boolean;
  /** When true, show Recent section skeleton while history loads (logged-in only). */
  isLoadingRecent?: boolean;
  /** Applies a suggested term into the input without opening the full search page. */
  onTermSelect: (term: string) => void;
  /** Opens the full search results page for the current query. */
  onViewAllResults?: () => void;
  onProductSelect?: (handle: string) => void;
  suggestions?: SearchSuggestions;
}

const dropdownSectionHeadingClass =
  'font-nunito-sans mb-2 text-[11px] font-normal leading-normal text-[#828282]';

const dropdownOptionClass = 'font-nunito-sans text-[11px] font-normal leading-normal text-black';

const RECENT_SKELETON_ROWS = 3;

/**
 * Header search suggestions panel.
 * Empty input: Recent + Popular + Collections.
 * While typing: matching terms + product autosuggestions + View all results.
 */
export function HeaderSearchDropdown({
  className,
  query = '',
  matchedTerms = [],
  productSuggestions = [],
  isLoadingProducts = false,
  isLoadingRecent = false,
  onTermSelect,
  onViewAllResults,
  onProductSelect,
  suggestions = DEFAULT_SEARCH_SUGGESTIONS,
}: HeaderSearchDropdownProps) {
  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const recentTerms = suggestions.recentSearchTerms.filter(Boolean);
  const popularTerms = suggestions.headerPopularTerms.filter(Boolean);
  const showRecentSection = isLoadingRecent || recentTerms.length > 0;

  return (
    <div
      className={cn(
        'border-palmonas-border max-h-[min(24rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border bg-white shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      {hasQuery ? (
        <>
          {matchedTerms.length > 0 ? (
            <section className="px-4 pt-4 pb-2" aria-label="Suggested searches">
              <h3 className={dropdownSectionHeadingClass}>Suggestions</h3>
              <ul>
                {matchedTerms.map((term) => (
                  <li key={`match-${term}`}>
                    <button
                      type="button"
                      className={cn(
                        dropdownOptionClass,
                        'hover:bg-palmonas-filterSoft flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors',
                      )}
                      aria-label={`Use suggestion ${term}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onTermSelect(term);
                      }}
                    >
                      <SearchIcon className="text-palmonas-subtle h-4 w-4 shrink-0" />
                      <span>{term}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            className={cn('px-4', matchedTerms.length > 0 ? 'pt-2' : 'pt-4', 'pb-2')}
            aria-label="Product suggestions"
          >
            <h3 className={dropdownSectionHeadingClass}>Products</h3>
            {isLoadingProducts ? (
              <p className="text-palmonas-subtle px-2 py-3 text-sm">Searching…</p>
            ) : null}
            {!isLoadingProducts && productSuggestions.length === 0 ? (
              <p className="text-palmonas-subtle px-2 py-3 text-sm">No matching products</p>
            ) : null}
            {productSuggestions.length > 0 ? (
              <ul>
                {productSuggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className={cn(
                        dropdownOptionClass,
                        'hover:bg-palmonas-filterSoft flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors',
                      )}
                      aria-label={`View ${product.name}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onProductSelect?.(product.handle);
                      }}
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 truncate">{product.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {onViewAllResults ? (
            <div className="border-palmonas-border border-t px-4 py-3">
              <button
                type="button"
                className={cn(
                  dropdownOptionClass,
                  'hover:bg-palmonas-filterSoft flex w-full items-center justify-center gap-2 rounded-lg px-2 py-2.5 font-medium transition-colors',
                )}
                aria-label={`View all results for ${trimmedQuery}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onViewAllResults();
                }}
              >
                <SearchIcon className="text-palmonas-subtle h-4 w-4 shrink-0" />
                <span>View all results</span>
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {showRecentSection ? (
            <section
              className="px-4 pt-4 pb-2"
              aria-label={searchMessages.a11y.recentSearchRegion}
              aria-busy={isLoadingRecent}
            >
              <h3 className={dropdownSectionHeadingClass}>{searchMessages.labels.recentSearch}</h3>
              {isLoadingRecent ? (
                <ul aria-label={searchMessages.a11y.recentSearchLoading}>
                  {Array.from({ length: RECENT_SKELETON_ROWS }, (_, index) => (
                    <li key={`recent-skeleton-${index}`} className="px-2 py-3" aria-hidden="true">
                      <span className="bg-palmonas-filterSoft block h-4 w-2/3 animate-pulse rounded" />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {recentTerms.map((term) => (
                    <li key={`recent-${term}`}>
                      <button
                        type="button"
                        className={cn(
                          dropdownOptionClass,
                          'hover:bg-palmonas-filterSoft flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors',
                        )}
                        aria-label={`Use suggestion ${term}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          onTermSelect(term);
                        }}
                      >
                        <SearchIcon className="text-palmonas-subtle h-4 w-4 shrink-0" />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          <section
            className={cn('px-4 pb-2', showRecentSection ? 'pt-2' : 'pt-4')}
            aria-label="Popular search"
          >
            <h3 className={dropdownSectionHeadingClass}>{searchMessages.labels.popularSearch}</h3>
            <ul>
              {popularTerms.map((term) => (
                <li key={`popular-${term}`}>
                  <button
                    type="button"
                    className={cn(
                      dropdownOptionClass,
                      'hover:bg-palmonas-filterSoft flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left transition-colors',
                    )}
                    aria-label={`Use suggestion ${term}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onTermSelect(term);
                    }}
                  >
                    <SearchIcon className="text-palmonas-subtle h-4 w-4 shrink-0" />
                    <span>{term}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="px-4 pt-2 pb-4" aria-label="Popular collections">
            <h3 className={dropdownSectionHeadingClass}>
              {searchMessages.labels.popularCollection}
            </h3>
            <ul>
              {suggestions.popularCollections.map((collection) => (
                <li key={collection.handle}>
                  <AppLink
                    href={buildCollectionPagePath(collection.handle, {}, 'featured')}
                    className={cn(
                      dropdownOptionClass,
                      'hover:bg-palmonas-filterSoft flex items-center gap-3 rounded-lg px-2 py-3 transition-colors',
                    )}
                    aria-label={`Browse ${collection.label}`}
                    onMouseDown={(event) => event.preventDefault()}
                  >
                    <CollectionGridIcon className="h-4 w-4 shrink-0 text-[#FAC068]" />
                    <span>{collection.label}</span>
                  </AppLink>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
