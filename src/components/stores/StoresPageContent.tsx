'use client';

import { useMemo, useState } from 'react';

import { SearchIcon } from '@/components/icons';
import { StoreCard } from '@/components/stores/StoreCard';
import { StoresInfiniteScrollTrigger } from '@/components/stores/StoresInfiniteScrollTrigger';
import { Loader } from '@/components/ui/Loader';
import { useDebounce } from '@/hooks/useDebounce';
import { useStores } from '@/hooks/useStores';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
import type { StoreListQueryParams, StoresResponse } from '@/types/store';

function normaliseSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

interface StoresPageContentProps {
  initialStores?: StoresResponse | null;
}

export function StoresPageContent({ initialStores }: StoresPageContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(normaliseSearchValue(searchQuery), 300);
  const storeParams = useMemo<StoreListQueryParams>(
    () => ({
      images: true,
      limit: DEFAULT_PAGE_SIZE,
      search: debouncedSearchQuery || undefined,
    }),
    [debouncedSearchQuery],
  );
  const { stores, hasMoreStores, isLoading, isLoadingMoreStores, loadMoreStores, error } =
    useStores(storeParams, { initialStores });
  const storeCount = stores.length;

  const hasSearchQuery = debouncedSearchQuery.length > 0;
  const hasStores = storeCount > 0;
  const isInitialLoading = isLoading && !hasStores;

  return (
    <main className="bg-palmonas-surface">
      <section className="tab:py-8 laptop:py-10 container py-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="tab:text-5xl text-palmonas-ink text-3xl font-semibold tracking-tight">
            Find a Store
          </h1>
          <p className="tab:text-2xl text-palmonas-muted mx-auto mt-2 max-w-2xl text-lg leading-7">
            Visit us in person at any of our locations
          </p>
          <div className="tab:mt-8 relative mx-auto mt-6 max-w-3xl">
            <label htmlFor="store-search" className="sr-only">
              Search stores by city, state, address, or pincode
            </label>
            <input
              id="store-search"
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by city, state, address or pincode"
              className="tab:h-16 tab:rounded-palmonas-xl tab:pr-6 tab:pl-16 tab:text-xl border-palmonas-border bg-palmonas-surface text-palmonas-ink placeholder:text-palmonas-subtle focus:border-palmonas-subtle h-14 w-full rounded-2xl border pr-5 pl-13 text-base transition-colors outline-none"
            />
            <div className="tab:left-6 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
              <SearchIcon className="tab:h-8 tab:w-8 text-palmonas-subtle h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="tab:mt-8 bg-palmonas-surface mt-6">
          {error && (
            <div className="rounded-palmonas-lg border-palmonas-border bg-palmonas-soft text-palmonas-muted mt-6 border p-5 text-sm">
              We could not load Palmonas stores right now. Please check your connection and try
              again.
            </div>
          )}

          {isInitialLoading && (
            <div className="rounded-palmonas-lg border-palmonas-border bg-palmonas-surface text-palmonas-muted mt-4 flex items-center justify-center gap-3 border p-8 text-center text-sm">
              <Loader />
              Loading Palmonas stores...
            </div>
          )}

          {hasStores && (
            <>
              <div className="tab:grid-cols-2 laptop:grid-cols-4 mt-4 grid gap-4">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
              <StoresInfiniteScrollTrigger
                hasMoreStores={hasMoreStores}
                isLoadingMoreStores={isLoadingMoreStores}
                onLoadMoreStores={loadMoreStores}
              />
            </>
          )}

          {!isLoading && !error && !hasStores && (
            <div className="rounded-palmonas-lg border-palmonas-border bg-palmonas-soft mt-6 border p-8 text-center">
              <h3 className="text-palmonas-ink text-lg font-semibold">
                {hasSearchQuery ? 'No stores found' : 'No stores available'}
              </h3>
              <p className="text-palmonas-muted mx-auto mt-2 max-w-md text-sm">
                {hasSearchQuery
                  ? 'Try a different pincode, city, or state.'
                  : 'Please check back soon for updated store locations.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
