import { productMessages } from '@/config/product/product.config';

interface ProductReviewsListSkeletonProps {
  /** Number of placeholder cards. */
  count?: number;
}

/**
 * Fixed-height review list placeholders so filter refetches don't collapse the feed/modal.
 */
export function ProductReviewsListSkeleton({ count = 4 }: ProductReviewsListSkeletonProps) {
  return (
    <ul
      className="mt-4 list-none space-y-4"
      aria-busy="true"
      aria-label={productMessages.reviews.loadingMore}
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="border-b border-[#f1f1f1] py-5">
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-stone-200" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-1/3 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
              <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-stone-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Compact summary + bars skeleton for PDP first paint.
 */
export function ProductReviewsSectionSkeleton() {
  return (
    <section
      className="laptop:px-10 laptop:pb-14 mx-auto max-w-[1200px] px-4 pt-4 pb-8"
      aria-busy="true"
      aria-label={productMessages.reviews.loadingMore}
    >
      <div className="laptop:block mb-6 hidden h-8 w-56 animate-pulse rounded bg-stone-200" />
      <div className="laptop:flex laptop:gap-14">
        <div className="laptop:w-[340px] w-full shrink-0 space-y-3">
          <div className="laptop:hidden flex justify-between">
            <div className="h-5 w-40 animate-pulse rounded bg-stone-200" />
            <div className="h-5 w-28 animate-pulse rounded bg-stone-100" />
          </div>
          <div className="laptop:block hidden h-40 animate-pulse rounded-2xl bg-stone-100" />
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-stone-200" />
              <div className="h-2 flex-1 animate-pulse rounded-full bg-stone-100" />
              <div className="h-4 w-6 animate-pulse rounded bg-stone-100" />
            </div>
          ))}
          <div className="h-9 w-full animate-pulse rounded-lg bg-stone-200" />
        </div>
        <div className="laptop:mt-0 mt-8 min-w-0 flex-1">
          <div className="mb-4 flex justify-between">
            <div className="h-6 w-28 animate-pulse rounded bg-stone-200" />
            <div className="h-9 w-36 animate-pulse rounded-lg bg-stone-100" />
          </div>
          <ProductReviewsListSkeleton count={4} />
        </div>
      </div>
    </section>
  );
}
