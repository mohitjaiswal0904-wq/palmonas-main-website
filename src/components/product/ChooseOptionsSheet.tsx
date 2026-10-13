'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ChooseOptionsOverlay } from '@/components/product/ChooseOptionsOverlay';
import { StickyAddToCartAddedMotion } from '@/components/product/StickyAddToCartAddedMotion';
import { VariantSelector } from '@/components/product/VariantSelector';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { productTheme } from '@/config/product/product.config';
import { useBuyNow } from '@/hooks/cart/useBuyNow';
import { useCart } from '@/hooks/useCart';
import {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
  trackProductBuyNowClicked,
} from '@/lib/analytics/track-product-cart-events';
import {
  isCollectionAddToCartFlightPath,
  playAddToCartFlight,
  pulseCartFlyTarget,
} from '@/lib/cart/add-to-cart-flight';
import { formatPrice } from '@/lib/format-price';
import { getDefaultVariant, isVariantPurchasable } from '@/lib/utils/variant-options';
import type { Product, ProductVariant } from '@/types/product';

export type ChooseOptionsIntent = 'addToCart' | 'buyNow';

interface ChooseOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  intent: ChooseOptionsIntent;
  /** Called after a successful add-to-cart from this sheet (parent flips in-cart UI). */
  onAddedToCart?: () => void;
}

const overlay = cartTheme.chooseOptionsOverlay;

/** Variant picker: bottom sheet below `tab`, Figma dialog from `tab` up. */
export function ChooseOptionsSheet({
  open,
  onClose,
  product,
  intent,
  onAddedToCart,
}: ChooseOptionsSheetProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    () =>
      product.variants.find((variant) => isVariantPurchasable(variant, product.productCategory)) ??
      getDefaultVariant(product.variants),
  );
  const { actions } = useCart();
  const { createAndCheckout, loading: buyNowLoading } = useBuyNow();
  const pathname = usePathname();
  const addCtaRef = useRef<HTMLButtonElement>(null);
  const actionBusyRef = useRef(false);
  const [submitKind, setSubmitKind] = useState<ChooseOptionsIntent | null>(null);
  const [showAddedMotion, setShowAddedMotion] = useState(false);
  const isBusy = submitKind !== null || buyNowLoading || showAddedMotion;
  const isInStock = isVariantPurchasable(selectedVariant, product.productCategory);
  const displayPrice = selectedVariant?.price ?? product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const productImage = selectedVariant?.image ?? product.image;

  const handleClose = useCallback(() => {
    if (!isBusy) onClose();
  }, [isBusy, onClose]);

  // Keep the sheet open through the in-button add motion, then close.
  useEffect(() => {
    if (!showAddedMotion) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      pulseCartFlyTarget();
      setShowAddedMotion(false);
      onClose();
    }, productTheme.stickyBarAdded.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onClose, showAddedMotion]);

  const handleAction = async (kind: ChooseOptionsIntent) => {
    if (!selectedVariant || !isInStock || actionBusyRef.current || buyNowLoading) return;
    if (kind === 'buyNow') {
      trackProductBuyNowClicked(product);
    } else {
      trackProductAddToCartClicked(product);
    }
    actionBusyRef.current = true;
    setSubmitKind(kind);
    try {
      if (kind === 'buyNow') {
        await createAndCheckout(selectedVariant.id, 1, false);
      } else {
        setShowAddedMotion(true);
        if (isCollectionAddToCartFlightPath(pathname)) {
          playAddToCartFlight({
            source: addCtaRef.current,
            productHandle: product.handle,
            imageUrl: productImage || product.image || product.images[0],
          });
        }
        await actions.addItem(selectedVariant.id, 1);
        onAddedToCart?.();
        trackProductAddedToCart(product, selectedVariant.id);
        return;
      }
      onClose();
    } catch {
      // The cart hooks surface the user-facing error; keep the picker open for retry.
      setShowAddedMotion(false);
    } finally {
      actionBusyRef.current = false;
      setSubmitKind(null);
    }
  };

  return (
    <ChooseOptionsOverlay open={open} onClose={handleClose} title={cartMessages.chooseOptions}>
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className={overlay.imageWrapClass} style={{ backgroundColor: overlay.imageBg }}>
            {productImage ? (
              <Image
                src={productImage}
                alt={product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-medium" style={{ color: overlay.titleColor }}>
              {product.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-base font-bold" style={{ color: overlay.titleColor }}>
                {formatPrice(displayPrice)}
              </span>
              {compareAtPrice && compareAtPrice > displayPrice ? (
                <span className="text-xs line-through" style={{ color: overlay.compareAt }}>
                  {formatPrice(compareAtPrice)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {product.variants.length > 0 ? (
          <VariantSelector
            variants={product.variants}
            productCategory={product.productCategory}
            onVariantChange={setSelectedVariant}
            showStock={false}
          />
        ) : (
          <p className="text-sm text-amber-600">{cartMessages.noOptionsAvailable}</p>
        )}

        <p
          className="text-xs font-medium"
          style={{
            color: isInStock && selectedVariant ? overlay.inStock : cartTheme.outOfStock,
          }}
        >
          {isInStock && selectedVariant ? `✓ ${cartMessages.inStock}` : cartMessages.outOfStock}
        </p>

        <div className="flex gap-3 border-t pt-3" style={{ borderColor: overlay.actionBorder }}>
          <button
            type="button"
            className="h-12 flex-1 rounded-xl border-2 bg-white text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: overlay.titleColor, color: overlay.titleColor }}
            disabled={isBusy || !selectedVariant || !isInStock}
            aria-label={cartMessages.a11y.buyNow}
            onClick={() => void handleAction('buyNow')}
          >
            {submitKind === 'buyNow' || buyNowLoading
              ? cartMessages.buyingNow
              : cartMessages.buyNow}
          </button>
          {intent !== 'buyNow' ? (
            <button
              ref={addCtaRef}
              type="button"
              className="relative h-12 flex-1 overflow-hidden rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: overlay.titleColor }}
              disabled={isBusy || !selectedVariant || !isInStock}
              aria-label={
                showAddedMotion ? cartMessages.a11y.addedToCart : cartMessages.a11y.addToCart
              }
              onClick={() => void handleAction('addToCart')}
            >
              {showAddedMotion ? (
                <StickyAddToCartAddedMotion />
              ) : submitKind === 'addToCart' ? (
                cartMessages.addingToCart
              ) : (
                cartMessages.addToCart
              )}
            </button>
          ) : null}
        </div>
      </div>
    </ChooseOptionsOverlay>
  );
}
