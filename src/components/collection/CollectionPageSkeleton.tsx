import { ProductGridSkeleton } from '@/components/global/product-listing/ProductGridSkeleton';

const FILTER_SKELETON_COUNT = 5;

export function CollectionPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading collection">
      <section className="overflow-hidden bg-white">
        <div className="tab:aspect-[3/1] laptop:aspect-[3/1] relative aspect-[3/1] w-screen overflow-hidden bg-[#f8e4e9]">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/40 to-transparent p-5 text-center">
            <div className="container flex flex-col items-center">
              <div className="tab:h-12 tab:w-72 h-8 w-48 animate-pulse rounded bg-white/70" />
              <div className="tab:h-4 tab:w-56 mt-2 h-3 w-40 animate-pulse rounded bg-white/50" />
            </div>
          </div>
        </div>
      </section>

      <section className="laptop:px-5 tab:px-4 w-full px-2.5">
        <div className="laptop:mt-10 laptop:grid laptop:grid-cols-[350px_minmax(0,1fr)]">
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
            <ProductGridSkeleton className="tab:mt-0 mt-4" />
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
