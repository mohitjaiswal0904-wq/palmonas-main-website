/** Minimum average rating required to show the rating widget (PLP cards + PDP header). */
export const MIN_VISIBLE_PRODUCT_RATING = 4;

/**
 * Returns whether a product rating widget should render.
 *
 * Matches PLP card behavior: show when average is at least 4.
 *
 * @param avgRating - Product average rating on a 5-star scale.
 * @returns True when the rating chip/badge should be visible.
 */
export function shouldShowProductRating(avgRating: number): boolean {
  return avgRating >= MIN_VISIBLE_PRODUCT_RATING;
}
