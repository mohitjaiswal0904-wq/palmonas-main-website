'use client';

import { CouponTicketStub } from '@/components/cart/CouponTicketStub';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';

interface CartAppliedOfferCardProps {
  code: string;
  detail?: string;
  savingAmount?: string;
  disabled?: boolean;
  onRemove?: () => void;
  removeAriaLabel?: string;
}

/** Applied offer ticket — same stub and row as available, with Remove on the ticket. */
export function CartAppliedOfferCard({
  code,
  detail,
  savingAmount,
  disabled = false,
  onRemove,
  removeAriaLabel,
}: CartAppliedOfferCardProps) {
  const displayCode = toOfferDisplayCaps(code);

  return (
    <div
      className="flex h-11 w-full overflow-hidden rounded-xl border border-dashed bg-[rgba(255,255,255,0.9)]"
      style={{ borderColor: cartTheme.couponTicketBorderAvailable }}
      data-testid="cart-offer-row-applied"
    >
      <CouponTicketStub label={cartMessages.appliedStub} variant="notch" applied />
      <div className="relative z-0 flex min-w-0 flex-1 items-center gap-2 bg-inherit px-3 py-2">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="truncate text-xs leading-4 font-semibold tracking-tight text-[#151515]">
            {displayCode}
          </span>
          {detail ? (
            <span
              className="w-full truncate text-[10px] leading-3.5 font-normal"
              style={{ color: cartTheme.couponTicketDetail }}
            >
              {detail}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {savingAmount ? (
            <span
              data-testid="cart-coupon-saving"
              className="rounded-full px-2.5 py-1 text-center text-[10px] leading-3.5 font-semibold"
              style={{
                backgroundColor: cartTheme.couponAppliedBadgeBg,
                color: cartTheme.successGreen,
              }}
            >
              <span className="font-semibold" data-testid="cart-coupon-saving-amount">
                −{savingAmount}
              </span>{' '}
              {cartMessages.savedLabel}
            </span>
          ) : (
            <span
              className="rounded-full px-2.5 py-1 text-center text-[10px] leading-3.5 font-semibold text-white"
              style={{ backgroundColor: cartTheme.couponAppliedSolid }}
            >
              {cartMessages.applied}
            </span>
          )}
          {onRemove ? (
            <button
              type="button"
              className="text-[10px] leading-3.5 font-semibold disabled:opacity-60"
              style={{ color: cartTheme.couponRemoveText }}
              onClick={onRemove}
              disabled={disabled}
              aria-label={removeAriaLabel ?? cartMessages.a11y.removeCoupon}
            >
              {cartMessages.remove}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
