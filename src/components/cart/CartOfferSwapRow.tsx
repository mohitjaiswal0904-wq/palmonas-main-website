'use client';

import { CartOfferRow } from '@/components/cart/cart-input-rows';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';

interface CartOfferSwapRowProps {
  betterCode: string;
  betterDetail?: string;
  extraSavedLabel: string;
  appliedCode: string;
  appliedDetail?: string;
  appliedSavingAmount?: string;
  disabled?: boolean;
  onSwap: () => void;
  onRemoveApplied: () => void;
  swapAriaLabel: string;
  removeAriaLabel?: string;
}

/** Better store offer, Swap control, then the currently applied ticket. */
export function CartOfferSwapRow({
  betterCode,
  betterDetail,
  extraSavedLabel,
  appliedCode,
  appliedDetail,
  appliedSavingAmount,
  disabled = false,
  onSwap,
  onRemoveApplied,
  swapAriaLabel,
  removeAriaLabel,
}: CartOfferSwapRowProps) {
  return (
    <div className="flex w-full flex-col gap-1.5" data-testid="cart-offer-swap">
      <CartOfferRow
        code={betterCode}
        detail={betterDetail}
        hideCta
        savingAmount={extraSavedLabel}
      />
      <div className="flex justify-center">
        <button
          type="button"
          className={cartTheme.couponSwapButtonClass}
          style={{ backgroundColor: cartTheme.couponAppliedSolid }}
          onClick={onSwap}
          disabled={disabled}
          aria-label={swapAriaLabel}
          data-testid="cart-offer-swap-button"
        >
          {cartMessages.swapOffer}
        </button>
      </div>
      <CartOfferRow
        code={appliedCode}
        detail={appliedDetail}
        applied
        savingAmount={appliedSavingAmount}
        onRemove={onRemoveApplied}
        disabled={disabled}
        removeAriaLabel={removeAriaLabel}
      />
    </div>
  );
}
