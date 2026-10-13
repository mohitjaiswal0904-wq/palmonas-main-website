'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CartAppliedOfferCard } from '@/components/cart/CartAppliedOfferCard';
import { CouponTicketStub } from '@/components/cart/CouponTicketStub';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';

interface CartFormRowProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onApply?: () => void;
  disabled?: boolean;
  applyLabel?: string;
  inputAriaLabel?: string;
  applyAriaLabel?: string;
  /** `coupon` = attached green Apply (Figma 3734:51324); default = gift-card style. */
  appearance?: 'default' | 'coupon';
}

/** Grey input + Apply — default gift-card row, or coupon attached control. */
export function CartFormRow({
  value,
  onChange,
  placeholder,
  onApply,
  disabled = false,
  applyLabel = cartMessages.apply,
  inputAriaLabel,
  applyAriaLabel,
  appearance = 'default',
}: CartFormRowProps) {
  const [isFocused, setIsFocused] = useState(false);

  if (appearance === 'coupon') {
    return (
      <div
        className="flex h-9 w-full overflow-hidden rounded-lg border bg-white"
        style={{
          borderColor: isFocused ? cartTheme.couponAppliedSolid : cartTheme.couponInputBorder,
          // Inset ring keeps the full left edge visible (outline is clipped by overflow-hidden).
          boxShadow: isFocused
            ? `inset 0 0 0 1px ${cartTheme.couponAppliedSolid}, 0px 1px 2px 0px rgba(0,0,0,0.08)`
            : '0px 1px 2px 0px rgba(0,0,0,0.08)',
        }}
        data-testid="cart-coupon-form-row"
        data-focused={isFocused || undefined}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={inputAriaLabel ?? placeholder}
          className={cartTheme.couponInputClass}
        />
        <button
          type="button"
          className="h-full shrink-0 rounded-r-[7px] px-3 text-xs font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: cartTheme.couponAppliedSolid }}
          onClick={onApply}
          disabled={disabled}
          aria-label={applyAriaLabel ?? applyLabel}
        >
          {applyLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-9 w-full gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={inputAriaLabel ?? placeholder}
        className="h-9 min-w-0 flex-1 rounded-lg px-3 text-xs text-[#1f1f1f] placeholder:text-[#64748b] disabled:opacity-60"
        style={{ backgroundColor: cartTheme.formInputBg }}
      />
      <button
        type="button"
        className="h-9 w-auto shrink-0 rounded-lg border bg-white px-[17px] text-[13px] font-medium text-[#151515] disabled:opacity-60"
        style={{ borderColor: cartTheme.borderLight }}
        onClick={onApply}
        disabled={disabled}
        aria-label={applyAriaLabel ?? applyLabel}
      >
        {applyLabel}
      </button>
    </div>
  );
}

interface CartOfferRowProps {
  /** Discount / coupon code (primary line). */
  code: string;
  /** Offer detail under the code. */
  detail?: string;
  applied?: boolean;
  /** Unlock CTA — soft green Add Items link (Figma 3743:52555). */
  unlockHref?: string;
  onApply?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  applyAriaLabel?: string;
  removeAriaLabel?: string;
  unlockAriaLabel?: string;
  /** Rotated stub label (defaults to OFFER). */
  stubLabel?: string;
  /** Applied-state amount shown as the ticket’s main value. */
  savingAmount?: string;
  /** Hide Apply / Add Items (swap candidate uses Swap below the row). */
  hideCta?: boolean;
}

/**
 * Coupon/offer ticket row — applied / available Apply / unlock Add Items.
 */
export function CartOfferRow({
  code,
  detail,
  applied = false,
  unlockHref,
  onApply,
  onRemove,
  disabled = false,
  applyAriaLabel,
  removeAriaLabel,
  unlockAriaLabel,
  stubLabel = cartMessages.offerStub,
  savingAmount,
  hideCta = false,
}: CartOfferRowProps) {
  const displayCode = toOfferDisplayCaps(code);
  const isUnlock = Boolean(unlockHref) && !applied;

  if (applied) {
    return (
      <CartAppliedOfferCard
        code={code}
        detail={detail}
        savingAmount={savingAmount}
        disabled={disabled}
        onRemove={onRemove}
        removeAriaLabel={removeAriaLabel}
      />
    );
  }

  return (
    <div
      className="flex h-11 w-full overflow-hidden rounded-xl border border-dashed bg-[rgba(255,255,255,0.9)]"
      style={{ borderColor: cartTheme.couponTicketBorderAvailable }}
      data-testid={isUnlock ? 'cart-offer-row-unlock' : 'cart-offer-row'}
    >
      <CouponTicketStub label={stubLabel} variant="notch" />
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
        {hideCta && savingAmount ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] leading-3.5 font-semibold"
            style={{
              backgroundColor: cartTheme.couponAppliedBadgeBg,
              color: cartTheme.successGreen,
            }}
            data-testid="cart-offer-extra-saved"
          >
            {savingAmount}
          </span>
        ) : hideCta ? null : isUnlock && unlockHref ? (
          <Link
            href={unlockHref}
            className="shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] leading-3.5 font-semibold no-underline"
            style={{
              backgroundColor: cartTheme.couponAddItemsBg,
              color: cartTheme.couponAddItemsText,
            }}
            aria-label={
              unlockAriaLabel ?? cartMessages.a11y.addItemsForOffer.replace('{code}', displayCode)
            }
          >
            {cartMessages.addItems}
          </Link>
        ) : (
          <button
            type="button"
            className="shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] leading-3.5 font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: cartTheme.couponAppliedSolid }}
            onClick={onApply}
            disabled={disabled}
            aria-label={applyAriaLabel ?? cartMessages.apply}
          >
            {cartMessages.apply}
          </button>
        )}
      </div>
    </div>
  );
}
