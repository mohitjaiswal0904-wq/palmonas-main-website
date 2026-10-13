import { ProductGridSkeleton } from '@/components/global/product-listing/ProductGridSkeleton';
import {
  SEARCH_PAGE_HERO_SECTION_CLASS,
  SEARCH_PAGE_HORIZONTAL_PADDING_CLASS,
  SEARCH_PRODUCT_GRID_CLASS,
} from '@/components/search/search-constants';
import { cn } from '@/lib/utils/cn';

export function SearchPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading search results"
      className="bg-palmonas-surface laptop:block laptop:overflow-visible flex-1 overflow-y-auto"
    >
      <section
        className={cn(
          'w-full',
          SEARCH_PAGE_HERO_SECTION_CLASS,
          SEARCH_PAGE_HORIZONTAL_PADDING_CLASS,
        )}
      >
        <div className="font-nunito-sans w-full text-left">
          <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
          <div className="laptop:mt-1 mt-2 h-8 w-48 animate-pulse rounded bg-stone-200" />
          <div className="laptop:mt-3 mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`search-chip-skeleton-${index}`}
                className="h-8 w-20 animate-pulse rounded-full bg-stone-200"
              />
            ))}
          </div>
        </div>
      </section>

      <section className={cn('w-full', SEARCH_PAGE_HORIZONTAL_PADDING_CLASS)}>
        <div className="laptop:mt-4 laptop:grid laptop:grid-cols-1">
          <div className="laptop:col-start-1 laptop:row-start-1 laptop:flex laptop:items-center laptop:justify-end laptop:pb-5 hidden">
            <div className="h-10 w-48 animate-pulse rounded-[10px] bg-stone-200" />
          </div>

          <div className="laptop:col-start-1 laptop:row-start-2 min-w-0">
            <div className="laptop:hidden flex justify-center py-4">
              <div className="h-10 w-32 animate-pulse rounded-full bg-stone-200" />
            </div>

            <ProductGridSkeleton className={SEARCH_PRODUCT_GRID_CLASS} count={10} />
          </div>
        </div>
      </section>

      <div className="z-fixed laptop:hidden fixed inset-x-0 bottom-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.25)]">
        <div className="grid h-12 grid-cols-1 items-center">
          <div className="flex h-full items-center justify-center px-4">
            <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
