/** PDP reviews block id used by the rating-count jump. */
export const PRODUCT_REVIEWS_SECTION_ID = 'reviews';

/**
 * Smooth-scrolls to the PDP reviews section.
 *
 * Relies on `scroll-margin` on the target so the sticky header does not cover it.
 */
export function scrollToProductReviewsSection(): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.getElementById(PRODUCT_REVIEWS_SECTION_ID)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}
