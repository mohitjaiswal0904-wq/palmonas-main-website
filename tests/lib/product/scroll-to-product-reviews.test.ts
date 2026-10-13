import {
  PRODUCT_REVIEWS_SECTION_ID,
  scrollToProductReviewsSection,
} from '@/lib/product/scroll-to-product-reviews';

describe('scrollToProductReviewsSection', () => {
  it('smooth-scrolls the reviews section into view', () => {
    const section = document.createElement('section');
    section.id = PRODUCT_REVIEWS_SECTION_ID;
    section.scrollIntoView = jest.fn();
    document.body.appendChild(section);

    scrollToProductReviewsSection();

    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    section.remove();
  });

  it('uses a stable reviews section id', () => {
    expect(PRODUCT_REVIEWS_SECTION_ID).toBe('reviews');
  });

  it('does nothing when the reviews section is missing', () => {
    expect(() => scrollToProductReviewsSection()).not.toThrow();
  });

  it('does nothing when document lookup returns null', () => {
    const getElementById = jest.spyOn(document, 'getElementById').mockReturnValue(null);

    expect(() => scrollToProductReviewsSection()).not.toThrow();

    getElementById.mockRestore();
  });
});
