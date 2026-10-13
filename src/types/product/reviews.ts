import type { ApiResponse } from '@/types/api';

/** Raw review row from `/api/v2/products/{id}/reviews`. */
export interface ProductReviewApiResponse {
  id: number;
  product_id: number;
  variant_id: number | null;
  customer_id: number | null;
  rating: number | null;
  /** Reviewer display name (Loox import uses this field; null → Anonymous). */
  title: string | null;
  /** Review body; may be null from some import sources. */
  body: string | null;
  status: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  not_helpful_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReviewStatsApiResponse {
  product_id: number;
  reviews_count: number;
  rating_count: number;
  average_rating: number;
  rating_distribution: Record<string, number> | null;
}

export interface ProductReviewsListApiData {
  product_id: number;
  reviews: ProductReviewApiResponse[];
  stats: ProductReviewStatsApiResponse;
  count: number;
  page: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
}

export type ProductReviewsEnvelopeApiResponse = ApiResponse<ProductReviewsListApiData>;

/** Time window for review list API `period` query param. */
export type ProductReviewPeriod = 'most_recent' | 'last_3_months' | 'last_6_months' | 'all';

/** Optional star filter (1–5) for review list API `rating` query param. */
export type ProductReviewStarRating = 1 | 2 | 3 | 4 | 5;

export interface ProductReview {
  id: number;
  reviewerName: string;
  body: string;
  rating: number | null;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductReviewRatingDistribution {
  stars: number;
  count: number;
}

export interface ProductReviewStats {
  reviewsCount: number;
  averageRating: number;
  /** Null when API omits `rating_distribution` — UI hides bars. */
  ratingDistribution: ProductReviewRatingDistribution[] | null;
}

export interface ProductReviewsResponse {
  reviews: ProductReview[];
  stats: ProductReviewStats;
  page: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
}

export interface ProductReviewsQueryParams {
  filter: ProductReviewsFilter;
  pageSize: number;
}

/** Mutually exclusive active filter — relevant (5★), time period, or star rating. */
export type ProductReviewsFilter =
  | { kind: 'relevant' }
  | { kind: 'period'; period: ProductReviewPeriod }
  | { kind: 'rating'; rating: ProductReviewStarRating };

/** Payload for creating a product review (POST `/api/v2/products/{id}/reviews`). */
export interface CreateProductReviewInput {
  rating: ProductReviewStarRating;
  body: string;
  /** Optional image (JPG/PNG); sent as multipart when present. */
  image?: File;
}

/** Create-review API envelope. */
export type CreateProductReviewEnvelopeApiResponse = ApiResponse<ProductReviewApiResponse>;
