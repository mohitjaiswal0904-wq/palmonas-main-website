'use client';

import type { ReactNode } from 'react';

import { ProductReviewCard } from '@/components/product/ProductReviewCard';
import { ProductReviewsFilterDropdown } from '@/components/product/ProductReviewsFilterDropdown';
import { ProductReviewsListSkeleton } from '@/components/product/ProductReviewsListSkeleton';
import { productMessages } from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import { cn } from '@/lib/utils/cn';
import type { ProductReview, ProductReviewsFilter } from '@/types/product/reviews';

interface ProductReviewsFeedProps {
  filter: ProductReviewsFilter;
  onFilterChange: (filter: ProductReviewsFilter) => void;
  displayCount: number;
  reviews: ProductReview[];
  isFetchingReviews: boolean;
  /** Skeleton card count while a filter request is in flight. */
  skeletonCount?: number;
  footer?: ReactNode;
}

/**
 * Shared review list column: count header, filters, cards, and optional footer slot.
 */
export function ProductReviewsFeed({
  filter,
  onFilterChange,
  displayCount,
  reviews,
  isFetchingReviews,
  skeletonCount = 4,
  footer,
}: ProductReviewsFeedProps) {
  return (
    <div className="laptop:min-w-0 laptop:flex-1 laptop:mt-0 mt-3">
      <div
        className={cn(
          'flex items-center justify-between gap-4 py-4',
          productTokens.reviews.feedHeaderBorder,
        )}
      >
        <p className={productTokens.reviews.feedCount}>
          {productMessages.reviews.formatReviewCount(displayCount)}
        </p>
        <ProductReviewsFilterDropdown filter={filter} onFilterChange={onFilterChange} />
      </div>

      {isFetchingReviews ? (
        <ProductReviewsListSkeleton count={skeletonCount} />
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#595959]">
          {productMessages.reviews.noMatchingReviews}
        </p>
      ) : (
        <ul className="mt-4 list-none">
          {reviews.map((review) => (
            <li key={review.id}>
              <ProductReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      {footer}
    </div>
  );
}
