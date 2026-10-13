import {
  extractLineDiscountPercent,
  resolveAppliedLineDiscountBadges,
} from '@/lib/cart/format-line-discount-applied';

describe('extractLineDiscountPercent', () => {
  it('uses Shopify percentage value when present', () => {
    expect(extractLineDiscountPercent('mega40', 'percentage', 40)).toBe(40);
  });

  it('reads a percent fragment from offer copy', () => {
    expect(extractLineDiscountPercent('Flat 40% Off')).toBe(40);
  });

  it('ignores fixed_amount values that are not percents', () => {
    expect(extractLineDiscountPercent('mega40', 'fixed_amount', 90320)).toBeUndefined();
  });

  it('returns undefined when copy has no percent', () => {
    expect(extractLineDiscountPercent('Buy 1 Get 1')).toBeUndefined();
  });
});

describe('resolveAppliedLineDiscountBadges', () => {
  it('uses matching applicable_discounts name for Flat N% Off Applied', () => {
    expect(
      resolveAppliedLineDiscountBadges(
        [{ key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' }],
        [{ key: 'mega40', label: 'Flat 40% Off', code: 'mega40' }],
      ),
    ).toEqual([{ key: 'mega40', label: 'Flat 40% Off Applied' }]);
  });

  it('uses discount-list detail when applicable name is missing', () => {
    expect(
      resolveAppliedLineDiscountBadges(
        [{ key: 'mega40', title: 'mega40', amount: 90320 }],
        [],
        [
          {
            offerType: 'store_offer',
            discountCode: 'mega40',
            discountDetail: 'Flat 40% Off',
          },
        ],
      ),
    ).toEqual([{ key: 'mega40', label: 'Flat 40% Off Applied' }]);
  });

  it('falls back to the allocation title when no offer name exists', () => {
    expect(
      resolveAppliedLineDiscountBadges([
        { key: 'mega40', title: 'mega40', amount: 90320, valueType: 'fixed_amount' },
      ]),
    ).toEqual([{ key: 'mega40', label: 'mega40 Applied' }]);
  });

  it('returns empty when allocations are missing or untitled', () => {
    expect(resolveAppliedLineDiscountBadges(undefined)).toEqual([]);
    expect(resolveAppliedLineDiscountBadges([])).toEqual([]);
    expect(resolveAppliedLineDiscountBadges([{ key: '', title: '   ', amount: 1 }])).toEqual([]);
  });
});
