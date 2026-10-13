import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { getPdpStarFillPercents } from '@/lib/product/pdp-rating-stars';
import { cn } from '@/lib/utils/cn';
import { shouldShowProductRating } from '@/lib/utils/product-rating-visibility';
import type { ProductReviews } from '@/types/product';

interface ProductRatingProps {
  reviews?: ProductReviews;
  avgRating?: number;
  reviewCount?: number;
  onReviewCountClick?: () => void;
}

const STAR_PATH =
  'M8 1.2 9.8 5.8l4.9.4-3.7 3.2 1.1 4.8L8 11.8 4 14.2l1.1-4.8L1.4 6.2l4.9-.4L8 1.2Z';

interface RatingStarProps {
  fillPercent: number;
}

/**
 * Render one of five stars with a yellow fill clipped to the rating fraction.
 *
 * @param fillPercent - Yellow fill width, 0–100.
 */
function RatingStar({ fillPercent }: RatingStarProps) {
  return (
    <span
      className={productTheme.typography.pdpRatingStarSlotClass}
      data-testid="pdp-rating-star"
      data-fill={String(fillPercent)}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        className={cn(
          productTheme.typography.pdpRatingStarIconClass,
          productTheme.typography.pdpRatingStarEmptyClass,
        )}
      >
        <path fill="currentColor" d={STAR_PATH} />
      </svg>
      {fillPercent > 0 ? (
        <span
          className={productTheme.typography.pdpRatingStarFillClipClass}
          style={{ width: `${fillPercent}%` }}
        >
          <svg
            viewBox="0 0 16 16"
            className={cn(
              productTheme.typography.pdpRatingStarIconClass,
              productTheme.typography.pdpRatingStarFilledClass,
            )}
          >
            <path fill="currentColor" d={STAR_PATH} />
          </svg>
        </span>
      ) : null}
    </span>
  );
}

/**
 * Resolve display rating from reviews object or product-level fields.
 *
 * @param reviews - Nested reviews payload.
 * @param avgRating - Optional product-level average.
 * @param reviewCount - Optional product-level count.
 * @returns Rating number when showable, else null.
 */
function resolveRating(
  reviews: ProductReviews | undefined,
  avgRating: number | undefined,
  reviewCount: number | undefined,
): number | null {
  if (reviews && reviews.reviewCount > 0 && Number.isFinite(reviews.avgRating)) {
    return reviews.avgRating;
  }

  if (
    typeof avgRating === 'number' &&
    Number.isFinite(avgRating) &&
    typeof reviewCount === 'number' &&
    reviewCount > 0
  ) {
    return avgRating;
  }

  if (typeof avgRating === 'number' && Number.isFinite(avgRating) && avgRating > 0) {
    return avgRating;
  }

  return null;
}

/** PDP rating badge — score + five stars. Hidden unless avg ≥ 4 (same rule as PLP cards). */
export function ProductRating({
  reviews,
  avgRating,
  reviewCount,
  onReviewCountClick,
}: ProductRatingProps) {
  if (!isProductFeatureEnabled('ratingBadge')) {
    return <></>;
  }

  const rating = resolveRating(reviews, avgRating, reviewCount);

  if (rating === null || !shouldShowProductRating(rating)) {
    return <></>;
  }

  const formattedRating = rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1);
  const resolvedReviewCount = reviews?.reviewCount ?? reviewCount;
  const showReviewCount = typeof resolvedReviewCount === 'number' && resolvedReviewCount > 0;
  const starFills = getPdpStarFillPercents(rating);
  const jumpLabel = showReviewCount
    ? productMessages.reviews.formatScrollToReviews(resolvedReviewCount)
    : `${productMessages.a11y.rating}: ${formattedRating} out of 5`;

  const content = (
    <>
      <span
        className={`${productTheme.typography.pdpMetaClass} font-bold tracking-wide`}
        style={{ color: productTheme.ink }}
      >
        {formattedRating}
      </span>
      <span className={productTheme.typography.pdpRatingStarsClass}>
        {starFills.map((fillPercent, index) => (
          <RatingStar key={index} fillPercent={fillPercent} />
        ))}
      </span>
      {showReviewCount ? (
        <span
          className={`${productTheme.typography.pdpMetaClass} font-bold tracking-wide`}
          style={{ color: productTheme.ink }}
        >
          | {resolvedReviewCount}
        </span>
      ) : null}
    </>
  );

  if (onReviewCountClick) {
    return (
      <button
        type="button"
        onClick={onReviewCountClick}
        className="flex shrink-0 cursor-pointer items-center gap-[3px] text-left"
        aria-label={jumpLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center gap-[3px]"
      aria-label={`${productMessages.a11y.rating}: ${formattedRating} out of 5`}
    >
      {content}
    </div>
  );
}
