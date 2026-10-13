import type {
  ProductReview,
  ProductReviewApiResponse,
  ProductReviewRatingDistribution,
  ProductReviewStats,
  ProductReviewStatsApiResponse,
  ProductReviewsEnvelopeApiResponse,
  ProductReviewsListApiData,
  ProductReviewsResponse,
} from '@/types/product/reviews';

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

/**
 * Normalise optional star rating from API (null when Loox import omits it).
 *
 * @param value - Raw rating field.
 * @returns Whole-star rating 1–5, or null when absent/invalid.
 */
function toReviewRating(value: unknown): number | null {
  const rating = toNumber(value);

  if (rating <= 0 || rating > 5) {
    return null;
  }

  return rating;
}

/**
 * Build 5→1 star distribution rows when API provides counts.
 *
 * @param raw - Stats payload from reviews list API.
 * @returns Sorted distribution rows, or null when unavailable.
 */
function transformRatingDistribution(
  raw: ProductReviewStatsApiResponse,
): ProductReviewRatingDistribution[] | null {
  const distribution = raw.rating_distribution;

  if (!distribution || Object.keys(distribution).length === 0) {
    return null;
  }

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: toNumber(distribution[String(stars)]),
  }));
}

/**
 * Map a single review API row to the PDP domain model.
 *
 * @param raw - Review row from list API.
 * @returns Normalised review.
 */
export function transformProductReview(raw: ProductReviewApiResponse): ProductReview {
  return {
    id: raw.id,
    reviewerName: (raw.title ?? '').trim() || 'Anonymous',
    body: (raw.body ?? '').trim(),
    rating: toReviewRating(raw.rating),
    helpfulCount: toNumber(raw.helpful_count),
    notHelpfulCount: toNumber(raw.not_helpful_count),
    isVerifiedPurchase: raw.is_verified_purchase === true,
    createdAt: raw.created_at,
  };
}

/**
 * Map review stats block from list API.
 *
 * @param raw - Stats payload.
 * @returns Normalised stats for summary sidebar.
 */
export function transformProductReviewStats(
  raw: ProductReviewStatsApiResponse,
): ProductReviewStats {
  return {
    reviewsCount: toNumber(raw.reviews_count),
    averageRating: toNumber(raw.average_rating),
    ratingDistribution: transformRatingDistribution(raw),
  };
}

/**
 * Unwrap reviews list envelope or bare data object.
 *
 * @param raw - API envelope or inner data.
 * @returns Inner list payload.
 */
function unwrapProductReviewsList(
  raw: ProductReviewsEnvelopeApiResponse | ProductReviewsListApiData,
): ProductReviewsListApiData {
  if ('data' in raw && raw.data) {
    return raw.data;
  }

  return raw as ProductReviewsListApiData;
}

/**
 * Transform paginated product reviews API response.
 *
 * @param raw - Reviews list envelope from external API.
 * @returns Domain paginated reviews payload.
 */
export function transformProductReviewsResponse(
  raw: ProductReviewsEnvelopeApiResponse | ProductReviewsListApiData,
): ProductReviewsResponse {
  const payload = unwrapProductReviewsList(raw);

  return {
    reviews: (payload.reviews ?? []).map(transformProductReview),
    stats: transformProductReviewStats(payload.stats),
    page: toNumber(payload.page) || 1,
    pageSize: toNumber(payload.page_size) || payload.reviews?.length || 0,
    totalCount:
      toNumber(payload.total_count) || toNumber(payload.count) || (payload.reviews?.length ?? 0),
    hasNext: payload.has_next === true,
  };
}
