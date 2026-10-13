'use client';

import { useEffect, useState } from 'react';

import { CartQuantityStepper } from '@/components/cart/CartItemCard';
import {
  CartRemoveConfirmModal,
  type CartRemoveLoadingAction,
} from '@/components/cart/CartRemoveConfirmModal';
import { ChooseOptionsOverlay } from '@/components/product/ChooseOptionsOverlay';
import { VariantSelector } from '@/components/product/VariantSelector';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { productTheme } from '@/config/product/product.config';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useProductCartState } from '@/hooks/cart/useProductCartState';
import type { ProductCartMatchingLine } from '@/hooks/cart/useProductCartState';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { useAddWishlistItemMutation } from '@/hooks/wishlist/useWishlistMutations';
import { isLoginCancelledError } from '@/lib/auth/login-cancelled';
import { formatProductCartLineLabel } from '@/lib/cart/variant-display';
import { getDefaultVariant, isVariantPurchasable } from '@/lib/utils/variant-options';
import { extractNumericId } from '@/types/cart';
import type { Product, ProductVariant } from '@/types/product';

const overlay = cartTheme.chooseOptionsOverlay;

interface RemoveCartVariantSheetProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  matchingLines: ProductCartMatchingLine[];
}

/**
 * Resolves a readable option label for an in-cart line.
 *
 * @param line - Cart line belonging to the listing product.
 * @param product - Listing product used to fill a missing variant title.
 */
function resolveLineLabel(line: ProductCartMatchingLine, product: Product): string {
  const variant = product.variants.find(
    (item) =>
      item.id === line.variantId || extractNumericId(item.id) === extractNumericId(line.variantId),
  );
  return (
    formatProductCartLineLabel({
      variantTitle: line.variantTitle ?? variant?.title,
      size: line.size,
      color: line.color,
    }) || cartMessages.unknownVariant
  );
}

/**
 * Finds the cart line for a catalog variant, including numeric Shopify ids.
 *
 * @param lines - In-cart lines for this product.
 * @param variant - Selected catalog variant.
 * @returns Matching line, or undefined.
 */
function findLineForVariant(
  lines: ProductCartMatchingLine[],
  variant: ProductVariant,
): ProductCartMatchingLine | undefined {
  return lines.find(
    (line) =>
      line.variantId === variant.id ||
      extractNumericId(line.variantId) === extractNumericId(variant.id),
  );
}

/**
 * Qty sheet: edit or remove in-cart lines, and add another variant.
 */
export function RemoveCartVariantSheet({
  open,
  onClose,
  product,
  matchingLines,
}: RemoveCartVariantSheetProps) {
  const { actions, isMutating, updatingLineId, removingLineId } = useCart();
  const { matchingLines: liveLines } = useProductCartState(product);
  const { guardApi } = useRequireAuth();
  const { showSuccess, showError } = useToast();
  const addWishlistMutation = useAddWishlistItemMutation();
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<CartRemoveLoadingAction>(null);
  const [emptied, setEmptied] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    () =>
      product.variants.find((variant) => isVariantPurchasable(variant, product.productCategory)) ??
      getDefaultVariant(product.variants),
  );
  const lines = liveLines.length > 0 ? liveLines : matchingLines;
  const pendingLine = lines.find((line) => line.id === pendingLineId) ?? null;
  const canAddVariant =
    selectedVariant != null &&
    isVariantPurchasable(selectedVariant, product.productCategory) &&
    !isMutating &&
    pendingLineId === null;

  // Close after the last in-cart variant of this product is gone.
  useEffect(() => {
    if (open && emptied && liveLines.length === 0) {
      onClose();
    }
  }, [emptied, liveLines.length, onClose, open]);

  /** Increments one in-cart variant line. */
  const handleIncrease = (line: ProductCartMatchingLine) => {
    if (isMutating) return;
    void actions.updateQuantity(line.id, line.quantity + 1);
  };

  /** Decrements one line, or asks before deleting the last unit. */
  const handleDecrease = (line: ProductCartMatchingLine) => {
    if (isMutating) return;
    void actions.updateQuantity(line.id, line.quantity - 1);
  };

  const handleRequestRemove = (line: ProductCartMatchingLine) => {
    if (isMutating) return;
    setPendingLineId(line.id);
  };

  /** Removes the pending line after confirm. */
  const handleConfirmRemove = async () => {
    if (!pendingLine) return;
    setLoadingAction('remove');
    try {
      await actions.removeItem(pendingLine.id);
      setPendingLineId(null);
      if (lines.length <= 1) {
        setEmptied(true);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  /** Moves the product to wishlist, then drops the pending cart line. */
  const handleMoveToWishlist = async () => {
    if (!pendingLine) return;
    setLoadingAction('wishlist');
    try {
      await guardApi(() => addWishlistMutation.mutateAsync(product.id), {
        apiId: 'wishlist.add',
      });
      await actions.removeItem(pendingLine.id);
      showSuccess(cartMessages.toasts.moveToWishlist);
      setPendingLineId(null);
      if (lines.length <= 1) {
        setEmptied(true);
      }
    } catch (err) {
      if (isLoginCancelledError(err)) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      if (!message.toLowerCase().includes('already in wishlist')) {
        showError(message);
        return;
      }
      await actions.removeItem(pendingLine.id);
      showSuccess(cartMessages.toasts.moveToWishlist);
      setPendingLineId(null);
      if (lines.length <= 1) {
        setEmptied(true);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelRemove = () => {
    setPendingLineId(null);
    setLoadingAction(null);
  };

  /** Adds the selected variant, or increments that variant if it is already in cart. */
  const handleAddSelectedVariant = () => {
    if (!canAddVariant || !selectedVariant) return;
    const existing = findLineForVariant(lines, selectedVariant);
    if (existing) {
      void actions.updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    void actions.addItem(selectedVariant.id, 1);
  };

  return (
    <>
      <ChooseOptionsOverlay
        open={open}
        onClose={onClose}
        title={cartMessages.removeVariantTitle}
        titleId="remove-cart-variant-title"
      >
        <div className="space-y-5">
          {lines.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium" style={{ color: productTheme.ink }}>
                {cartMessages.inCartVariants}
              </p>
              <ul className="flex flex-col gap-3" data-testid="remove-cart-variant-list">
                {lines.map((line) => {
                  const label = resolveLineLabel(line, product);
                  const lineBusy =
                    isMutating || updatingLineId === line.id || removingLineId === line.id;
                  return (
                    <li
                      key={line.id}
                      className="flex items-center justify-between gap-3 rounded-[10px] border px-4 py-3"
                      style={{ borderColor: productTheme.borderHairline }}
                    >
                      <span className="text-sm font-medium" style={{ color: productTheme.ink }}>
                        {label}
                      </span>
                      <CartQuantityStepper
                        quantity={line.quantity}
                        onDecrease={() => handleDecrease(line)}
                        onIncrease={() => handleIncrease(line)}
                        onRequestRemove={() => handleRequestRemove(line)}
                        disabled={lineBusy || pendingLineId !== null}
                        showRemoveAtMin
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="space-y-3 border-t pt-4" style={{ borderColor: overlay.actionBorder }}>
            <p className="text-sm font-medium" style={{ color: productTheme.ink }}>
              {cartMessages.addAnotherVariant}
            </p>
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
            <button
              type="button"
              className="h-12 w-full rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: overlay.titleColor }}
              disabled={!canAddVariant}
              aria-label={cartMessages.a11y.addToCart}
              onClick={handleAddSelectedVariant}
            >
              {cartMessages.addToCart}
            </button>
          </div>
        </div>
      </ChooseOptionsOverlay>
      <CartRemoveConfirmModal
        open={pendingLine !== null}
        loadingAction={loadingAction}
        onRemove={() => void handleConfirmRemove()}
        onMoveToWishlist={() => void handleMoveToWishlist()}
        onCancel={handleCancelRemove}
      />
    </>
  );
}
