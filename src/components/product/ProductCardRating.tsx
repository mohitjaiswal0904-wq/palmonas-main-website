import { cn } from '@/lib/utils/cn';
import { shouldShowProductRating } from '@/lib/utils/product-rating-visibility';

interface ProductCardRatingProps {
  avgRating: number;
  reviewCount: number;
  /** Compact chip for narrow cards (e.g. cart LTO 126px). */
  variant?: 'default' | 'compact';
}

/** Rating chip — score, star, review count (PLP or compact LTO). Hidden unless avg ≥ 4. */
export function ProductCardRating({
  avgRating,
  reviewCount,
  variant = 'default',
}: ProductCardRatingProps) {
  if (!shouldShowProductRating(avgRating)) return <></>;

  const compact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center bg-[#F3F3F3] leading-none font-normal',
        compact
          ? 'gap-0.5 rounded px-1 py-0.5 text-[6px] text-[#151515]'
          : 'gap-[3px] rounded-full px-1.5 py-px text-xs text-[#151515]',
      )}
      aria-label={`Product rating: ${avgRating} out of 5 from ${reviewCount} reviews`}
      data-testid={compact ? 'product-card-rating-compact' : 'product-card-rating'}
    >
      <span>{avgRating.toFixed(1)}</span>
      <svg
        viewBox="0 0 18 18"
        className={cn('shrink-0', compact ? 'h-[6px] w-[6px]' : 'h-[11px] w-[11px]')}
        aria-hidden="true"
      >
        <path
          d="m9 1.4 2.1 5.1 5.5.5-4.2 3.6 1.3 5.4L9 13.1 4.3 16l1.3-5.4L1.4 7l5.5-.5L9 1.4Z"
          fill="#f59b16"
        />
      </svg>
      <span>|{reviewCount}</span>
    </div>
  );
}
