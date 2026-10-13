'use client';

import { CartHeader } from '@/components/cart/CartHeader';

/** Inline skeleton while cart refetches after auth (avoids empty-state flash). */
export function CartFetchingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" data-testid="cart-fetching-skeleton">
      <CartHeader />
      <div className="h-12 animate-pulse rounded-xl bg-[#f8fafc]" />
      <div className="h-32 animate-pulse rounded-xl bg-[#f8fafc]" />
      <div className="h-32 animate-pulse rounded-xl bg-[#f8fafc]" />
    </div>
  );
}
