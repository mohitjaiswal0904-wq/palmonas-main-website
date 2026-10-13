'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SearchIcon } from '@/components/icons';
import { HeaderSearchDropdown } from '@/components/layout/HeaderSearchDropdown';
import {
  SEARCH_AUTOCOMPLETE_TERM_LIMIT,
  SEARCH_INPUT_DEBOUNCE_MS,
} from '@/components/search/search-constants';
import { useAuth } from '@/hooks/auth/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { mergeIntentSuggestions, parseSearchIntent } from '@/lib/search/search-intent';
import { cn } from '@/lib/utils/cn';
import {
  collectSearchSuggestionTerms,
  filterSearchSuggestionTerms,
} from '@/lib/utils/filter-search-suggestion-terms';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';
import type { SearchSuggestions } from '@/types/search-suggestions';

interface HeaderSearchProps {
  className?: string;
  suggestions: SearchSuggestions;
}

interface HeaderSearchInputProps extends HeaderSearchProps {
  initialQuery: string;
}

function HeaderSearchInput({ className, initialQuery, suggestions }: HeaderSearchInputProps) {
  const router = useRouter();
  const { isAuthenticated, isGuest, isLoading: isBootstrapping } = useAuth();
  const rootRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedValue = useDebounce(value, SEARCH_INPUT_DEBOUNCE_MS);

  // Suggestions open on click/focus only — hovering the field must not reveal them.
  const showDropdown = isFocused;
  const canShowRecent = isAuthenticated && !isGuest && !isBootstrapping;
  const { terms: recentTerms, isLoading: isLoadingRecent } = useSearchHistory({
    isOpen: showDropdown && canShowRecent,
  });

  const liveSuggestions = useMemo(
    (): SearchSuggestions => ({
      ...suggestions,
      recentSearchTerms: canShowRecent ? recentTerms : [],
    }),
    [canShowRecent, recentTerms, suggestions],
  );
  const autocompleteQuery = showDropdown ? debouncedValue : '';
  const { products: productSuggestions, isLoading: isLoadingProducts } =
    useSearchAutocomplete(autocompleteQuery);

  const matchedTerms = useMemo(() => {
    const filtered = value.trim()
      ? filterSearchSuggestionTerms(collectSearchSuggestionTerms(liveSuggestions), value)
      : [];

    return mergeIntentSuggestions(value, filtered, SEARCH_AUTOCOMPLETE_TERM_LIMIT);
  }, [liveSuggestions, value]);

  const closeDropdown = useCallback(() => {
    setIsFocused(false);
  }, []);

  const navigateForQuery = useCallback(
    (query: string) => {
      const normalizedQuery = normalizeSearchQuery(query);

      if (!normalizedQuery) {
        return;
      }

      setValue(normalizedQuery);
      closeDropdown();
      router.push(buildSearchPagePath(normalizedQuery, {}, 'featured'));
    },
    [closeDropdown, router],
  );

  const navigateToProduct = useCallback(
    (handle: string) => {
      const normalizedHandle = handle.trim();

      if (!normalizedHandle) {
        return;
      }

      closeDropdown();
      router.push(`/products/${normalizedHandle}`);
    },
    [closeDropdown, router],
  );

  /** Fills the input with a suggestion so autocomplete can refresh; does not open /search. */
  const applySuggestionTerm = useCallback((term: string) => {
    const nextValue = term.trim();

    if (!nextValue) {
      return;
    }

    setValue(nextValue);
    setIsFocused(true);
  }, []);

  // Close when pointer presses outside the search area (covers cases blur does not).
  useEffect(() => {
    if (!showDropdown) {
      return undefined;
    }

    const handlePointerDownOutside = (event: PointerEvent) => {
      const root = rootRef.current;
      const target = event.target;

      if (!(target instanceof Node) || !root || root.contains(target)) {
        return;
      }

      closeDropdown();
    };

    document.addEventListener('pointerdown', handlePointerDownOutside);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside);
  }, [closeDropdown, showDropdown]);

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <form
        className="relative mx-auto w-full"
        onSubmit={(event) => {
          event.preventDefault();
          navigateForQuery(value);
        }}
      >
        <label htmlFor="header-search" className="sr-only">
          Search products and collections
        </label>
        <input
          id="header-search"
          type="search"
          inputMode="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search products..."
          className="border-palmonas-border bg-palmonas-surface text-palmonas-ink focus:border-palmonas-subtle tab:h-10 tab:pl-4 tab:pr-10 h-9 w-full rounded-lg border pr-9 pl-3 text-base transition-colors outline-none placeholder:text-base"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="header-search-suggestions"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center"
          aria-label="Submit search"
        >
          <SearchIcon className="text-palmonas-subtle tab:h-5 tab:w-5 h-4 w-4" />
        </button>
      </form>

      {showDropdown ? (
        <div
          id="header-search-suggestions"
          className="z-dropdown absolute top-full right-0 left-0 pt-2"
          role="listbox"
          aria-label="Search suggestions"
        >
          <HeaderSearchDropdown
            query={value}
            matchedTerms={matchedTerms}
            productSuggestions={productSuggestions}
            isLoadingProducts={isLoadingProducts}
            isLoadingRecent={canShowRecent && isLoadingRecent}
            suggestions={liveSuggestions}
            onTermSelect={(term) => {
              if (parseSearchIntent(value).suggestions.includes(term)) {
                navigateForQuery(term);
                return;
              }

              applySuggestionTerm(term);
            }}
            onViewAllResults={() => navigateForQuery(value)}
            onProductSelect={navigateToProduct}
          />
        </div>
      ) : null}
    </div>
  );
}

function HeaderSearchField({ className, suggestions }: HeaderSearchProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname === '/search' ? (searchParams.get('q') ?? '') : '';
  // Off /search, remount per route so typed query cannot stick after PDP/nav (PW-554).
  const inputKey = pathname === '/search' ? `search:${urlQuery}` : pathname;

  return (
    <HeaderSearchInput
      key={inputKey}
      className={className}
      initialQuery={urlQuery}
      suggestions={suggestions}
    />
  );
}

function HeaderSearchFallback({ className }: Pick<HeaderSearchProps, 'className'>) {
  return (
    <div
      className={cn(
        'border-palmonas-border bg-palmonas-surface tab:h-10 mx-auto h-9 w-full max-w-md min-w-0 justify-self-center rounded-full border',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function HeaderSearch({ className, suggestions }: HeaderSearchProps) {
  return (
    <Suspense fallback={<HeaderSearchFallback className={className} />}>
      <HeaderSearchField className={className} suggestions={suggestions} />
    </Suspense>
  );
}
