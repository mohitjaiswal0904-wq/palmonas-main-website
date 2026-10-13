'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SearchIcon } from '@/components/icons';
import { SEARCH_INPUT_DEBOUNCE_MS } from '@/components/search/search-constants';
import { useDebounce } from '@/hooks/useDebounce';
import { normalizeSearchQuery } from '@/lib/utils/search-query';
import { buildSearchPagePath } from '@/lib/utils/search-search-params';

interface SearchInputProps {
  id?: string;
  initialQuery?: string;
}

export function SearchInput({ id = 'search-page-input', initialQuery = '' }: SearchInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const debouncedValue = useDebounce(value, SEARCH_INPUT_DEBOUNCE_MS);

  // Live search: navigate after the user pauses typing.
  useEffect(() => {
    const normalizedQuery = normalizeSearchQuery(debouncedValue);

    if (!normalizedQuery || normalizedQuery === normalizeSearchQuery(initialQuery)) {
      return undefined;
    }

    router.push(buildSearchPagePath(normalizedQuery, {}, 'featured'));

    return undefined;
  }, [debouncedValue, initialQuery, router]);

  return (
    <form
      className="tab:mt-8 relative mx-auto mt-6 max-w-3xl"
      onSubmit={(event) => {
        event.preventDefault();
        const normalizedQuery = normalizeSearchQuery(value);

        if (!normalizedQuery) {
          return;
        }

        router.push(buildSearchPagePath(normalizedQuery, {}, 'featured'));
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search products and collections
      </label>
      <input
        id={id}
        type="search"
        inputMode="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products, collections, and categories"
        className="tab:h-16 tab:rounded-palmonas-xl tab:pr-6 tab:pl-16 tab:text-xl border-palmonas-border bg-palmonas-surface text-palmonas-ink placeholder:text-palmonas-subtle focus:border-palmonas-subtle h-14 w-full rounded-2xl border pr-5 pl-13 text-base transition-colors outline-none"
      />
      <button
        type="submit"
        className="tab:left-6 absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center"
        aria-label="Submit search"
      >
        <SearchIcon className="tab:h-8 tab:w-8 text-palmonas-subtle h-6 w-6" />
      </button>
    </form>
  );
}
