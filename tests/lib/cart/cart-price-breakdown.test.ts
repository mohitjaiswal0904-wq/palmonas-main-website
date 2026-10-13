import {
  computeCartMrpDiscount,
  resolveCartPriceBreakdown,
  shouldShowCartCouponDiscount,
} from '@/lib/cart/cart-price-breakdown';

describe('computeCartMrpDiscount', () => {
  it('returns zero when subtotal equals payable total', () => {
    expect(
      computeCartMrpDiscount({ subtotal: 1000, total: 1000, discount: 0 }, null),
    ).toBe(0);
  });

  it('returns product savings when no coupon is applied', () => {
    expect(
      computeCartMrpDiscount({ subtotal: 21722, total: 6493, discount: 15229 }, null),
    ).toBe(15229);
  });

  it('splits MRP savings from coupon when both apply', () => {
    expect(
      computeCartMrpDiscount(
        { subtotal: 14132, total: 2999, discount: 997 },
        'monsoon4',
      ),
    ).toBe(10136);
  });

  it('does not double-count coupon savings as MRP discount', () => {
    expect(
      computeCartMrpDiscount(
        { subtotal: 21722, total: 6493, discount: 15229 },
        'b1g1',
      ),
    ).toBe(0);
  });
});

describe('resolveCartPriceBreakdown', () => {
  it('maps the five API price_calculations fields', () => {
    expect(
      resolveCartPriceBreakdown(
        {
          total_mrp: 61671,
          mrp_discount: 21179,
          subtotal_before_coupon: 40492,
          coupon_discount: 21179,
          payable_total: 19313,
        },
        { subtotal: 0, total: 0 },
      ),
    ).toEqual({
      totalMrp: 61671,
      mrpDiscount: 21179,
      sellingPrice: 40492,
      couponDiscount: 21179,
      payableTotal: 19313,
    });
  });

  it('falls back to cost totals when price_calculations is missing', () => {
    expect(resolveCartPriceBreakdown(undefined, { subtotal: 1000, total: 1000 })).toEqual({
      totalMrp: 1000,
      mrpDiscount: 0,
      sellingPrice: 1000,
      couponDiscount: 0,
      payableTotal: 1000,
    });
  });

  it('uses legacy total_discount as coupon when a code is present', () => {
    expect(
      resolveCartPriceBreakdown(
        {
          total_mrp: 14132,
          total_selling_price: 2999,
          total_discount: 997,
        },
        { subtotal: 14132, total: 2999 },
        'monsoon4',
      ),
    ).toEqual({
      totalMrp: 14132,
      mrpDiscount: 10136,
      sellingPrice: 3996,
      couponDiscount: 997,
      payableTotal: 2999,
    });
  });

  it('treats legacy total_discount as MRP savings when no coupon is present', () => {
    expect(
      resolveCartPriceBreakdown(
        {
          total_mrp: 21722,
          total_selling_price: 6493,
          total_discount: 15229,
        },
        { subtotal: 21722, total: 6493 },
        null,
      ),
    ).toEqual({
      totalMrp: 21722,
      mrpDiscount: 15229,
      sellingPrice: 6493,
      couponDiscount: 0,
      payableTotal: 6493,
    });
  });
});

describe('shouldShowCartCouponDiscount', () => {
  it('returns true when coupon discount is positive', () => {
    expect(shouldShowCartCouponDiscount(997)).toBe(true);
  });

  it('returns false when coupon discount is zero', () => {
    expect(shouldShowCartCouponDiscount(0)).toBe(false);
  });

  it('returns false when coupon discount is negative', () => {
    expect(shouldShowCartCouponDiscount(-10)).toBe(false);
  });
});
