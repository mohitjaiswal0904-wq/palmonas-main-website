import { ProductGridSkeleton } from '@/components/global/product-listing/ProductGridSkeleton';
import { ShraddhasFavouriteStoryScallopTop } from '@/components/shraddhas-favourite/ShraddhasFavouriteStoryScallopTop';
import {
  SHRADDHAS_FAVOURITE_BESTSELLERS_HEADING_CLASS,
  SHRADDHAS_FAVOURITE_PAGE_PADDING_CLASS,
  SHRADDHAS_FAVOURITE_PAGE_ROOT_CLASS,
  SHRADDHAS_FAVOURITE_SECTION_CLASS,
  SHRADDHAS_FAVOURITE_STORY_GRADIENT_CLASS,
} from '@/components/shraddhas-favourite/shraddhas-favourite-constants';

const FILTER_SKELETON_COUNT = 5;

export function ShraddhasFavouritePageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading Shraddha's Favourite"
      className={SHRADDHAS_FAVOURITE_PAGE_ROOT_CLASS}
    >
      <section className="w-full overflow-hidden bg-[#f8e4e9]">
        <div className="laptop:hidden aspect-[3/4] w-full animate-pulse bg-gradient-to-b from-[#f8e4e9] via-white to-[#f5dbe2]" />
        <div className="laptop:block hidden aspect-[3/1] w-full animate-pulse bg-gradient-to-r from-[#f8e4e9] via-white to-[#f5dbe2]" />
      </section>

      <section className="tab:py-10 laptop:py-12 w-full py-8">
        <div className="tab:gap-3 laptop:gap-4 grid w-full grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`category-skeleton-${index}`} className="flex flex-col">
              <div className="aspect-square w-full animate-pulse bg-stone-200" />
              <div className="tab:mt-4 mx-auto mt-3 h-4 w-16 animate-pulse rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </section>

      <section className={SHRADDHAS_FAVOURITE_SECTION_CLASS}>
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-stone-200" />
        <div className="mt-8 flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`signature-skeleton-${index}`}
              className="tab:w-[33vw] laptop:w-[20vw] h-[320px] w-[50vw] shrink-0 animate-pulse border border-[#0000001A] bg-stone-100"
            />
          ))}
        </div>
      </section>

      <section
        className={[
          'tab:pt-10 tab:pb-8 laptop:pt-12 laptop:pb-10 relative w-full overflow-visible pt-8 pb-6',
          SHRADDHAS_FAVOURITE_STORY_GRADIENT_CLASS,
        ].join(' ')}
      >
        <ShraddhasFavouriteStoryScallopTop />
        <div className={`relative z-10 ${SHRADDHAS_FAVOURITE_PAGE_PADDING_CLASS}`}>
          <div className="tab:mb-10 laptop:mb-12 mb-8 flex justify-center">
            <div className="tab:max-w-[640px] laptop:max-w-[800px] h-6 w-full max-w-[480px] animate-pulse rounded bg-stone-200" />
          </div>
          <div className="tab:grid-cols-2 tab:gap-8 laptop:grid-cols-4 laptop:gap-6 grid grid-cols-1 gap-10">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`story-skeleton-${index}`} className="flex flex-col items-center">
                <div className="tab:w-[240px] laptop:w-[260px] h-[260px] w-[220px] animate-pulse rounded bg-white/80" />
                <div className="mt-5 h-5 w-32 animate-pulse rounded bg-stone-200" />
                <div className="mt-3 h-12 w-full max-w-[240px] animate-pulse rounded bg-stone-100" />
                <div className="mt-4 h-11 w-48 animate-pulse rounded-full bg-stone-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className={SHRADDHAS_FAVOURITE_BESTSELLERS_HEADING_CLASS}>
          <div className="mx-auto h-8 w-40 animate-pulse rounded bg-stone-200" />
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
