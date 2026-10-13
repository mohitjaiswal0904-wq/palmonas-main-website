'use client';

import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { themeFonts } from '@/config/theme/fonts';
import { shouldShowCartCouponDiscount } from '@/lib/cart/cart-price-breakdown';
import { cn } from '@/lib/utils/cn';
import type { CartSummary } from '@/types/cart';

interface CartPriceBreakdownProps {
  summary: CartSummary;
  currency?: string;
  walletApplied?: number;
  payableTotal?: number;
  walletLoading?: boolean;
  walletToggled?: boolean;
  giftWrapTotal?: number;
  /** Applied store coupon code (unused in the slim summary). */
  couponCode?: string | null;
  className?: string;
}

/** Slim cart totals: subtotal, coupon, shipping, savings, estimated total. */
export function CartPriceBreakdown({
  summary,
  currency = 'INR',
  payableTotal,
  giftWrapTotal = 0,
  className = '',
}: CartPriceBreakdownProps) {
  const format = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const finalTotal = (payableTotal ?? summary.payableTotal) + giftWrapTotal;
  const showCouponDiscount = shouldShowCartCouponDiscount(summary.couponDiscount);
  const totalSavings = summary.mrpDiscount + summary.couponDiscount;

  return (
    <div
      className={cn(
        themeFonts.sans.className,
        cartTheme.orderSummaryCardClass,
        'scroll-mb-[var(--cart-sticky-clearance,8rem)]',
        className,
      )}
      style={{ borderColor: cartTheme.orderSummaryCardBorder }}
      data-testid="cart-price-breakdown"
    >
      <h3
        className={cartTheme.orderSummaryTitleClass}
        style={{ color: cartTheme.orderSummaryValue }}
      >
        {cartMessages.orderSummary}
      </h3>

      <div className={cartTheme.orderSummaryRowsClass}>
        <div className={cartTheme.orderSummaryRowClass}>
          <span
            className={cartTheme.orderSummaryLabelClass}
            style={{ color: cartTheme.orderSummaryLabel }}
          >
            {cartMessages.sellingPrice}
          </span>
          <span
            className={cartTheme.orderSummaryValueClass}
            style={{ color: cartTheme.orderSummaryValue }}
            data-testid="cart-selling-price"
          >
            {format(summary.sellingPrice)}
          </span>
        </div>

        {showCouponDiscount ? (
          <div className={cartTheme.orderSummaryRowClass} data-testid="cart-coupon-discount">
            <span
              className={cartTheme.orderSummaryLabelClass}
              style={{ color: cartTheme.orderSummaryLabel }}
            >
              {cartMessages.couponDiscount}
            </span>
            <span
              className={cartTheme.orderSummaryValueClass}
              style={{ color: cartTheme.orderSummaryPositive }}
            >
              −{format(summary.couponDiscount)}
            </span>
          </div>
        ) : null}

        <div className={cartTheme.orderSummaryRowClass}>
          <span
            className={cartTheme.orderSummaryLabelClass}
            style={{ color: cartTheme.orderSummaryLabel }}
          >
            {cartMessages.delivery}
          </span>
          <span
            className={cartTheme.orderSummaryValueClass}
            style={{ color: cartTheme.orderSummaryPositive }}
          >
            {cartMessages.free}
          </span>
        </div>

        <div className={cartTheme.orderSummaryRowClass} data-testid="cart-total-savings">
          <span
            className={cartTheme.orderSummaryLabelClass}
            style={{ color: cartTheme.orderSummaryLabel }}
          >
            {cartMessages.totalSavings}
          </span>
          <span
            className={cartTheme.orderSummaryValueClass}
            style={{ color: cartTheme.orderSummaryPositive }}
          >
            {format(totalSavings)}
          </span>
        </div>
      </div>

      <div
        className={cn(cartTheme.orderSummaryTotalWrapClass, 'mt-3.5')}
        style={{ borderColor: cartTheme.orderSummaryDivider }}
      >
        <span
          className={cartTheme.orderSummaryTotalLabelClass}
          style={{ color: cartTheme.orderSummaryValue }}
        >
          {cartMessages.totalPayable}
        </span>
        <span
          className={cartTheme.orderSummaryTotalValueClass}
          style={{ color: cartTheme.orderSummaryValue }}
          data-testid="cart-payable-total"
        >
          {format(finalTotal)}
        </span>
      </div>
    </div>
  );
}
