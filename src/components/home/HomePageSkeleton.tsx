import { CmsSectionsLoadingSkeleton } from '@/components/cms/CmsSectionsLoadingSkeleton';

const CATEGORY_PILL_COUNT = 3;

export type HomePageSkeletonVariant = 'full' | 'body';

interface HomePageSkeletonProps {
  /**
   * `full` — route-level / soft-nav overlay (includes tab pill placeholders).
   * `body` — category switch: real tabs stay above; only CMS body pulses.
   */
  variant?: HomePageSkeletonVariant;
}

function HomePageBodySkeletonBlocks() {
  return (
    <div className="flex flex-col gap-6">
      <section className="w-full overflow-hidden px-0">
        <div className="tab:aspect-[16/7] aspect-[4/5] w-full animate-pulse bg-stone-200" />
      </section>

      <CmsSectionsLoadingSkeleton />
    </div>
  );
}

/**
 * Home-shaped placeholder while the CMS home page loads or category tab soft-nav is pending.
 *
 * @param props.variant - `full` for chrome overlays; `body` when real tabs remain visible.
 */
export function HomePageSkeleton({ variant = 'full' }: HomePageSkeletonProps) {
  if (variant === 'body') {
    return (
      <div aria-busy="true" aria-label="Loading home" data-testid="home-page-skeleton">
        <HomePageBodySkeletonBlocks />
      </div>
    );
  }

  return (
    <main aria-busy="true" aria-label="Loading home" data-testid="home-page-skeleton">
      <div className="mt-4 mb-5 flex justify-center px-4">
        <div className="w-[45vw] max-w-full rounded-full bg-stone-100 p-1.5">
          <div className="flex gap-1">
            {Array.from({ length: CATEGORY_PILL_COUNT }).map((_, index) => (
              <div
                key={`home-tab-skeleton-${index}`}
                className="h-9 flex-1 animate-pulse rounded-full bg-stone-200"
              />
            ))}
          </div>
        </div>
      </div>
      <HomePageBodySkeletonBlocks />
    </main>
  );
}
