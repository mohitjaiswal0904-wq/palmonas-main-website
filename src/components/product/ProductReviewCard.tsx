import { ReviewThumbsIcon } from '@/components/icons/review-icons';
import { ProductReviewStars } from '@/components/product/ProductReviewStars';
import {
  isProductFeatureEnabled,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { formatReviewDate, getReviewerInitials } from '@/lib/product/review-utils';
import type { ProductReview } from '@/types/product/reviews';

interface ProductReviewCardProps {
  review: ProductReview;
}

/**
 * Single customer review row matching Figma PDP / All Reviews cards (1079:57035).
 */
export function ProductReviewCard({ review }: ProductReviewCardProps) {
  const showVotes = isProductFeatureEnabled('reviewVotes');
  const formattedDate = formatReviewDate(review.createdAt);
  // ponytail: Loox imports often omit `rating`; default 5 so card matches Figma star row.
  // Upgrade: show true rating when API backfills per-review stars.
  const starCount = review.rating !== null ? Math.round(review.rating) : 5;

  return (
    <article className="border-b border-[#ededed] pt-5 pb-[21px] last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ece2df] text-sm font-semibold"
            style={{ color: productTheme.reviewAvatarText }}
            aria-hidden="true"
          >
            {getReviewerInitials(review.reviewerName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#151515]">{review.reviewerName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <ProductReviewStars count={starCount} size="card" />
              {formattedDate ? (
                <time
                  className="text-xs"
                  style={{ color: productTheme.textMuted }}
                  dateTime={review.createdAt}
                >
                  {formattedDate}
                </time>
              ) : null}
            </div>
          </div>
        </div>

        {showVotes ? (
          <div className="flex shrink-0 items-center gap-3.5">
            <div
              className="flex items-center gap-1"
              aria-label={`${productMessages.reviews.helpful}: ${review.helpfulCount}`}
            >
              <ReviewThumbsIcon />
              <span className="text-sm" style={{ color: productTheme.textMuted }}>
                {review.helpfulCount}
              </span>
            </div>
            <div
              className="flex items-center gap-1"
              aria-label={`${productMessages.reviews.notHelpful}: ${review.notHelpfulCount}`}
            >
              <span className="inline-flex rotate-180">
                <ReviewThumbsIcon />
              </span>
              <span className="text-sm" style={{ color: productTheme.textMuted }}>
                {review.notHelpfulCount}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {review.body ? (
        <p className="mt-3 text-sm leading-[22.75px] text-[#525252]">{review.body}</p>
      ) : null}
    </article>
  );
}
