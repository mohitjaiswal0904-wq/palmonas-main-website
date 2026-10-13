import {
  EMILY_IN_PARIS_LISTING_HEADING_CLASS,
  EMILY_IN_PARIS_PAGE_PADDING_CLASS,
  EMILY_IN_PARIS_PAGE_ROOT_CLASS,
  EMILY_IN_PARIS_SECTION_CLASS,
} from '@/components/emily-in-paris/emily-in-paris-constants';
import { ProductGridSkeleton } from '@/components/global/product-listing/ProductGridSkeleton';

const FILTER_SKELETON_COUNT = 5;

export function EmilyInParisPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Emily in Paris"
      className={EMILY_IN_PARIS_PAGE_ROOT_CLASS}
    >
      <section className="w-full overflow-hidden bg-[#FCEBF5]">
        <div className="tab:aspect-[5/2] aspect-[12/5] w-full animate-pulse bg-gradient-to-b from-[#FCEBF5] via-white to-[#F8D9EC]" />
      </section>

      <section className={EMILY_IN_PARIS_SECTION_CLASS}>
        <div className="tab:grid tab:grid-cols-3 tab:gap-3 laptop:grid-cols-5 laptop:gap-4 flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`category-skeleton-${index}`}
              className="tab:w-full tab:max-w-none flex w-[calc((100%-0.75rem)/2)] shrink-0 flex-col"
            >
              <div className="aspect-square w-full animate-pulse rounded-full bg-stone-200" />
              <div className="tab:mt-4 mx-auto mt-3 h-4 w-24 animate-pulse rounded bg-stone-200" />
            </div>
          ))}
        </div>
        <div className="tab:mt-8 mx-auto mt-6 h-12 w-40 animate-pulse rounded-sm bg-stone-200" />
      </section>

      <section className="tab:py-10 laptop:py-12 w-full py-8">
        <div className="aspect-[12/5] w-full animate-pulse bg-stone-200" />
      </section>

      <section className="w-full overflow-hidden py-4">
        <div className="h-8 w-full animate-pulse bg-stone-200" />
      </section>

      <section className={EMILY_IN_PARIS_PAGE_PADDING_CLASS}>
        <div className="tab:grid-cols-4 tab:gap-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`look-skeleton-${index}`}
              className="tab:h-[360px] h-[280px] w-full animate-pulse rounded-sm bg-stone-200"
            />
          ))}
        </div>
      </section>

      <section>
        <div className={EMILY_IN_PARIS_LISTING_HEADING_CLASS}>
          <div className="mx-auto h-8 w-64 animate-pulse rounded bg-stone-200" />
        </div>

        <div className="laptop:px-5 w-full px-0">
          <div className="laptop:mt-6 laptop:grid laptop:grid-cols-[350px_minmax(0,1fr)]">
            <div className="laptop:flex laptop:min-h-10 laptop:items-center laptop:pb-5 hidden">
              <div className="h-6 w-20 animate-pulse rounded bg-stone-200" />
            </div>
            <div className="laptop:flex laptop:items-center laptop:justify-between laptop:pb-5 hidden">
              <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
              <div className="h-10 w-40 animate-pulse rounded-full bg-stone-200" />
            </div>

            <div className="laptop:block hidden space-y-4 pr-8">
              {Array.from({ length: FILTER_SKELETON_COUNT }).map((_, index) => (
                <div key={`filter-skeleton-${index}`} className="space-y-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-stone-100" />
                    <div className="h-4 w-28 animate-pulse rounded bg-stone-100" />
                    <div className="h-4 w-36 animate-pulse rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <div className="laptop:hidden flex gap-3 py-4">
                <div className="h-10 flex-1 animate-pulse rounded-full bg-stone-200" />
                <div className="h-10 flex-1 animate-pulse rounded-full bg-stone-200" />
              </div>

              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </section>

      <div className="z-fixed laptop:hidden fixed inset-x-0 bottom-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.25)]">
        <div className="grid h-12 grid-cols-[1fr_1px_1fr] items-center">
          <div className="flex h-full items-center justify-center px-4">
            <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
          </div>
          <span className="h-9 w-px bg-stone-200" aria-hidden="true" />
          <div className="flex h-full items-center justify-center px-4">
            <div className="h-4 w-16 animate-pulse rounded bg-stone-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
