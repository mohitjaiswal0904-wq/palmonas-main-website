import { CartHeader } from '@/components/cart/CartHeader';
import { OfferListCardSkeleton } from '@/components/cart/offers/OfferListCard';
import { cartMessages } from '@/config/cart/cart.config';

/** Offers-page placeholder for route loading, nav overlay, and discount fetch. */
export function CartOffersPageSkeleton() {
  return (
    <div className="laptop:max-w-4xl mx-auto max-w-2xl" data-testid="cart-offers-page-skeleton">
      <CartHeader title={cartMessages.allOffers} backHref="/cart" />
      <div
        className="laptop:grid laptop:grid-cols-2 laptop:gap-3 laptop:space-y-0 space-y-3"
        data-testid="all-offers-skeleton"
        aria-busy="true"
        aria-label={cartMessages.discounts.loading}
      >
        <OfferListCardSkeleton />
        <OfferListCardSkeleton />
        <OfferListCardSkeleton />
        <OfferListCardSkeleton />
      </div>
    </div>
  );
}
