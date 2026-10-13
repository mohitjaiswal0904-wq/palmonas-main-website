'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ArrowRightIcon, CartBagIcon, PlusIcon } from '@/components/icons';
import { ProductCardQuantityStepper } from '@/components/product/ProductCardQuantityStepper';
import { Loader } from '@/components/ui/Loader';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { productTokens } from '@/config/theme/product.tokens';
import { useBuyNow } from '@/hooks/cart/useBuyNow';
import { useProductCartState } from '@/hooks/cart/useProductCartState';
import { useCart } from '@/hooks/useCart';
import {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
  trackProductBuyNowClicked,
} from '@/lib/analytics/track-product-cart-events';
import {
  isCollectionAddToCartFlightPath,
  playAddToCartFlight,
  subscribeAddToCartFlight,
} from '@/lib/cart/add-to-cart-flight';
import { cn } from '@/lib/utils/cn';
import {
  getDefaultVariantId,
  productNeedsChooseOptions,
} from '@/lib/utils/product-needs-choose-options';
import { useChooseOptions } from '@/providers/product/ChooseOptionsProvider';
import type { Product } from '@/types/product';

interface AddToCartButtonProps {
  product: Product;
  variant?: 'default' | 'card' | 'look-card';
  variantId?: string;
  className?: string;
}

export function AddToCartButton({
  product,
  variant = 'default',
  variantId,
  className,
}: AddToCartButtonProps) {
  const { actions, isMutating, updatingLineId, removingLineId } = useCart();
  const { createAndCheckout } = useBuyNow();
  const {
    showInCart,
    quantity,
    lineQuantity,
    lineId,
    matchingLines,
    markAddedLocally,
    resolvedVariantId,
  } = useProductCartState(product, variantId);
  const { openChooseOptions } = useChooseOptions();
  const pathname = usePathname();
  const cardCtaRef = useRef<HTMLButtonElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isQtyPending, setIsQtyPending] = useState(false);
  const [revealStepper, setRevealStepper] = useState(false);
  const [holdForFlight, setHoldForFlight] = useState(false);
  const animateReveal = showInCart && revealStepper && !holdForFlight;

  const needsOptions = !variantId && productNeedsChooseOptions(product.variants);
  const cartLines = matchingLines ?? [];

  // Keep the listing card still while its clone flies, so the CTA does not swap mid-motion.
  useEffect(() => {
    return subscribeAddToCartFlight((flight) => {
      if (flight.productHandle !== product.handle) {
        return;
      }

      setHoldForFlight(true);
      window.setTimeout(() => {
        setHoldForFlight(false);
        setRevealStepper(true);
      }, cartTheme.addToCartFlight.durationMs);
    });
  }, [product.handle]);

  const runAdd = async (options?: { fly?: boolean }) => {
    const nextVariantId = resolvedVariantId ?? getDefaultVariantId(product.variants);
    if (!nextVariantId) return;

    const shouldFly =
      Boolean(options?.fly) && variant === 'card' && isCollectionAddToCartFlightPath(pathname);

    if (shouldFly) {
      playAddToCartFlight({
        source: cardCtaRef.current,
        productHandle: product.handle,
        imageUrl: product.image || product.images[0],
      });
    } else {
      setIsAdding(true);
    }

    try {
      await actions.addItem(nextVariantId, 1);
      markAddedLocally();
      if (!shouldFly) {
        setRevealStepper(true);
      }
      trackProductAddedToCart(product, nextVariantId);
    } finally {
      setIsAdding(false);
    }
  };

  const runBuyNow = async () => {
    const nextVariantId = resolvedVariantId ?? getDefaultVariantId(product.variants);
    if (!nextVariantId) return;
    await createAndCheckout(nextVariantId, 1, false);
  };

  const trackAddClick = () => {
    trackProductAddToCartClicked(product);
  };

  const trackBuyNowClick = () => {
    trackProductBuyNowClicked(product);
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    trackAddClick();
    if (needsOptions) {
      openChooseOptions({
        product,
        intent: 'addToCart',
        onAddedToCart: markAddedLocally,
      });
      return;
    }
    void runAdd({ fly: true });
  };

  const handleBuyNow = () => {
    trackBuyNowClick();
    if (needsOptions) {
      openChooseOptions({
        product,
        intent: 'buyNow',
        onAddedToCart: markAddedLocally,
      });
      return;
    }
    void runBuyNow();
  };

  const isThisLineUpdating =
    isAdding ||
    isQtyPending ||
    (lineId != null && (updatingLineId === lineId || removingLineId === lineId)) ||
    cartLines.some((line) => updatingLineId === line.id || removingLineId === line.id);
  const isLineBusy = isThisLineUpdating || isMutating;

  /** Shows a stepper spinner until the cart quantity mutation settles. */
  const runQtyMutation = async (mutate: () => Promise<unknown>) => {
    setIsQtyPending(true);
    try {
      await mutate();
    } catch {
      // useCart already toasts mutation errors
    } finally {
      setIsQtyPending(false);
    }
  };

  /** Increments the matched line, or opens the variant qty sheet on listing cards. */
  const handleIncreaseQuantity = () => {
    if (isLineBusy) return;
    if (needsOptions && cartLines.length > 0) {
      openChooseOptions({
        product,
        intent: 'removeFromCart',
        matchingLines: cartLines,
      });
      return;
    }
    if (needsOptions) {
      trackAddClick();
      openChooseOptions({
        product,
        intent: 'addToCart',
        onAddedToCart: markAddedLocally,
      });
      return;
    }
    if (lineId) {
      void runQtyMutation(() => actions.updateQuantity(lineId, (lineQuantity || quantity) + 1));
      return;
    }
    void runQtyMutation(runAdd);
  };

  /** Decrements one cart line, or asks which in-cart variant to drop. */
  const decrementOrPickVariant = () => {
    if (isLineBusy) return;
    if (needsOptions && cartLines.length > 0) {
      openChooseOptions({
        product,
        intent: 'removeFromCart',
        matchingLines: cartLines,
      });
      return;
    }
    if (!lineId) return;
    const currentLineQty = lineQuantity || quantity;
    if (currentLineQty <= 1) {
      void runQtyMutation(() => actions.removeItem(lineId));
      return;
    }
    void runQtyMutation(() => actions.updateQuantity(lineId, currentLineQty - 1));
  };

  if (variant === 'card') {
    if (showInCart && !holdForFlight) {
      return (
        <ProductCardQuantityStepper
          quantity={Math.max(quantity, 1)}
          onDecrease={decrementOrPickVariant}
          onIncrease={handleIncreaseQuantity}
          onRemove={decrementOrPickVariant}
          disabled={isLineBusy}
          isLoading={isThisLineUpdating}
          canDecrease={Boolean(lineId) || cartLines.length > 0}
          animateReveal={animateReveal}
          className={className}
        />
      );
    }

    return (
      <button
        ref={cardCtaRef}
        type="button"
        className={cn(
          productTokens.cardCta.addButtonClass,
          isAdding && productTokens.cardCta.addPressClass,
          className,
        )}
        aria-label={isAdding ? cartMessages.addingToCart : cartMessages.a11y.addToCart}
        aria-busy={isAdding || undefined}
        disabled={isAdding}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart();
        }}
      >
        {isAdding ? (
          <Loader className={productTokens.cardCta.addLoaderClass} />
        ) : (
          <PlusIcon className={productTokens.cardCta.addIconClass} />
        )}
      </button>
    );
  }

  if (variant === 'look-card') {
    return (
      <button
        type="button"
        className={cn(
          'relative z-10 flex min-h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-stone-900 px-4 py-3.5 text-xs font-medium tracking-[0.12em] text-white uppercase',
          className,
        )}
        aria-label={isAdding ? cartMessages.addingToCart : cartMessages.a11y.addToCart}
        aria-busy={isAdding || undefined}
        disabled={isAdding}
        onClick={(event) => {
          event.stopPropagation();
          handleAddToCart();
        }}
      >
        {isAdding ? (
          <Loader className="h-5 w-5 border-white/30 border-t-white" />
        ) : (
          <>
            <CartBagIcon />
            <span>{cartMessages.addToCartUpper}</span>
            <ArrowRightIcon />
          </>
        )}
      </button>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {showInCart ? (
        <ProductCardQuantityStepper
          tone="pdp"
          quantity={Math.max(quantity, 1)}
          onDecrease={decrementOrPickVariant}
          onIncrease={handleIncreaseQuantity}
          onRemove={decrementOrPickVariant}
          disabled={isLineBusy}
          isLoading={isThisLineUpdating}
          canDecrease={Boolean(lineId) || cartLines.length > 0}
          animateReveal={animateReveal}
        />
      ) : (
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-2 bg-stone-900 px-4 py-3.5 text-xs font-medium tracking-[0.12em] text-white uppercase disabled:opacity-60"
          aria-label={isAdding ? cartMessages.addingToCart : cartMessages.a11y.addToCart}
          aria-busy={isAdding || undefined}
          disabled={isAdding}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <Loader className="h-5 w-5 border-white/30 border-t-white" />
          ) : (
            <>
              <CartBagIcon />
              <span>{cartMessages.addToCartUpper}</span>
              <ArrowRightIcon />
            </>
          )}
        </button>
      )}
      <button
        type="button"
        className="min-h-12 w-full bg-stone-900 px-4 py-3.5 text-xs font-medium tracking-[0.12em] text-white uppercase"
        aria-label={cartMessages.a11y.buyItNow}
        onClick={handleBuyNow}
      >
        {cartMessages.buyItNow}
      </button>
    </div>
  );
}
