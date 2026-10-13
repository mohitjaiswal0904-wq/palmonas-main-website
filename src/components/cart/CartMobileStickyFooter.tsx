'use client';

import { useLayoutEffect, useRef } from 'react';

import { CartCheckoutBar } from '@/components/cart/CartCheckoutBar';
import { resolveStickyOfferType } from '@/components/cart/CartCheckoutSidebar';
import { CartBundleDealCard, CartFreeGiftCard } from '@/components/cart/cart-offer-banners';

interface CartMobileStickyFooterProps {
  total: number;
  cartTotal?: number;
  currency?: string;
  loading?: boolean;
  onCheckout: () => void;
  /** Reports footer height when the free-gift row opens or closes. */
  onHeightChange?: (height: number) => void;
}

/** Mobile sticky footer — bundle chip + banner + checkout CTA. */
export function CartMobileStickyFooter({
  total,
  cartTotal = total,
  currency,
  loading,
  onCheckout,
  onHeightChange,
}: CartMobileStickyFooterProps) {
  const offerType = resolveStickyOfferType();
  const rootRef = useRef<HTMLDivElement>(null);

  // Keep page clearance in sync when Hide/Show grows or shrinks this bar.
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node || !onHeightChange) {
      return;
    }

    const reportHeight = () => {
      onHeightChange(Math.ceil(node.getBoundingClientRect().height));
    };

    reportHeight();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(reportHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div
      ref={rootRef}
      className="laptop:hidden z-sticky fixed inset-x-0 bottom-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      data-testid="cart-mobile-sticky-footer"
    >
      {offerType === 'bundle' ? <CartBundleDealCard compact variant="footer" /> : null}
      {offerType === 'freeGift' ? (
        <CartFreeGiftCard compact variant="footer" cartTotal={cartTotal} />
      ) : null}
      <CartCheckoutBar
        total={total}
        currency={currency}
        loading={loading}
        onCheckout={onCheckout}
        showPrice={false}
      />
    </div>
  );
}
