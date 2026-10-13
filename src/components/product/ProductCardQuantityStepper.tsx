'use client';

import { Loader } from '@/components/ui/Loader';
import { cartMessages } from '@/config/cart/cart.config';
import { productTokens } from '@/config/theme/product.tokens';
import { cn } from '@/lib/utils/cn';

interface ProductCardQuantityStepperProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
  disabled?: boolean;
  /** Replaces the +/− controls with a spinner while the cart mutation is in flight. */
  isLoading?: boolean;
  canDecrease?: boolean;
  className?: string;
  /** `card` is the listing chip; `pdp` is the full-width black CTA. */
  tone?: 'card' | 'pdp';
  /** Overrides the track fill (e.g. gold PDP CTA). */
  trackColor?: string;
  /** Plays the ATC → stepper reveal once after add. */
  animateReveal?: boolean;
}

/**
 * Quantity stepper for listing cards and the PDP in-cart CTA.
 */
export function ProductCardQuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  onRemove,
  disabled = false,
  isLoading = false,
  canDecrease = true,
  className,
  tone = 'card',
  trackColor,
  animateReveal = false,
}: ProductCardQuantityStepperProps) {
  /** Drops the line at qty 1; otherwise decrements. */
  const handleDecrease = () => {
    if (quantity <= 1) {
      onRemove();
      return;
    }
    onDecrease();
  };

  const tokens = tone === 'pdp' ? productTokens.pdpQuantity : productTokens.cardQuantity;
  const isPdp = tone === 'pdp';
  const isBusy = disabled || isLoading;

  return (
    <div
      className={cn(
        'relative z-10',
        !isPdp && 'shrink-0',
        tokens.trackClass,
        animateReveal && !isLoading && productTokens.stickyBarStepperRevealClass,
        className,
      )}
      style={{ backgroundColor: trackColor ?? tokens.track }}
      data-testid={isPdp ? 'product-pdp-quantity-stepper' : 'product-card-quantity-stepper'}
      aria-busy={isLoading || undefined}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        className={cn(
          tokens.buttonClass,
          !isPdp && 'bg-white/30 text-[#151515]',
          isLoading && 'invisible',
        )}
        aria-label={cartMessages.a11y.decreaseQuantity}
        disabled={isBusy || !canDecrease}
        onClick={handleDecrease}
      >
        −
      </button>
      <span className={cn(tokens.valueClass, isLoading && 'invisible')} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={cn(tokens.buttonClass, !isPdp && 'text-white', isLoading && 'invisible')}
        style={isPdp ? undefined : { backgroundColor: productTokens.cardQuantity.plus }}
        aria-label={cartMessages.a11y.increaseQuantity}
        disabled={isBusy}
        onClick={onIncrease}
      >
        +
      </button>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className={tokens.loaderClass} aria-label={cartMessages.a11y.updatingQuantity} />
        </div>
      ) : null}
    </div>
  );
}
