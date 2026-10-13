import {
  buildProductReviewsPath,
  DEFAULT_PRODUCT_REVIEWS_FILTER,
  parseProductReviewPeriod,
  parseProductReviewRating,
  parseProductReviewsFilter,
} from '@/lib/product/product-reviews-path';

describe('buildProductReviewsPath', () => {
  it('builds base reviews path for default Most Relevant filter', () => {
    expect(buildProductReviewsPath('gold-ring', DEFAULT_PRODUCT_REVIEWS_FILTER)).toBe(
      '/products/gold-ring/reviews',
    );
  });

  it('includes most_recent when that period is explicitly selected', () => {
    expect(
      buildProductReviewsPath('gold-ring', { kind: 'period', period: 'most_recent' }),
    ).toBe('/products/gold-ring/reviews?period=most_recent');
  });

  it('includes only period when period filter is active', () => {
    expect(
      buildProductReviewsPath('gold-ring', { kind: 'period', period: 'last_3_months' }),
    ).toBe('/products/gold-ring/reviews?period=last_3_months');
  });

  it('includes only rating when star filter is active', () => {
    expect(buildProductReviewsPath('gold-ring', { kind: 'rating', rating: 5 })).toBe(
      '/products/gold-ring/reviews?rating=5',
    );
  });
});

describe('parseProductReviewsFilter', () => {
  it('prefers rating when both query params are present', () => {
    expect(parseProductReviewsFilter('last_3_months', '5')).toEqual({
      kind: 'rating',
      rating: 5,
    });
  });

  it('returns period filter when only period is present', () => {
    expect(parseProductReviewsFilter('all', undefined)).toEqual({
      kind: 'period',
      period: 'all',
    });
  });

  it('defaults to Most Relevant when query params are missing', () => {
    expect(parseProductReviewsFilter(undefined, undefined)).toEqual({
      kind: 'relevant',
    });
  });
});

describe('parseProductReviewPeriod', () => {
  it('returns valid period values', () => {
    expect(parseProductReviewPeriod('all')).toBe('all');
  });

  it('falls back to most_recent for invalid values', () => {
    expect(parseProductReviewPeriod('invalid')).toBe('most_recent');
  });
});

describe('parseProductReviewRating', () => {
  it('parses star ratings 1–5', () => {
    expect(parseProductReviewRating('3')).toBe(3);
  });

  it('returns undefined for invalid ratings', () => {
    expect(parseProductReviewRating('0')).toBeUndefined();
    expect(parseProductReviewRating('abc')).toBeUndefined();
  });
});
