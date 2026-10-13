import { render, screen } from '@testing-library/react';

import { ProductReviewsLoader } from '@/components/product/ProductReviewsLoader';
import { productTokens } from '@/config/theme/product.tokens';
import { PRODUCT_REVIEWS_SECTION_ID } from '@/lib/product/scroll-to-product-reviews';

jest.mock('@/components/product/ProductReviewsSection', () => ({
  ProductReviewsSection: () => <div>reviews-body</div>,
}));

describe('ProductReviewsLoader', () => {
  it('anchors the reviews block for in-page jumps', () => {
    const { container } = render(
      <ProductReviewsLoader productId="1" productHandle="gold-ring" />,
    );

    const anchor = container.querySelector(`#${PRODUCT_REVIEWS_SECTION_ID}`);
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveClass(...productTokens.reviews.sectionAnchorClass.split(' '));
    expect(screen.getByText('reviews-body')).toBeInTheDocument();
  });

  it('keeps the reviews section id stable', () => {
    const { container } = render(
      <ProductReviewsLoader productId="1" productHandle="gold-ring" />,
    );

    expect(container.querySelector('#reviews')).toBe(container.firstChild);
  });
});
