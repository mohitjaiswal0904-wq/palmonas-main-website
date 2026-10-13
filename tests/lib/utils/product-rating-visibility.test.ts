import {
  MIN_VISIBLE_PRODUCT_RATING,
  shouldShowProductRating,
} from '@/lib/utils/product-rating-visibility';

describe('shouldShowProductRating', () => {
  it('shows ratings at or above the minimum threshold', () => {
    expect(shouldShowProductRating(MIN_VISIBLE_PRODUCT_RATING)).toBe(true);
    expect(shouldShowProductRating(4.5)).toBe(true);
  });

  it('hides ratings below the minimum threshold', () => {
    expect(shouldShowProductRating(3.9)).toBe(false);
    expect(shouldShowProductRating(0)).toBe(false);
  });
});
