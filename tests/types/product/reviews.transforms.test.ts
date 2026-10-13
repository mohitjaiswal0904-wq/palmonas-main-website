import {
  transformProductReview,
  transformProductReviewStats,
  transformProductReviewsResponse,
} from '@/types/product/reviews.transforms';

const sampleReview = {
  id: 22,
  product_id: 8417236779265,
  variant_id: null,
  customer_id: null,
  rating: null,
  title: 'Aseem G.',
  body: 'Great product',
  status: 'visible',
  is_verified_purchase: false,
  helpful_count: 2,
  not_helpful_count: 1,
  report_count: 0,
  created_at: '2026-07-31T09:52:03.103146Z',
  updated_at: '2026-07-31T09:52:03.103146Z',
};

describe('transformProductReview', () => {
  it('maps reviewer name from title and normalises counts', () => {
    expect(transformProductReview(sampleReview)).toEqual({
      id: 22,
      reviewerName: 'Aseem G.',
      body: 'Great product',
      rating: null,
      helpfulCount: 2,
      notHelpfulCount: 1,
      isVerifiedPurchase: false,
      createdAt: '2026-07-31T09:52:03.103146Z',
    });
  });

  it('returns null rating when value is out of range', () => {
    expect(transformProductReview({ ...sampleReview, rating: 0 })).toMatchObject({
      rating: null,
    });
    expect(transformProductReview({ ...sampleReview, rating: 6 })).toMatchObject({
      rating: null,
    });
  });

  it('keeps valid star ratings', () => {
    expect(transformProductReview({ ...sampleReview, rating: 4 })).toMatchObject({
      rating: 4,
    });
  });

  it('trims reviewer name and body whitespace', () => {
    expect(
      transformProductReview({
        ...sampleReview,
        title: '  Nitin K.  ',
        body: '  Awesome product  ',
      }),
    ).toMatchObject({
      reviewerName: 'Nitin K.',
      body: 'Awesome product',
    });
  });

  it('survives null title and body without throwing', () => {
    expect(
      transformProductReview({
        ...sampleReview,
        title: null,
        body: null,
      }),
    ).toMatchObject({
      reviewerName: 'Anonymous',
      body: '',
    });
  });

  it('falls back to Anonymous when title is blank', () => {
    expect(
      transformProductReview({
        ...sampleReview,
        title: '   ',
      }),
    ).toMatchObject({
      reviewerName: 'Anonymous',
    });
  });
});

describe('transformProductReviewStats', () => {
  it('maps stats and builds 5→1 distribution rows', () => {
    expect(
      transformProductReviewStats({
        product_id: 1,
        reviews_count: 592,
        rating_count: 592,
        average_rating: 4.7,
        rating_distribution: { '5': 224, '4': 2, '3': 2, '2': 2, '1': 2 },
      }),
    ).toEqual({
      reviewsCount: 592,
      averageRating: 4.7,
      ratingDistribution: [
        { stars: 5, count: 224 },
        { stars: 4, count: 2 },
        { stars: 3, count: 2 },
        { stars: 2, count: 2 },
        { stars: 1, count: 2 },
      ],
    });
  });

  it('returns null distribution when API omits counts', () => {
    expect(
      transformProductReviewStats({
        product_id: 1,
        reviews_count: 10,
        rating_count: 10,
        average_rating: 4.5,
        rating_distribution: null,
      }).ratingDistribution,
    ).toBeNull();
  });
});

describe('transformProductReviewsResponse', () => {
  it('unwraps envelope and maps pagination fields', () => {
    const result = transformProductReviewsResponse({
      data: {
        product_id: 8417236779265,
        reviews: [sampleReview],
        stats: {
          product_id: 8417236779265,
          reviews_count: 592,
          rating_count: 592,
          average_rating: 4.7,
          rating_distribution: null,
        },
        count: 1,
        page: 2,
        page_size: 20,
        total_count: 100,
        has_next: true,
      },
    });

    expect(result.reviews).toHaveLength(1);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(20);
    expect(result.hasNext).toBe(true);
    expect(result.stats.reviewsCount).toBe(592);
  });

  it('handles bare list payload without envelope', () => {
    const result = transformProductReviewsResponse({
      product_id: 1,
      reviews: [],
      stats: {
        product_id: 1,
        reviews_count: 0,
        rating_count: 0,
        average_rating: 0,
        rating_distribution: null,
      },
      count: 0,
      page: 1,
      page_size: 4,
      total_count: 0,
      has_next: false,
    });

    expect(result.reviews).toEqual([]);
    expect(result.hasNext).toBe(false);
  });

  it('falls back totalCount to reviews length when API total_count is 0', () => {
    const result = transformProductReviewsResponse({
      product_id: 1,
      reviews: [sampleReview],
      stats: {
        product_id: 1,
        reviews_count: 1,
        rating_count: 1,
        average_rating: 5,
        rating_distribution: null,
      },
      count: 0,
      page: 1,
      page_size: 20,
      total_count: 0,
      has_next: false,
    });

    expect(result.totalCount).toBe(1);
  });
});
