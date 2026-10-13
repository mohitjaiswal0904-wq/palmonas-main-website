'use client';

import { useMemo, useState } from 'react';

import {
  CartRemoveConfirmModal,
  type CartRemoveLoadingAction,
} from '@/components/cart/CartRemoveConfirmModal';
import { TrashIcon } from '@/components/icons/cart-icons';
import { AppLink } from '@/components/ui/AppLink';
import {
  cartMessages,
  cartTheme,
  formatFreeItemQuantity,
  formatFreeItemQuantityA11y,
  formatIncludesFreeQuantity,
  getVariantDisplayLines,
} from '@/config/cart/cart.config';
import { resolveAppliedLineDiscountBadges } from '@/lib/cart/format-line-discount-applied';
import { intersectLineOffersWithDiscountList } from '@/lib/cart/intersect-line-offers';
import { cn } from '@/lib/utils/cn';
import type {
  CartDiscountOffer,
  CartItemApplicableDiscount,
  CartItemLineDiscountAllocation,
} from '@/types/cart';

interface CartQuantityStepperProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onRequestRemove: () => void;
  disabled?: boolean;
  /** When true, only the plus control is disabled (out-of-stock lines). */
  increaseDisabled?: boolean;
  /** At qty 1 on the variant sheet, minus asks to remove the line (no extra trash). */
  showRemoveAtMin?: boolean;
}

/** Quantity stepper for cart line items. */
export function CartQuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  onRequestRemove,
  disabled,
  increaseDisabled,
  showRemoveAtMin = false,
}: CartQuantityStepperProps) {
  const isMinQty = quantity <= 1;

  return (
    <div
      className={cn(
        'laptop:gap-[7px] laptop:rounded-[5.6px] laptop:p-[5.6px] flex items-center gap-[5px] rounded p-1',
        disabled && cartTheme.outOfStockMutedClass,
      )}
      style={{ backgroundColor: cartTheme.quantityTrack }}
      data-testid="cart-quantity-stepper"
      aria-disabled={disabled || undefined}
    >
      <button
        type="button"
        className="laptop:h-[19.5px] laptop:w-[19.5px] laptop:rounded-[4.9px] laptop:text-sm flex h-3.5 w-3.5 items-center justify-center rounded-[3.5px] bg-white text-[10px] leading-none font-bold text-[#151515] disabled:opacity-50"
        aria-label={
          isMinQty && showRemoveAtMin
            ? cartMessages.a11y.removeItem
            : cartMessages.a11y.decreaseQuantity
        }
        disabled={disabled || (isMinQty && !showRemoveAtMin)}
        onClick={isMinQty && showRemoveAtMin ? onRequestRemove : onDecrease}
      >
        −
      </button>
      <span
        className="laptop:min-w-[22px] laptop:text-sm min-w-4 text-center text-[10px] font-bold text-[#151515]"
        data-testid="cart-quantity-value"
      >
        {quantity}
      </span>
      <button
        type="button"
        className="laptop:h-[19.5px] laptop:w-[19.5px] laptop:rounded-[4.9px] laptop:text-sm flex h-3.5 w-3.5 items-center justify-center rounded-[3.5px] text-[10px] leading-none font-bold text-white disabled:opacity-50"
        style={{ backgroundColor: cartTheme.quantityPlus }}
        aria-label={cartMessages.a11y.increaseQuantity}
        disabled={disabled || increaseDisabled}
        onClick={onIncrease}
      >
        +
      </button>
    </div>
  );
}

interface CartItemCardProps {
  name: string;
  image: string;
  /** Product handle from cart API (`merchandise.product.handle`). */
  handle?: string;
  variantTitle: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  currency?: string;
  isFree?: boolean;
  /** Free units included when row clubs paid + promotional free lines. */
  freeQuantity?: number;
  /** Offer badges from line `applicable_discounts`. */
  applicableDiscounts?: CartItemApplicableDiscount[];
  /** Applied discounts from line `line_level_discount_allocations`. */
  lineDiscountAllocations?: CartItemLineDiscountAllocation[];
  /** Available store offers from discount list API — used to filter badges per card. */
  availableOffers?: ReadonlyArray<CartDiscountOffer>;
  onRemove: () => void | Promise<void>;
  onMoveToWishlist?: () => void | Promise<void>;
  onDecrease: () => void;
  onIncrease: () => void;
  isUpdating?: boolean;
  /** When false, the line is sold out — badge stays, PDP link and qty are off. */
  isAvailable?: boolean;
  className?: string;
}

/** Single cart line card — Figma layout with right column trash + stepper. */
export function CartItemCard({
  name,
  image,
  handle,
  variantTitle,
  price,
  originalPrice,
  quantity,
  currency = 'INR',
  isFree = false,
  freeQuantity = 0,
  applicableDiscounts = [],
  lineDiscountAllocations = [],
  availableOffers = [],
  onRemove,
  onMoveToWishlist,
  onDecrease,
  onIncrease,
  isUpdating,
  isAvailable = true,
  className,
}: CartItemCardProps) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<CartRemoveLoadingAction>(null);
  const variantLines = useMemo(() => getVariantDisplayLines(variantTitle), [variantTitle]);
  const showIncludesFree = !isFree && freeQuantity > 0;
  const appliedLineDiscounts = useMemo(
    () =>
      resolveAppliedLineDiscountBadges(
        lineDiscountAllocations,
        applicableDiscounts,
        availableOffers,
      ),
    [lineDiscountAllocations, applicableDiscounts, availableOffers],
  );
  // Eligible offers only when no allocation is already applied on this line.
  const visibleOffers = useMemo(
    () =>
      appliedLineDiscounts.length > 0
        ? []
        : intersectLineOffersWithDiscountList(applicableDiscounts, availableOffers),
    [appliedLineDiscounts.length, applicableDiscounts, availableOffers],
  );

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const handleRequestRemove = () => {
    if (isUpdating || loadingAction) return;
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    setLoadingAction('remove');
    try {
      await onRemove();
      setShowRemoveModal(false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleMoveToWishlist = async () => {
    if (!onMoveToWishlist) return;
    setLoadingAction('wishlist');
    try {
      await onMoveToWishlist();
      setShowRemoveModal(false);
    } catch {
      // Login cancel / mutation failure — keep confirm modal open; spinner clears in finally.
    } finally {
      setLoadingAction(null);
    }
  };

  /** Closes the remove confirm modal and clears any in-flight CTA spinner. */
  const handleCancelRemove = () => {
    setShowRemoveModal(false);
    setLoadingAction(null);
  };

  const productHandle = handle?.trim() ?? '';
  const productHref = productHandle ? `/products/${encodeURIComponent(productHandle)}` : null;

  return (
    <>
      <article
        className={cn(
          'laptop:gap-[11px] laptop:p-3 relative flex gap-1.5 rounded-[16px] border-[1.4px] border-solid border-[#e2e8f0] p-2',
          className,
        )}
        data-testid="cart-item-card"
        data-out-of-stock={isAvailable ? undefined : 'true'}
        aria-disabled={isAvailable ? undefined : true}
      >
        {productHref && isAvailable ? (
          <AppLink
            href={productHref}
            className="absolute inset-0 z-[1]"
            aria-label={cartMessages.a11y.viewProduct.replace('{name}', name)}
          />
        ) : null}
        <div className="relative shrink-0">
          <div className="laptop:h-[142px] laptop:w-[142px] laptop:rounded-[18px] relative h-20 w-20 overflow-hidden rounded-xl border border-[#f8f8f8] bg-white">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name}
                className={cn(
                  'h-full w-full object-cover',
                  !isAvailable && cartTheme.outOfStockMutedClass,
                )}
              />
            ) : null}
            {isAvailable ? null : (
              <span
                className={cartTheme.outOfStockBadgeClass}
                style={{ backgroundColor: cartTheme.outOfStockBadge }}
                data-testid="cart-item-out-of-stock"
                aria-label={cartMessages.a11y.outOfStock}
              >
                {cartMessages.outOfStock}
              </span>
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              className={cn(
                'flex min-w-0 flex-col gap-2',
                !isAvailable && cartTheme.outOfStockMutedClass,
              )}
            >
              <h3 className="laptop:text-[15.6px] line-clamp-2 text-xs font-normal text-[#1f1f1f]">
                {quantity > 1 ? `${quantity} x ` : ''}
                {name}
              </h3>
              <div className="flex items-center gap-2">
                {isFree ? null : (
                  <span className="laptop:text-[15.6px] text-xs font-bold text-[#1f1f1f]">
                    {price > 0 ? formatPrice(price) : formatPrice(originalPrice as number)}
                  </span>
                )}
                {price > 0 && originalPrice && (isFree || originalPrice > price) ? (
                  <span className="laptop:text-[15.6px] text-xs font-normal text-[#afafaf] line-through">
                    {formatPrice(originalPrice)}
                  </span>
                ) : null}
              </div>
              {variantLines.length > 0 ? (
                <div>
                  {variantLines.map((line, index) => (
                    <p
                      key={`${line.label}-${line.value}`}
                      className={cn(
                        'laptop:text-[15.6px] text-xs font-normal text-[#afafaf]',
                        index > 0 && 'mt-0.5',
                      )}
                    >
                      {line.label} : {line.value}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            {isFree ? (
              <span
                className="inline-flex w-fit rounded px-1 py-0 text-[10px] leading-4 font-semibold tracking-wide text-white uppercase"
                style={{ backgroundColor: cartTheme.successGreen }}
                data-testid="cart-item-freebie-badge"
              >
                {cartMessages.freebieBadge}
              </span>
            ) : null}
            {showIncludesFree ? (
              <p
                className="laptop:text-[13px] text-[10px] font-medium"
                style={{ color: cartTheme.successGreen }}
                data-testid="cart-item-includes-free"
              >
                {formatIncludesFreeQuantity(freeQuantity)}
              </p>
            ) : null}
            {appliedLineDiscounts.length > 0 ? (
              <ul
                className="flex flex-wrap gap-1"
                aria-label={cartMessages.a11y.lineDiscountsApplied}
                data-testid="cart-item-applied-discounts"
              >
                {appliedLineDiscounts.map((discount) => (
                  <li
                    key={discount.key}
                    className="rounded-[4.5px] px-1.5 py-0.5 text-[8px] leading-[10px] font-medium"
                    style={{
                      backgroundColor: cartTheme.lineDiscountAppliedBg,
                      color: cartTheme.lineDiscountAppliedText,
                    }}
                  >
                    {discount.label}
                  </li>
                ))}
              </ul>
            ) : null}
            {visibleOffers.length > 0 ? (
              <ul
                className="flex flex-wrap gap-1"
                aria-label={cartMessages.a11y.lineOffers}
                data-testid="cart-item-applicable-discounts"
              >
                {visibleOffers.map((discount) => (
                  <li
                    key={discount.key}
                    className="rounded-[4.5px] px-1.5 py-0.5 text-[8px] leading-[10px] font-medium"
                    style={{
                      backgroundColor: cartTheme.couponAppliedBadgeBg,
                      color: cartTheme.couponAppliedBadgeText,
                    }}
                  >
                    {discount.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {isFree ? (
            <div className="relative z-10 flex shrink-0 flex-col items-end justify-end">
              <div
                className="laptop:rounded-[5.6px] laptop:px-[9px] laptop:py-[5.6px] rounded px-2 py-1"
                style={{ backgroundColor: cartTheme.quantityTrack }}
                data-testid="cart-item-free-quantity"
                aria-label={formatFreeItemQuantityA11y(quantity)}
              >
                <span className="laptop:text-sm text-[10px] font-bold text-[#151515]">
                  {formatFreeItemQuantity(quantity)}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex shrink-0 flex-col items-end justify-between">
              <button
                type="button"
                className="flex min-h-8 min-w-8 items-center justify-center p-1 text-[#BBBBBB] disabled:opacity-50"
                aria-label={cartMessages.a11y.removeItem}
                disabled={isUpdating || loadingAction !== null}
                onClick={handleRequestRemove}
              >
                <TrashIcon className="laptop:h-[22px] laptop:w-[22px] h-[14.4px] w-[14.4px]" />
              </button>
              <CartQuantityStepper
                quantity={quantity}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
                onRequestRemove={handleRequestRemove}
                disabled={isUpdating || loadingAction !== null || !isAvailable}
                increaseDisabled={!isAvailable}
              />
            </div>
          )}
        </div>
      </article>
      <CartRemoveConfirmModal
        open={showRemoveModal}
        loadingAction={loadingAction}
        onRemove={() => void handleConfirmRemove()}
        onMoveToWishlist={() => void handleMoveToWishlist()}
        onCancel={handleCancelRemove}
      />
    </>
  );
}
