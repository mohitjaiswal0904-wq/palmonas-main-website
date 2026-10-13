import { forwardRef, type ReactNode } from 'react';

import { ReviewStarFilled13Icon } from '@/components/icons/review-icons';
import { productMessages } from '@/config/product/product.config';
import type { ProductReviewStarRating } from '@/types/product/reviews';

const STAR_RATINGS: ProductReviewStarRating[] = [5, 4, 3, 2, 1];

interface ProductReviewsRatingFilterProps {
  value?: ProductReviewStarRating;
  onChange: (rating: ProductReviewStarRating | undefined) => void;
}

/**
 * Star-rating filter pills shown alongside the period dropdown.
 */
export const ProductReviewsRatingFilter = forwardRef<
  HTMLDivElement,
  ProductReviewsRatingFilterProps
>(function ProductReviewsRatingFilter({ value, onChange }, ref) {
  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center gap-1.5"
      role="group"
      aria-label={productMessages.reviews.a11y.ratingFilterBar}
    >
      <RatingFilterButton
        isSelected={value === undefined}
        onClick={() => onChange(undefined)}
        ariaLabel={productMessages.reviews.a11y.allRatings}
      >
        {productMessages.reviews.allRatings}
      </RatingFilterButton>
      {STAR_RATINGS.map((stars) => (
        <RatingFilterButton
          key={stars}
          isSelected={value === stars}
          onClick={() => onChange(value === stars ? undefined : stars)}
          ariaLabel={productMessages.reviews.formatStarRatingLabel(stars)}
        >
          <span className="flex items-center gap-0.5">
            <ReviewStarFilled13Icon />
            <span>{stars}</span>
          </span>
        </RatingFilterButton>
      ))}
    </div>
  );
});

interface RatingFilterButtonProps {
  isSelected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}

const RatingFilterButton = forwardRef<HTMLButtonElement, RatingFilterButtonProps>(
  function RatingFilterButton({ isSelected, onClick, ariaLabel, children }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        aria-label={ariaLabel}
        className={`rounded-lg border px-2.5 py-1.5 text-sm text-[#151515] ${
          isSelected
            ? 'border-[#151515] bg-[#faf7f4] font-medium'
            : 'border-[#e0e0e0] bg-white font-normal'
        }`}
      >
        {children}
      </button>
    );
  },
);
