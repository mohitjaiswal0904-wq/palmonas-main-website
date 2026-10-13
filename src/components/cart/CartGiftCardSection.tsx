'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CartFormRow } from '@/components/cart/cart-input-rows';
import { CartCloseIcon } from '@/components/icons/cart-icons';
import {
  cartConfig,
  cartMessages,
  cartTheme,
  isCartFeatureEnabled,
} from '@/config/cart/cart.config';

/** Gift card input, applied banner, See All Gifts Cards link. */
export function CartGiftCardSection() {
  const [code, setCode] = useState(cartConfig.mock.giftCard?.appliedCode ?? '');
  const [applied, setApplied] = useState(true);
  const giftCard = cartConfig.mock.giftCard;

  if (!isCartFeatureEnabled('giftCard') || !giftCard) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-[#e2e8f0] pt-5" data-testid="cart-gift-card-section">
      <p className="text-sm leading-[14px] font-medium tracking-tight text-[#151515]">
        {cartMessages.giftCard}
      </p>
      <CartFormRow value={code} onChange={setCode} placeholder={cartMessages.giftCardPlaceholder} />
      {applied ? (
        <div
          className="flex h-9 w-full items-center gap-2.5 rounded-lg pr-1 pl-3"
          style={{
            backgroundColor: cartTheme.offerAppliedBg,
            border: `1px solid ${cartTheme.successGreen}`,
          }}
          data-testid="cart-gift-card-applied"
        >
          <span className="min-w-0 flex-1 text-[13px] leading-5 font-normal tracking-tight text-black">
            {cartMessages.giftCardApplied}
          </span>
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-black"
            aria-label={cartMessages.a11y.dismissGiftCard}
            onClick={() => setApplied(false)}
          >
            <CartCloseIcon />
          </button>
        </div>
      ) : null}
      <div className="flex justify-center pt-1">
        <Link
          href="/cart/gift-cards"
          className="text-sm text-[#1f1f1f] no-underline"
          data-testid="cart-see-all-gift-cards"
        >
          {cartMessages.seeAllGiftCards}
        </Link>
      </div>
    </div>
  );
}
