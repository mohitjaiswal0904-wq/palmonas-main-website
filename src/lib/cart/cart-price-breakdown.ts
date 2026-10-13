import type { ShopifyCart } from '@/types/cart/cart.types';

/** Cart-level `price_calculations` block from the cart API. */
export type CartPriceCalculations = NonNullable<ShopifyCart['price_calculations']>;

/** Display totals for the cart price breakdown. */
export interface ResolvedCartPriceBreakdown {
  totalMrp: number;
  mrpDiscount: number;
  sellingPrice: number;
  couponDiscount: number;
  payableTotal: number;
}

interface CartPriceFallback {
  subtotal: number;
  total: number;
  discount?: number;
}

/**
 * Product-level savings between MRP subtotal and payable total before coupon.
 *
 * @param summary - Cart price summary (`subtotal` is MRP when API provides it).
 * @param couponCode - Applied store coupon code, if any.
 * @returns Non-negative MRP discount amount.
 */
export function computeCartMrpDiscount(
  summary: { subtotal: number; total: number; discount: number },
  couponCode?: string | null,
): number {
  const hasCoupon = Boolean(couponCode?.trim()) && summary.discount > 0;
  const preCouponPayable = summary.total + (hasCoupon ? summary.discount : 0);
  return Math.max(0, summary.subtotal - preCouponPayable);
}

/**
 * Maps cart API price fields onto the five-row breakdown, with legacy fallbacks.
 *
 * @param calc - Raw `price_calculations` from cart GET.
 * @param fallback - Cost totals when calculation fields are missing.
 * @param couponCode - Applied store coupon code, if any.
 * @returns MRP, discounts, selling price, and payable total.
 */
export function resolveCartPriceBreakdown(
  calc: CartPriceCalculations | undefined,
  fallback: CartPriceFallback,
  couponCode?: string | null,
): ResolvedCartPriceBreakdown {
  const hasNewShape =
    calc?.mrp_discount != null ||
    calc?.subtotal_before_coupon != null ||
    calc?.coupon_discount != null ||
    calc?.payable_total != null;

  const totalMrp =
    calc?.total_mrp != null && calc.total_mrp > 0 ? calc.total_mrp : fallback.subtotal;
  const payableFromLegacy =
    calc?.total_selling_price != null && calc.total_selling_price >= 0
      ? calc.total_selling_price
      : fallback.total;

  if (!hasNewShape) {
    const discount = calc?.total_discount ?? fallback.discount ?? 0;
    const showCoupon = Boolean(couponCode?.trim()) && discount > 0;
    const couponDiscount = showCoupon ? discount : 0;
    const payableTotal = payableFromLegacy;
    const mrpDiscount = computeCartMrpDiscount(
      { subtotal: totalMrp, total: payableTotal, discount },
      couponCode,
    );
    return {
      totalMrp,
      mrpDiscount,
      sellingPrice: payableTotal + couponDiscount,
      couponDiscount,
      payableTotal,
    };
  }

  const couponDiscount = Math.max(0, calc?.coupon_discount ?? 0);
  const payableTotal =
    calc?.payable_total != null && calc.payable_total >= 0 ? calc.payable_total : payableFromLegacy;
  const sellingPrice =
    calc?.subtotal_before_coupon != null && calc.subtotal_before_coupon >= 0
      ? calc.subtotal_before_coupon
      : payableTotal + couponDiscount;
  const mrpDiscount =
    calc?.mrp_discount != null && calc.mrp_discount >= 0
      ? calc.mrp_discount
      : Math.max(0, totalMrp - sellingPrice);

  return { totalMrp, mrpDiscount, sellingPrice, couponDiscount, payableTotal };
}

/**
 * Whether the summary should show a coupon-specific discount row.
 *
 * @param couponDiscount - Coupon savings amount.
 * @returns True when a labelled coupon discount row should render.
 */
export function shouldShowCartCouponDiscount(couponDiscount: number): boolean {
  return couponDiscount > 0;
}
