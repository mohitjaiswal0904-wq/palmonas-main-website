'use client';

import { useEffect, useRef, useState } from 'react';

import { CartOfferSwapRow } from '@/components/cart/CartOfferSwapRow';
import { CartOffersChevronIcon, CartOffersPercentIcon } from '@/components/cart/CartOffersIcons';
import { CartFormRow, CartOfferRow } from '@/components/cart/cart-input-rows';
import { cartMessages, cartTheme, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { useCart } from '@/hooks/useCart';
import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';
import { fillCartMessageTemplate } from '@/lib/cart/free-gift-progress';
import { pickBestStoreOffer } from '@/lib/cart/pick-best-store-offer';
import { pickStoreOfferSwap } from '@/lib/cart/pick-store-offer-swap';
import { resolveUnavailableOfferUnlock } from '@/lib/cart/unavailable-offer-unlock';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';
import type { CartDiscountOffer, CartStoreDiscount } from '@/types/cart';

function isStoreOffer(offer: CartDiscountOffer): offer is CartStoreDiscount {
  return offer.offerType !== 'payment_offer';
}

/** Formats coupon savings for section / row copy. */
function formatSavingAmount(amount: number): string {
  return formatPrice(Math.max(0, Math.round(amount)));
}

/** Builds unlock hint copy from missing item count. */
function formatUnlockHint(itemCountMissing: number): string {
  if (itemCountMissing <= 1) {
    return cartMessages.discounts.unlockOne;
  }
  return cartMessages.discounts.unlockMany.replace('{count}', String(itemCountMissing));
}

/** Section-sized skeleton while discount list loads. */
function CartCouponSectionSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border p-3"
      style={{
        borderColor: cartTheme.couponSectionBorder,
        backgroundImage: cartTheme.couponSectionGradient,
        boxShadow: cartTheme.couponSectionShadow,
      }}
      data-testid="cart-coupon-section-skeleton"
      aria-busy="true"
      aria-label={cartMessages.discounts.loading}
    >
      <div className="flex items-center gap-2">
        <div className="size-7 animate-pulse rounded-full bg-white/70" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-3 w-24 animate-pulse rounded bg-white/70" />
          <div className="h-2.5 w-32 animate-pulse rounded bg-white/70" />
        </div>
      </div>
      <div className="h-9 w-full animate-pulse rounded-lg bg-white/70" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-white/70" />
    </div>
  );
}

/** Discount section — applied-first offers, typed code as a side door. */
export function CartCouponSection() {
  const [code, setCode] = useState('');
  const [codeFieldOpen, setCodeFieldOpen] = useState(false);
  const [applyFailed, setApplyFailed] = useState(false);
  const [moreOffersOpen, setMoreOffersOpen] = useState(false);
  const [skipAutoApply, setSkipAutoApply] = useState(false);
  const autoApplyStarted = useRef(false);
  const { cart, discounts, discountsLoading, discountsError, isDiscountMutating, actions } =
    useCart();

  const availableStore = discounts?.availableDiscounts.filter(isStoreOffer) ?? [];
  const unavailableStore = discounts?.unavailableDiscounts.filter(isStoreOffer) ?? [];
  const appliedCode = discounts?.appliedCode ?? cart?.appliedCouponCodes?.[0] ?? null;
  const bestOffer = pickBestStoreOffer(
    availableStore.filter((o) => o.discountCode !== appliedCode),
  );
  const appliedOffer = appliedCode
    ? availableStore.find((o) => o.discountCode === appliedCode)
    : undefined;
  const amountSaved =
    discounts?.appliedAmountSaved ||
    appliedOffer?.amountSaved ||
    (appliedCode && cart?.discount ? cart.discount : 0);
  const offerSwap = pickStoreOfferSwap(appliedCode, amountSaved, availableStore);
  const nextOffer = applyFailed || !appliedCode ? bestOffer : null;
  const showUnlockPrompt = !appliedCode && !nextOffer && unavailableStore.length > 0;
  const unlockOffer = showUnlockPrompt ? unavailableStore[0] : undefined;
  const unlock = unlockOffer ? resolveUnavailableOfferUnlock(unlockOffer) : null;
  const previewCodes = new Set(
    [
      appliedCode,
      nextOffer?.discountCode,
      unlockOffer?.discountCode,
      offerSwap?.better.discountCode,
    ].filter((code): code is string => Boolean(code)),
  );
  const extraAvailableStore = availableStore.filter(
    (offer) => !previewCodes.has(offer.discountCode),
  );
  const extraUnavailableStore = unavailableStore.filter(
    (offer) => !previewCodes.has(offer.discountCode),
  );
  const hasMoreStoreOffers = extraAvailableStore.length + extraUnavailableStore.length > 0;

  useEffect(() => {
    if (
      !isCartFeatureEnabled('offers') ||
      discountsLoading ||
      skipAutoApply ||
      autoApplyStarted.current ||
      !cart
    ) {
      return;
    }
    if (appliedCode || isDiscountMutating || !bestOffer) {
      return;
    }
    autoApplyStarted.current = true;
    void actions.applyDiscount(bestOffer.discountCode, { silent: true }).catch(() => {
      setSkipAutoApply(true);
    });
  }, [actions, appliedCode, bestOffer, cart, discountsLoading, isDiscountMutating, skipAutoApply]);

  if (!isCartFeatureEnabled('offers')) {
    return null;
  }

  if (discountsLoading) {
    return <CartCouponSectionSkeleton />;
  }

  const showCodeField = codeFieldOpen && !applyFailed;

  /** Applies a typed code; on failure keep the reason and hide the field. */
  const handleApplyManual = () => {
    void actions
      .applyDiscount(code)
      .then(() => {
        setCode('');
        setApplyFailed(false);
        setCodeFieldOpen(false);
        setSkipAutoApply(false);
      })
      .catch(() => {
        setApplyFailed(true);
        setCodeFieldOpen(false);
      });
  };

  /** Applies a suggested ticket and exits fail / change mode. */
  const handleApplyOffer = (offerCode: string) => {
    void actions
      .applyDiscount(offerCode)
      .then(() => {
        setApplyFailed(false);
        setCodeFieldOpen(false);
        setSkipAutoApply(false);
        setCode('');
      })
      .catch(() => {
        setApplyFailed(true);
        setCodeFieldOpen(false);
      });
  };

  const handleRemoveDiscount = () => {
    setSkipAutoApply(true);
    setApplyFailed(false);
    autoApplyStarted.current = true;
    void actions.removeDiscount();
  };

  const appliedDetail = appliedOffer?.discountDetail?.trim() || undefined;
  const extraSavedLabel = offerSwap
    ? fillCartMessageTemplate(cartMessages.swapExtraSaved, {
        amount: formatSavingAmount(offerSwap.extraSaved),
      })
    : '';
  const swapAriaLabel = offerSwap
    ? fillCartMessageTemplate(cartMessages.a11y.swapOffer, {
        code: toOfferDisplayCaps(offerSwap.better.discountCode),
        amount: formatSavingAmount(offerSwap.extraSaved),
      })
    : '';

  const unlockTitle = unlockOffer
    ? unlockOffer.discountDetail.trim() || unlockOffer.discountCode
    : '';
  const unlockDetail = unlock ? formatUnlockHint(unlock.itemCountMissing) : undefined;
  const tryInstead =
    applyFailed && nextOffer
      ? cartMessages.tryOfferInstead.replace('{code}', toOfferDisplayCaps(nextOffer.discountCode))
      : null;

  return (
    <section
      className={cartTheme.couponSectionClass}
      style={{
        borderColor: cartTheme.couponSectionBorder,
        backgroundImage: cartTheme.couponSectionGradient,
        boxShadow: cartTheme.couponSectionShadow,
      }}
      data-testid="cart-coupon-section"
      aria-labelledby="cart-offers-coupons-heading"
    >
      <div className="flex items-center justify-between gap-3 px-3.5 pt-3 pb-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: cartTheme.couponIconBg }}
            aria-hidden
          >
            <CartOffersPercentIcon className="size-3.5" />
          </span>
          <div className="min-w-0">
            <h2
              id="cart-offers-coupons-heading"
              className="truncate text-sm leading-5 font-semibold text-[#151515]"
            >
              {cartMessages.offersAndCoupons}
            </h2>
            {amountSaved > 0 ? null : availableStore.length > 0 || showUnlockPrompt ? (
              <p
                className="truncate text-[10px] leading-3.5"
                style={{ color: cartTheme.couponSavingText }}
                data-testid="cart-coupon-save-more"
              >
                {cartMessages.saveMoreOnOrder}
              </p>
            ) : null}
          </div>
        </div>
        {applyFailed ? (
          <button
            type="button"
            className={cartTheme.couponFooterLinkClass}
            style={{ color: cartTheme.couponSeeAllText }}
            onClick={() => {
              setApplyFailed(false);
              setCodeFieldOpen(true);
            }}
            aria-label={cartMessages.a11y.differentCode}
          >
            {cartMessages.differentCode}
          </button>
        ) : showCodeField ? null : (
          <button
            type="button"
            className={cn(cartTheme.couponFooterLinkClass, 'shrink-0')}
            style={{ color: cartTheme.couponSeeAllText }}
            onClick={() => {
              setCodeFieldOpen(true);
              setApplyFailed(false);
            }}
            aria-label={cartMessages.a11y.haveACode}
            data-testid="cart-have-a-code"
          >
            {cartMessages.haveACode}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-3.5 pb-3.5">
        {showCodeField ? (
          <CartFormRow
            appearance="coupon"
            value={code}
            onChange={setCode}
            placeholder={cartMessages.couponPlaceholder}
            onApply={handleApplyManual}
            disabled={isDiscountMutating}
            applyLabel={cartMessages.apply}
            inputAriaLabel={cartMessages.a11y.couponCodeInput}
            applyAriaLabel={cartMessages.a11y.applyCoupon}
          />
        ) : null}

        {discountsError || tryInstead ? (
          <div
            className={cartTheme.couponFailPanelClass}
            style={{
              backgroundColor: cartTheme.couponRemoveBg,
              borderColor: cartTheme.couponRemoveBorder,
            }}
            data-testid="cart-coupon-fail"
          >
            {discountsError ? (
              <p
                className={cartTheme.couponFailErrorClass}
                style={{ color: cartTheme.couponRemoveText }}
                role="alert"
                data-testid="cart-coupon-error"
              >
                {discountsError}
              </p>
            ) : null}
            {tryInstead ? (
              <p
                className={cartTheme.couponFailHintClass}
                style={{ color: cartTheme.couponSavingText }}
                data-testid="cart-coupon-try-instead"
              >
                {tryInstead}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-1.5">
          {offerSwap && appliedCode ? (
            <CartOfferSwapRow
              betterCode={offerSwap.better.discountCode}
              betterDetail={offerSwap.better.discountDetail || undefined}
              extraSavedLabel={extraSavedLabel}
              appliedCode={appliedCode}
              appliedDetail={appliedDetail}
              appliedSavingAmount={amountSaved > 0 ? formatSavingAmount(amountSaved) : undefined}
              disabled={isDiscountMutating}
              onSwap={() => handleApplyOffer(offerSwap.better.discountCode)}
              onRemoveApplied={handleRemoveDiscount}
              swapAriaLabel={swapAriaLabel}
              removeAriaLabel={cartMessages.a11y.removeCoupon}
            />
          ) : appliedCode ? (
            <CartOfferRow
              code={appliedCode}
              detail={appliedDetail}
              applied
              savingAmount={amountSaved > 0 ? formatSavingAmount(amountSaved) : undefined}
              onRemove={handleRemoveDiscount}
              disabled={isDiscountMutating}
              removeAriaLabel={cartMessages.a11y.removeCoupon}
            />
          ) : null}
          {nextOffer ? (
            <CartOfferRow
              code={nextOffer.discountCode}
              detail={nextOffer.discountDetail || undefined}
              onApply={() => handleApplyOffer(nextOffer.discountCode)}
              disabled={isDiscountMutating}
              applyAriaLabel={`${cartMessages.apply} ${nextOffer.discountCode}`}
            />
          ) : null}
          {unlockOffer && unlock ? (
            <CartOfferRow
              code={unlockTitle}
              detail={unlockDetail}
              unlockHref={unlock.href ?? undefined}
              unlockAriaLabel={cartMessages.a11y.addItemsForOffer.replace(
                '{code}',
                unlockOffer.discountCode,
              )}
            />
          ) : null}
          {!appliedCode && !nextOffer && !unlockOffer && !discountsError ? (
            <p className="text-[10px] text-[#64748b]" data-testid="cart-coupon-empty">
              {cartMessages.discounts.empty}
            </p>
          ) : null}
        </div>

        {hasMoreStoreOffers ? (
          <div className="flex flex-col gap-1.5">
            <div className={cartTheme.couponMoreOffersWrapClass}>
              <button
                type="button"
                className={cartTheme.couponMoreOffersClass}
                style={{ color: cartTheme.couponSeeAllText }}
                onClick={() => setMoreOffersOpen((open) => !open)}
                aria-expanded={moreOffersOpen}
                aria-controls="cart-more-store-offers"
                data-testid="cart-see-all-coupons"
                aria-label={cartMessages.a11y.moreOffers}
              >
                {cartMessages.moreOffers}
                <CartOffersChevronIcon
                  className={cn('size-3 transition-transform', moreOffersOpen && 'rotate-90')}
                />
              </button>
            </div>
            {moreOffersOpen ? (
              <div
                id="cart-more-store-offers"
                className="flex w-full flex-col gap-1.5"
                data-testid="cart-more-store-offers"
              >
                {extraAvailableStore.map((offer) => (
                  <CartOfferRow
                    key={offer.discountCode}
                    code={offer.discountCode}
                    detail={offer.discountDetail || undefined}
                    onApply={() => handleApplyOffer(offer.discountCode)}
                    disabled={isDiscountMutating}
                    applyAriaLabel={`${cartMessages.apply} ${offer.discountCode}`}
                  />
                ))}
                {extraUnavailableStore.map((offer) => {
                  const extraUnlock = resolveUnavailableOfferUnlock(offer);
                  return (
                    <CartOfferRow
                      key={offer.discountCode}
                      code={offer.discountDetail.trim() || offer.discountCode}
                      detail={formatUnlockHint(extraUnlock.itemCountMissing)}
                      unlockHref={extraUnlock.href ?? undefined}
                      unlockAriaLabel={cartMessages.a11y.addItemsForOffer.replace(
                        '{code}',
                        offer.discountCode,
                      )}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
