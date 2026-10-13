'use client';

import { useEffect, useState } from 'react';

import { StickyAddToCartAddedMotion } from '@/components/product/StickyAddToCartAddedMotion';
import {
  cartMessages,
  formatStickyAddToCartA11y,
  formatStickyAddToCartLabel,
} from '@/config/cart/cart.config';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { useBuyNow } from '@/hooks/cart/useBuyNow';
import { useProductCartState } from '@/hooks/cart/useProductCartState';
import { usePdpHeaderPriceVisibility } from '@/hooks/product/usePdpHeaderPriceVisibility';
import { useCart } from '@/hooks/useCart';
import {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
  trackProductBuyNowClicked,
} from '@/lib/analytics/track-product-cart-events';
import { pulseCartFlyTarget } from '@/lib/cart/add-to-cart-flight';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';
import { getDefaultVariantId } from '@/lib/utils/product-needs-choose-options';
import { isProductPurchasable } from '@/lib/utils/variant-options';
import { PRODUCT_CATEGORY, type Product } from '@/types/product';

const nunitoSans = { className: 'font-semibold' };

interface StickyAddToCartBarProps {
  product: Product;
  /** Selected PDP variant — add/buy run immediately with this id. */
  variantId?: string;
  className?: string;
}

export function StickyAddToCartBar({ product, variantId, className }: StickyAddToCartBarProps) {
  const { actions } = useCart();
  const { createAndCheckout, loading: buyNowLoading } = useBuyNow();
  const { markAddedLocally, quantity, resolvedVariantId } = useProductCartState(product, variantId);
  const {
    isHeaderPriceVisible,
    price: headerPrice,
    compareAtPrice: headerCompareAt,
  } = usePdpHeaderPriceVisibility();
  const [isAdding, setIsAdding] = useState(false);
  const [showAddedMotion, setShowAddedMotion] = useState(false);
  const isGoldProduct = product.productCategory === PRODUCT_CATEGORY.GOLD;
  const ctaBg = isGoldProduct ? productTheme.gold.cta : productTheme.demifine.cta;
  const outlineColor = isGoldProduct ? productTheme.gold.accent : productTheme.ink;

  const resolveVariantId = () =>
    variantId ?? resolvedVariantId ?? getDefaultVariantId(product.variants);

  const activeVariantId = resolveVariantId();
  const activeVariant = product.variants.find((variant) => variant.id === activeVariantId);
  const inStock = isProductPurchasable(product, activeVariant);
  const actionsDisabled = !inStock;
  const canShowStickyPrice = headerPrice != null;
  const showStickyPrice = !isHeaderPriceVisible && canShowStickyPrice;
  const showStickyCompare =
    canShowStickyPrice && headerCompareAt != null && headerCompareAt > headerPrice;

  // Hold the full in-button add motion, then return to Add to Cart (no qty stepper).
  useEffect(() => {
    if (!showAddedMotion) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      pulseCartFlyTarget();
      setShowAddedMotion(false);
    }, productTheme.stickyBarAdded.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showAddedMotion]);

  /** Adds the currently selected PDP variant to cart and tracks the conversion. */
  const handleAddToCart = async () => {
    if (actionsDisabled || isAdding) return;
    const nextVariantId = resolveVariantId();
    if (!nextVariantId) return;

    trackProductAddToCartClicked(product);

    setIsAdding(true);
    setShowAddedMotion(true);
    try {
      await actions.addItem(nextVariantId, 1);
      markAddedLocally();
      trackProductAddedToCart(product, nextVariantId);
    } catch {
      setShowAddedMotion(false);
    } finally {
      setIsAdding(false);
    }
  };

  /** Starts buy-now checkout for the currently selected PDP variant. */
  const handleBuyNow = async () => {
    if (actionsDisabled) return;
    const nextVariantId = resolveVariantId();
    if (!nextVariantId) return;
    trackProductBuyNowClicked(product);
    try {
      await createAndCheckout(nextVariantId, 1, false);
    } catch {
      // Buy-now hook surfaces the failure toast.
    }
  };

  return (
    <div
      className={cn('z-sticky fixed inset-x-0 bottom-0 border-t', className)}
      style={{
        backgroundColor: productTheme.stickyBarBg,
        borderColor: productTheme.borderHairline,
        boxShadow: productTheme.stickyBarShadow,
      }}
      role="region"
      aria-label={cartMessages.a11y.addToCartActions}
      data-out-of-stock={actionsDisabled ? 'true' : undefined}
    >
      <div className="laptop:px-8 laptop:py-4 px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className={productTheme.pdpRhythm.stickyBarRowClass}>
          {headerPrice != null ? (
            <div
              className={cn(
                productTheme.pdpRhythm.stickyBarPriceWrapClass,
                productTheme.pdpRhythm.stickyBarPriceRevealClass,
              )}
              data-visible={showStickyPrice ? 'true' : 'false'}
              aria-hidden={showStickyPrice ? undefined : true}
              aria-label={showStickyPrice ? productMessages.a11y.stickyBarPrice : undefined}
            >
              <div className={productTheme.pdpRhythm.stickyBarPriceRevealInnerClass}>
                <p
                  className={cn(
                    productTheme.pdpRhythm.stickyBarPriceClass,
                    themeFonts.sans.className,
                  )}
                  style={{ color: productTheme.ink }}
                >
                  {showStickyCompare && headerCompareAt != null ? (
                    <span
                      className={productTheme.pdpRhythm.stickyBarCompareClass}
                      style={{ color: productTheme.compareAt }}
                    >
                      {formatPrice(headerCompareAt)}
                    </span>
                  ) : null}
                  <span className={productTheme.pdpRhythm.stickyBarSellingClass}>
                    <span className={productTheme.pdpRhythm.stickyBarSellingInnerClass}>
                      {formatPrice(headerPrice)}
                    </span>
                  </span>
                </p>
              </div>
            </div>
          ) : null}
          {actionsDisabled ? (
            <div
              className={cn(
                'laptop:flex laptop:justify-end',
                canShowStickyPrice && productTheme.pdpRhythm.stickyBarPairWithPriceClass,
              )}
            >
              <button
                type="button"
                className={cn(
                  productTheme.stickyBarCtaWidthClass,
                  'laptop:w-[140px] flex cursor-not-allowed items-center justify-center rounded-[10px] px-5 text-[14px] font-normal tracking-wide text-white opacity-40',
                  nunitoSans.className,
                )}
                style={{ backgroundColor: ctaBg }}
                aria-label={cartMessages.outOfStockCta}
                disabled
              >
                {cartMessages.outOfStockCta}
              </button>
            </div>
          ) : (
            <div
              className={cn(
                productTheme.stickyBarPairClass,
                canShowStickyPrice && productTheme.pdpRhythm.stickyBarPairWithPriceClass,
              )}
            >
              <button
                type="button"
                className={cn(
                  productTheme.stickyBarCtaWidthClass,
                  'flex cursor-pointer items-center justify-center rounded-[10px] border bg-white px-5 text-[14px] font-normal tracking-wide',
                  nunitoSans.className,
                )}
                style={{ borderColor: outlineColor, color: outlineColor }}
                aria-label={cartMessages.a11y.buyNow}
                disabled={buyNowLoading}
                onClick={() => void handleBuyNow()}
              >
                {cartMessages.buyNow}
              </button>
              {showAddedMotion ? (
                <button
                  type="button"
                  className={cn(
                    productTheme.stickyBarCtaWidthClass,
                    'flex items-center justify-center rounded-[10px] px-5 text-[14px] font-semibold tracking-wide text-white',
                    nunitoSans.className,
                  )}
                  style={{ backgroundColor: ctaBg }}
                  aria-label={cartMessages.a11y.addedToCart}
                  disabled
                >
                  <StickyAddToCartAddedMotion />
                </button>
              ) : (
                <button
                  type="button"
                  className={cn(
                    productTheme.stickyBarCtaWidthClass,
                    productTheme.stickyBarAtcShineClass,
                    'flex cursor-pointer items-center justify-center rounded-[10px] px-5 text-[14px] font-normal tracking-wide text-white disabled:opacity-60',
                    nunitoSans.className,
                  )}
                  style={{ backgroundColor: ctaBg }}
                  aria-label={formatStickyAddToCartA11y(quantity)}
                  disabled={isAdding}
                  onClick={() => void handleAddToCart()}
                >
                  {formatStickyAddToCartLabel(quantity)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
