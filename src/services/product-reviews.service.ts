/** Client-only — fetches/creates product reviews via @/lib/api. */
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { MOST_RELEVANT_REVIEW_RATING } from '@/lib/product/product-reviews-path';
import type {
  CreateProductReviewEnvelopeApiResponse,
  CreateProductReviewInput,
  ProductReview,
  ProductReviewApiResponse,
  ProductReviewsEnvelopeApiResponse,
  ProductReviewsFilter,
  ProductReviewsQueryParams,
  ProductReviewsResponse,
} from '@/types/product/reviews';
import {
  transformProductReview,
  transformProductReviewsResponse,
} from '@/types/product/reviews.transforms';

interface GetProductReviewsParams extends ProductReviewsQueryParams {
  page: number;
}

function toReviewsQueryParams(params: GetProductReviewsParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    page_size: params.pageSize,
  };

  if (params.filter.kind === 'rating') {
    query.rating = params.filter.rating;
  } else if (params.filter.kind === 'relevant') {
    query.rating = MOST_RELEVANT_REVIEW_RATING;
  } else {
    query.period = params.filter.period;
  }

  return query;
}

/**
 * Unwrap create-review envelope or bare review row.
 *
 * @param raw - API envelope or review object.
 * @returns Inner review row.
 */
function unwrapCreatedReview(
  raw: CreateProductReviewEnvelopeApiResponse | ProductReviewApiResponse,
): ProductReviewApiResponse {
  if ('data' in raw && raw.data && typeof raw.data === 'object' && 'id' in raw.data) {
    return raw.data;
  }

  return raw as ProductReviewApiResponse;
}

/**
 * Fetch a page of product reviews from the external API.
 *
 * @param productId - Numeric Shopify product id.
 * @param params - Pagination and a single active relevant, period, or rating filter.
 * @returns Normalised reviews page with stats.
 */
export async function getProductReviews(
  productId: string,
  params: GetProductReviewsParams,
): Promise<ProductReviewsResponse> {
  try {
    const { data } = await api.get<ProductReviewsEnvelopeApiResponse>(
      ENDPOINTS.products.reviews(productId),
      {
        params: toReviewsQueryParams(params),
      },
    );
    return transformProductReviewsResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Create a product review (authenticated). Uses multipart when an image is attached.
 *
 * @param productId - Numeric Shopify product id.
 * @param input - Rating, body, and optional image file.
 * @returns Normalised created review.
 * @throws AppError when the request fails.
 */
export async function createProductReview(
  productId: string,
  input: CreateProductReviewInput,
): Promise<ProductReview> {
  try {
    if (input.image) {
      const formData = new FormData();
      formData.append('rating', String(input.rating));
      formData.append('body', input.body);
      formData.append('image', input.image);

      const { data } = await api.post<CreateProductReviewEnvelopeApiResponse>(
        ENDPOINTS.products.reviews(productId),
        formData,
        {
          // Drop instance JSON Content-Type so the browser sets multipart boundary.
          headers: { 'Content-Type': undefined as unknown as string },
        },
      );

      return transformProductReview(unwrapCreatedReview(data));
    }

    const { data } = await api.post<CreateProductReviewEnvelopeApiResponse>(
      ENDPOINTS.products.reviews(productId),
      {
        rating: input.rating,
        body: input.body,
      },
    );

    return transformProductReview(unwrapCreatedReview(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

export type { ProductReviewsFilter };
