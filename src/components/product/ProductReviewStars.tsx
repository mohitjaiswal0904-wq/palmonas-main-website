import {
  ReviewStarFilled12Icon,
  ReviewStarFilled13Icon,
  ReviewStarFilled20Icon,
} from '@/components/icons/review-icons';

interface ProductReviewStarsProps {
  count: number;
  size?: 'summary' | 'card';
  className?: string;
}

const STAR_ICONS = {
  summary: ReviewStarFilled20Icon,
  card: ReviewStarFilled13Icon,
} as const;

/**
 * Render a row of filled gold stars (Figma-aligned).
 *
 * @param count - Number of stars to show (0–5).
 * @param size - Icon size variant for summary vs card.
 */
export function ProductReviewStars({
  count,
  size = 'card',
  className = 'flex items-center gap-0.5',
}: ProductReviewStarsProps) {
  const StarIcon = STAR_ICONS[size];
  const filledCount = Math.min(5, Math.max(0, count));

  if (filledCount === 0) {
    return null;
  }

  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: filledCount }, (_, index) => (
        <StarIcon key={index} />
      ))}
    </div>
  );
}

export { ReviewStarFilled12Icon };
