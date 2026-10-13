/** Stars shown on the PDP header rating row. */
export const PDP_RATING_STAR_COUNT = 5;

/**
 * Map an average rating onto five stars as 0–100 fill percents.
 *
 * @param rating - Average score, typically 0–5.
 * @returns One fill percent per star, left to right.
 */
export function getPdpStarFillPercents(rating: number): number[] {
  if (!Number.isFinite(rating) || rating <= 0) {
    return Array.from({ length: PDP_RATING_STAR_COUNT }, () => 0);
  }

  return Array.from({ length: PDP_RATING_STAR_COUNT }, (_, index) => {
    const fill = Math.min(1, Math.max(0, rating - index));
    return Math.round(fill * 100);
  });
}
