const SECTION_BLOCK_COUNT = 3;

interface CmsSectionsLoadingSkeletonProps {
  /** Number of placeholder section blocks. */
  sectionCount?: number;
}

/**
 * Section-shaped placeholders while CMS chunks load below the first paint.
 */
export function CmsSectionsLoadingSkeleton({
  sectionCount = SECTION_BLOCK_COUNT,
}: CmsSectionsLoadingSkeletonProps) {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading more sections"
      data-testid="cms-sections-loading-skeleton"
    >
      {Array.from({ length: sectionCount }).map((_, index) => (
        <section key={`cms-section-skeleton-${index}`} className="w-full px-4">
          <div className="mx-auto mb-3 h-6 w-40 animate-pulse rounded bg-stone-200" />
          <div className="tab:grid-cols-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((__, cardIndex) => (
              <div
                key={`cms-card-skeleton-${index}-${cardIndex}`}
                className="aspect-[4/5] w-full animate-pulse rounded-lg bg-stone-100"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
