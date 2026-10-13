'use client';

import { isCartFeatureEnabled, cartMessages } from '@/config/cart/cart.config';

interface CartGiftWrapOptionProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Gift wrap checkbox — below cart items; ₹50 per product line when enabled. */
export function CartGiftWrapOption({ checked, onChange }: CartGiftWrapOptionProps) {
  if (!isCartFeatureEnabled('giftWrap')) {
    return null;
  }

  return (
    <label
      className="font-nunito-sans laptop:gap-1.5 laptop:text-base flex cursor-pointer items-start gap-1 py-2 text-xs leading-normal font-normal text-[#1f1f1f]"
      data-testid="cart-gift-wrap"
    >
      <input
        type="checkbox"
        className="laptop:size-[18px] laptop:rounded-[4.5px] size-[14px] shrink-0 rounded-[3.5px] border border-[#dadada] accent-[#151515]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{cartMessages.giftWrapLabel}</span>
    </label>
  );
}
