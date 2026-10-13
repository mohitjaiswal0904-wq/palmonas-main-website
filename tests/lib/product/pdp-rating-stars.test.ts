import { getPdpStarFillPercents, PDP_RATING_STAR_COUNT } from '@/lib/product/pdp-rating-stars';

describe('getPdpStarFillPercents', () => {
  it('fills four stars and 70% of the fifth for 4.7', () => {
    expect(getPdpStarFillPercents(4.7)).toEqual([100, 100, 100, 100, 70]);
  });

  it('fills all five stars for a perfect score', () => {
    expect(getPdpStarFillPercents(5)).toEqual([100, 100, 100, 100, 100]);
  });

  it('returns empty stars when the rating is not finite', () => {
    expect(getPdpStarFillPercents(Number.NaN)).toEqual([0, 0, 0, 0, 0]);
  });

  it('clamps scores above five and below zero', () => {
    expect(getPdpStarFillPercents(8)).toHaveLength(PDP_RATING_STAR_COUNT);
    expect(getPdpStarFillPercents(8)).toEqual([100, 100, 100, 100, 100]);
    expect(getPdpStarFillPercents(-2)).toEqual([0, 0, 0, 0, 0]);
  });
});
