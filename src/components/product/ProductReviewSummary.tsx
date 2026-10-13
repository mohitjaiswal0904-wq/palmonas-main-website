import { ReviewStarFilled12Icon, ReviewStarFilled20Icon } from '@/components/icons/review-icons';
import { ProductReviewStars } from '@/components/product/ProductReviewStars';
import { isProductFeatureEnabled, productMessages } from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import { getSummaryStarCount } from '@/lib/product/review-utils';
import type { ProductReviewStarRating, ProductReviewStats } from '@/types/product/reviews';

interface ProductReviewSummaryProps {
  stats: ProductReviewStats;
  selectedRating?: ProductReviewStarRating;
  onRatingSelect?: (rating: ProductReviewStarRating | undefined) => void;
  onWriteReview?: () => void;
}

/**
 * Ratings summary — compact mobile header (Figma 976:88478) + cream card on laptop.
 */
export function ProductReviewSummary({
  stats,
  selectedRating,
  onRatingSelect,
  onWriteReview,
}: ProductReviewSummaryProps) {
  const writeReviewEnabled =
    isProductFeatureEnabled('writeProductReview') && onWriteReview !== undefined;
  const { reviewsCount, averageRating, ratingDistribution } = stats;
  const formattedRating = averageRating.toFixed(1);
  const summaryStars = getSummaryStarCount(averageRating);
  const maxDistributionCount =
    ratingDistribution?.reduce((max, row) => Math.max(max, row.count), 0) ?? 0;

  const handleRatingClick = (stars: ProductReviewStarRating, count: number) => {
    if (!onRatingSelect || count <= 0) {
      return;
    }

    onRatingSelect(selectedRating === stars ? undefined : stars);
  };

  return (
    <aside className="laptop:w-[340px] laptop:shrink-0 w-full">
      {/* Mobile compact header — Figma 976:88480 / 88484 / 88485 / 88487 */}
      <div className="laptop:hidden flex items-center justify-between gap-4">
        <h2 id="product-reviews-heading" className={productTokens.reviews.mobileSectionTitle}>
          {productMessages.reviews.sectionTitle}
        </h2>
        <div className="flex shrink-0 items-center gap-0.5">
          <span className={productTokens.reviews.mobileRating}>{formattedRating}</span>
          <ReviewStarFilled20Icon className={productTokens.reviews.mobileStar} />
          <span className={productTokens.reviews.mobileCount}>
            {productMessages.reviews.formatReviewCount(reviewsCount).toLowerCase()}
          </span>
        </div>
      </div>

      {/* Desktop cream card */}
      <div className="laptop:block hidden rounded-2xl bg-[#faf7f4] px-8 py-8 text-center">
        <p className="text-5xl leading-none font-bold text-[#151515]">{formattedRating}</p>
        <div className="mt-3 flex justify-center">
          <ProductReviewStars count={summaryStars} size="summary" />
        </div>
        <p className="mt-2 text-sm text-[#595959]">
          {productMessages.reviews.formatBasedOnCount(reviewsCount)}
        </p>
      </div>

      {ratingDistribution ? (
        <ul
          className="laptop:mt-6 mt-3 flex flex-col gap-3"
          aria-label={productMessages.reviews.a11y.distribution}
        >
          {ratingDistribution.map((row) => {
            const barWidth =
              maxDistributionCount > 0
                ? `${Math.max((row.count / maxDistributionCount) * 100, row.count > 0 ? 2 : 0)}%`
                : '0%';
            const stars = row.stars as ProductReviewStarRating;
            const isSelected = selectedRating === stars;
            const isInteractive = row.count > 0 && onRatingSelect !== undefined;

            return (
              <li key={row.stars}>
                {isInteractive ? (
                  <button
                    type="button"
                    onClick={() => handleRatingClick(stars, row.count)}
                    className={`laptop:gap-2 flex w-full items-center gap-1 text-left ${
                      isSelected ? 'rounded-md bg-[#faf7f4] ring-1 ring-[#151515]/20' : ''
                    }`}
                    aria-pressed={isSelected}
                    aria-label={productMessages.reviews.formatRatingFilterLabel(stars, row.count)}
                  >
                    <DistributionRowContent row={row} barWidth={barWidth} />
                  </button>
                ) : (
                  <div className="laptop:gap-2 flex items-center gap-1">
                    <DistributionRowContent row={row} barWidth={barWidth} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {selectedRating !== undefined && onRatingSelect && (
        <button
          type="button"
          onClick={() => onRatingSelect(undefined)}
          className="mt-3 text-sm text-[#151515] underline"
          aria-label={productMessages.reviews.clearRatingFilter}
        >
          {productMessages.reviews.clearRatingFilter}
        </button>
      )}

      {writeReviewEnabled ? (
        <button
          type="button"
          className="laptop:mt-6 laptop:h-12 laptop:font-semibold mt-3 h-9 w-full rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: productTokens.ink }}
          aria-label={productMessages.reviews.writeReview}
          onClick={onWriteReview}
        >
          {productMessages.reviews.writeReview}
        </button>
      ) : null}
    </aside>
  );
}

function DistributionRowContent({
  row,
  barWidth,
}: {
  row: { stars: number; count: number };
  barWidth: string;
}) {
  return (
    <>
      <span className="laptop:w-2 laptop:text-sm w-3 shrink-0 text-base text-[#151515]">
        {row.stars}
      </span>
      <ReviewStarFilled12Icon />
      <div className="laptop:h-2 laptop:bg-[#e5e5e5] h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(3,2,19,0.2)]">
        <div
          className="laptop:bg-[#151515] h-2 rounded-full bg-[#030213]"
          style={{ width: barWidth }}
        />
      </div>
      <span className="laptop:w-7 laptop:text-sm laptop:text-[#595959] w-8 shrink-0 text-right text-base text-[#4A4A4A]">
        {row.count}
      </span>
    </>
  );
}
