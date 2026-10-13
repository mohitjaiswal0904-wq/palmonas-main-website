'use client';

import { CartAddressBar } from '@/components/cart/CartAddressBar';
import { CartCheckoutBar } from '@/components/cart/CartCheckoutBar';
import { CartCouponSection } from '@/components/cart/CartCouponSection';
import { CartGiftCardSection } from '@/components/cart/CartGiftCardSection';
import { CartLimitedTimeOffers } from '@/components/cart/CartLimitedTimeOffers';
import { CartPriceBreakdown } from '@/components/cart/CartPriceBreakdown';
import { CartRecommendedSection } from '@/components/cart/CartRecommendedSection';
import { CartWalletToggleRow } from '@/components/cart/CartWalletToggleRow';
import { CartBundleDealCard, CartFreeGiftCard } from '@/components/cart/cart-offer-banners';
import { cartConfig, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { useCart } from '@/hooks/useCart';
import type { CartSummary } from '@/types/cart';

interface CartCheckoutSidebarProps {
  summary: CartSummary;
  currency?: string;
  selectedAddress?: { name: string; line: string };
  onAddressChange: () => void;
  onCheckout: () => void;
  checkoutLoading?: boolean;
  walletApplied?: number;
  payableTotal?: number;
  walletLoading?: boolean;
  walletBalance?: number;
  walletToggled?: boolean;
  onWalletToggle?: (applied: boolean) => void;
  giftWrapTotal?: number;
  checkoutTotal?: number;
}

/** Desktop right column — open stack, no bordered card wrapper. */
export function CartCheckoutSidebar({
  summary,
  currency,
  selectedAddress,
  onAddressChange,
  onCheckout,
  checkoutLoading,
  walletApplied,
  payableTotal,
  walletLoading,
  walletBalance = 0,
  walletToggled,
  onWalletToggle,
  giftWrapTotal = 0,
  checkoutTotal,
}: CartCheckoutSidebarProps) {
  const { cart, discounts } = useCart();
  const appliedCouponCode = discounts?.appliedCode ?? cart?.appliedCouponCodes?.[0] ?? null;
  const total =
    checkoutTotal ?? (payableTotal ?? summary.payableTotal ?? summary.total) + giftWrapTotal;
  const offerType = resolveStickyOfferType();

  return (
    <aside
      className="laptop:col-start-2 laptop:row-start-2 laptop:sticky laptop:top-24 laptop:block laptop:w-full hidden shrink-0 space-y-4"
      data-testid="cart-checkout-sidebar"
    >
      {offerType === 'bundle' ? <CartBundleDealCard variant="sidebar" /> : null}
      {offerType === 'freeGift' ? (
        <CartFreeGiftCard
          variant="sidebar"
          cartTotal={checkoutTotal ?? payableTotal ?? summary.payableTotal ?? summary.total}
        />
      ) : null}
      {isCartFeatureEnabled('address') ? (
        <CartAddressBar
          name={selectedAddress?.name}
          addressLine={selectedAddress?.line}
          onChange={onAddressChange}
        />
      ) : null}
      <CartCouponSection />
      <CartRecommendedSection />
      <CartLimitedTimeOffers />
      <CartGiftCardSection />
      <CartWalletToggleRow
        applied={walletToggled ?? false}
        onChange={onWalletToggle ?? (() => {})}
        balance={walletBalance}
        loading={walletLoading}
      />
      <CartPriceBreakdown
        summary={summary}
        currency={currency}
        walletApplied={walletApplied}
        payableTotal={payableTotal}
        walletLoading={walletLoading}
        walletToggled={walletToggled}
        giftWrapTotal={giftWrapTotal}
        couponCode={appliedCouponCode}
      />
      <CartCheckoutBar
        total={total}
        currency={currency}
        loading={checkoutLoading}
        onCheckout={onCheckout}
        variant="embedded"
      />
    </aside>
  );
}

/** Mobile scroll sections below items (not in sticky footer). */
export function CartMobileCheckoutSections({
  summary,
  currency,
  walletApplied,
  payableTotal,
  walletLoading,
  walletBalance = 0,
  walletToggled,
  onWalletToggle,
  giftWrapTotal = 0,
}: Pick<
  CartCheckoutSidebarProps,
  | 'summary'
  | 'currency'
  | 'walletApplied'
  | 'payableTotal'
  | 'walletLoading'
  | 'walletBalance'
  | 'walletToggled'
  | 'onWalletToggle'
  | 'giftWrapTotal'
>) {
  const { cart, discounts } = useCart();
  const appliedCouponCode = discounts?.appliedCode ?? cart?.appliedCouponCodes?.[0] ?? null;

  return (
    <div className="laptop:hidden space-y-5" data-testid="cart-mobile-checkout-sections">
      <CartCouponSection />
      <div
        className="tab:-mx-[5px] tab:w-[calc(100%+10px)] laptop:mx-0 laptop:w-full -mx-[10px] w-[calc(100%+20px)]"
        data-testid="recommended-mobile-breakout"
      >
        <CartRecommendedSection />
      </div>
      <div className="-mx-[10px] w-[calc(100%+20px)]" data-testid="lto-mobile-breakout">
        <CartLimitedTimeOffers />
      </div>
      <CartGiftCardSection />
      <CartWalletToggleRow
        applied={walletToggled ?? false}
        onChange={onWalletToggle ?? (() => {})}
        balance={walletBalance}
        loading={walletLoading}
      />
      <CartPriceBreakdown
        summary={summary}
        currency={currency}
        walletApplied={walletApplied}
        payableTotal={payableTotal}
        walletLoading={walletLoading}
        walletToggled={walletToggled}
        giftWrapTotal={giftWrapTotal}
        couponCode={appliedCouponCode}
      />
    </div>
  );
}

/** Picks one sticky offer: bundle takes priority over free gift. */
export function resolveStickyOfferType(): 'bundle' | 'freeGift' | null {
  if (isCartFeatureEnabled('bundleDeal') && cartConfig.mock.bundleDeal) {
    return 'bundle';
  }
  if (isCartFeatureEnabled('freeGift') && cartConfig.mock.freeGift) {
    return 'freeGift';
  }
  return null;
}
