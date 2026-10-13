'use client';

import { useRouter } from 'next/navigation';

import { CartHeader } from '@/components/cart/CartHeader';
import { CartOffersPageSkeleton } from '@/components/cart/offers/CartOffersPageSkeleton';
import { OfferListCard } from '@/components/cart/offers/OfferListCard';
import { cartMessages } from '@/config/cart/cart.config';
import { useCart } from '@/hooks/useCart';
import { toOfferDisplayCaps } from '@/lib/cart/format-offer-text';
import { resolveUnavailableOfferUnlock } from '@/lib/cart/unavailable-offer-unlock';
import type { CartDiscountOffer, CartPaymentDiscount, CartStoreDiscount } from '@/types/cart';

function isStoreOffer(offer: CartDiscountOffer): offer is CartStoreDiscount {
  return offer.offerType === 'store_offer';
}

function isPaymentOffer(offer: CartDiscountOffer): offer is CartPaymentDiscount {
  return offer.offerType === 'payment_offer';
}

/** Builds unlock hint copy from missing item count. */
function formatUnlockHint(itemCountMissing: number): string {
  if (itemCountMissing <= 1) {
    return cartMessages.discounts.unlockOne;
  }
  return cartMessages.discounts.unlockMany.replace('{count}', String(itemCountMissing));
}

/** All Offers page — store and payment grids from discount APIs. */
export function AllOffersPageContent() {
  const router = useRouter();
  const { discounts, discountsLoading, discountsError, isDiscountMutating, actions } = useCart();

  const available = discounts?.availableDiscounts ?? [];
  const unavailable = discounts?.unavailableDiscounts ?? [];
  const appliedCode = discounts?.appliedCode ?? null;

  const storeAvailable = available.filter(isStoreOffer);
  const storeUnavailable = unavailable.filter(isStoreOffer);
  const paymentOffers = available.filter(
    (offer): offer is CartPaymentDiscount => isPaymentOffer(offer) && offer.viewInListing !== false,
  );
  const appliedFirst = appliedCode
    ? [
        ...storeAvailable.filter((o) => o.discountCode === appliedCode),
        ...storeAvailable.filter((o) => o.discountCode !== appliedCode),
      ]
    : storeAvailable;

  const handleApply = async (code: string) => {
    try {
      await actions.applyDiscount(code);
      router.replace('/cart');
    } catch {
      // Toast + discountsError handled in useCart
    }
  };

  if (discountsLoading) {
    return <CartOffersPageSkeleton />;
  }

  return (
    <div className="laptop:max-w-4xl mx-auto max-w-2xl">
      <CartHeader title={cartMessages.allOffers} backHref="/cart" />
      {discountsError ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {discountsError}
        </p>
      ) : null}

      <section className="space-y-3" aria-labelledby="store-offers-heading">
        <h2 id="store-offers-heading" className="text-base font-normal text-[#151515]">
          {cartMessages.discounts.storeOffers}
        </h2>
        {appliedFirst.length === 0 && storeUnavailable.length === 0 ? (
          <p className="text-sm text-[#64748b]">{cartMessages.discounts.empty}</p>
        ) : (
          <div className="laptop:grid laptop:grid-cols-2 laptop:gap-3 laptop:space-y-0 space-y-3">
            {appliedFirst.map((offer) => {
              const isApplied = offer.discountCode === appliedCode;
              return (
                <OfferListCard
                  key={offer.discountCode}
                  badge={cartMessages.discountBadge}
                  subtitle={
                    offer.amountSaved
                      ? cartMessages.discounts.saveAmount.replace(
                          '{amount}',
                          String(Math.round(offer.amountSaved)),
                        )
                      : cartMessages.discounts.storeOffers
                  }
                  code={offer.discountCode}
                  description={offer.discountDetail}
                  onApply={isApplied ? undefined : () => void handleApply(offer.discountCode)}
                  applied={isApplied}
                  applying={isDiscountMutating}
                />
              );
            })}
            {storeUnavailable.map((offer) => {
              const unlock = resolveUnavailableOfferUnlock(offer);
              const unlockHref = unlock.href ?? undefined;

              return (
                <OfferListCard
                  key={`unavailable-${offer.discountCode}`}
                  badge={cartMessages.discountBadge}
                  subtitle={
                    unlockHref
                      ? formatUnlockHint(unlock.itemCountMissing)
                      : cartMessages.discounts.unavailableHint
                  }
                  code={offer.discountCode}
                  description={offer.discountDetail}
                  disabled={!unlockHref}
                  viewOnly={!unlockHref}
                  unlockHref={unlockHref}
                  unlockAriaLabel={
                    unlockHref
                      ? cartMessages.a11y.addItemsForOffer.replace(
                          '{code}',
                          toOfferDisplayCaps(offer.discountCode),
                        )
                      : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {paymentOffers.length > 0 ? (
        <section className="mt-6 space-y-3" aria-labelledby="payment-offers-heading">
          <h2 id="payment-offers-heading" className="text-base font-normal text-[#151515]">
            {cartMessages.discounts.paymentOffers}
          </h2>
          <div className="laptop:grid laptop:grid-cols-2 laptop:gap-3 laptop:space-y-0 space-y-3">
            {paymentOffers.map((offer) => (
              <OfferListCard
                key={offer.offerId ?? offer.discountCode}
                badge={cartMessages.discountBadge}
                subtitle={offer.paymentOfferTitle || offer.discountDetail || offer.offerTitle || ''}
                code={offer.discountCode}
                description={
                  offer.paymentOfferSubTitle || offer.tnc?.split('||')[0] || offer.discountDetail
                }
                logoUrl={offer.logoUrl}
                viewOnly
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
