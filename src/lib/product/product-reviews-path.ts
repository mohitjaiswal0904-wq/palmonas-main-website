import type {
  ProductReviewPeriod,
  ProductReviewStarRating,
  ProductReviewsFilter,
} from '@/types/product/reviews';

/** Star rating requested when the “Most Relevant” filter is active. */
export const MOST_RELEVANT_REVIEW_RATING: ProductReviewStarRating = 5;

/** Default reviews list filter — most relevant (5-star reviews). */
export const DEFAULT_PRODUCT_REVIEWS_FILTER: ProductReviewsFilter = {
  kind: 'relevant',
};

/**
 * Parse mutually exclusive review filter from URL search params.
 * Rating takes precedence when both are present. Missing params default to Most Relevant.
 *
 * @param periodParam - Raw `period` query value.
 * @param ratingParam - Raw `rating` query value.
 * @returns Active period or rating filter.
 */
export function parseProductReviewsFilter(
  periodParam: unknown,
  ratingParam: unknown,
): ProductReviewsFilter {
  const rating = parseProductReviewRating(ratingParam);

  if (rating !== undefined) {
    return { kind: 'rating', rating };
  }

  if (typeof periodParam === 'string' && periodParam.length > 0) {
    return { kind: 'period', period: parseProductReviewPeriod(periodParam) };
  }

  return DEFAULT_PRODUCT_REVIEWS_FILTER;
}

/**
 * Build the all-reviews page path with a single active filter query param.
 *
 * @param handle - Product handle from route.
 * @param filter - Active period or rating filter.
 * @returns Internal href for reviews page.
 */
export function buildProductReviewsPath(handle: string, filter: ProductReviewsFilter): string {
  const params = new URLSearchParams();

  if (filter.kind === 'rating') {
    params.set('rating', String(filter.rating));
  } else if (filter.kind === 'period') {
    params.set('period', filter.period);
  }

  const query = params.toString();

  return `/products/${encodeURIComponent(handle.trim())}/reviews${query ? `?${query}` : ''}`;
}

const VALID_PERIODS: ProductReviewPeriod[] = [
  'most_recent',
  'last_3_months',
  'last_6_months',
  'all',
];

/**
 * Parse review period from URL search param.
 *
 * @param value - Raw query value.
 * @returns Valid period or `most_recent`.
 */
export function parseProductReviewPeriod(value: unknown): ProductReviewPeriod {
  if (typeof value === 'string' && VALID_PERIODS.includes(value as ProductReviewPeriod)) {
    return value as ProductReviewPeriod;
  }

  return 'most_recent';
}

/**
 * Parse optional star rating from URL search param.
 *
 * @param value - Raw query value.
 * @returns Star rating 1–5, or undefined when absent/invalid.
 */
export function parseProductReviewRating(value: unknown): ProductReviewStarRating | undefined {
  const parsed = Number(typeof value === 'string' ? value : Number.NaN);

  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) {
    return parsed as ProductReviewStarRating;
  }

  return undefined;
}
