import { resolveProductUsps } from '@/lib/product/resolve-product-usps';

describe('resolveProductUsps', () => {
  it('keeps known API keys in the given order', () => {
    expect(
      resolveProductUsps(['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated']),
    ).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated']);
  });

  it('keeps the optional fourth adjustable-rings USP from the API', () => {
    expect(
      resolveProductUsps([
        'anti_tarnish',
        'skin_safe_jewellery',
        'gold_tone_plated',
        'adjustable_rings',
      ]),
    ).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'gold_tone_plated', 'adjustable_rings']);
  });

  it('prefers API usps over tags', () => {
    expect(
      resolveProductUsps(['anti_tarnish', 'skin_safe_jewellery', 'gold_plated_14k'], [
        'Platinum_Plated_Silver',
      ]),
    ).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'gold_plated_14k']);
  });

  it('derives the third USP from product tags when the API omits usps', () => {
    expect(resolveProductUsps(null, ['Platinum_Plated_Silver'])).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'platinum_plated',
    ]);
    expect(
      resolveProductUsps(undefined, [{ name: 'collection', value: 'Odetonature_Collection' }]),
    ).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'gold_plated_14k']);
    expect(resolveProductUsps(null, [[], ['Platinum_Plated_Silver']])).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'platinum_plated',
    ]);
    expect(resolveProductUsps(null, ['Metal_925 Sterling_Silver'])).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'sterling_silver_925',
    ]);
  });

  it('defaults the third USP to gold tone and adds adjustable rings from tags', () => {
    expect(resolveProductUsps(undefined)).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'gold_tone_plated',
    ]);
    expect(resolveProductUsps(null, ['Metal_Stainless Steel', 'Adjustable_Rings'])).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'gold_tone_plated',
      'adjustable_rings',
    ]);
  });

  it('returns an empty list when the API sends an empty usps array', () => {
    expect(resolveProductUsps([])).toEqual([]);
    expect(resolveProductUsps(['unknown_usp', 12], ['Platinum_Plated_Silver'])).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'platinum_plated',
    ]);
  });
});
