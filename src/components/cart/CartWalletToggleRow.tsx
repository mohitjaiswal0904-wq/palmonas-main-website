'use client';

import { cartMessages, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { useAuth } from '@/hooks/auth/useAuth';

interface CartWalletToggleRowProps {
  applied: boolean;
  onChange: (applied: boolean) => void;
  balance: number;
  loading?: boolean;
}

/** Wallet balance toggle row — balance supplied by parent (single cart-page fetch). */
export function CartWalletToggleRow({
  applied,
  onChange,
  balance,
  loading = false,
}: CartWalletToggleRowProps) {
  const { isAuthenticated } = useAuth();

  if (!isCartFeatureEnabled('wallet') || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-between border-y border-[#e2e8f0] py-5"
        data-testid="cart-wallet-toggle-skeleton"
        aria-busy="true"
        aria-label={cartMessages.a11y.walletLoading}
      >
        <span className="h-4 w-40 animate-pulse rounded bg-[#f1f5f9]" />
        <span className="size-5 animate-pulse rounded bg-[#f1f5f9]" />
      </div>
    );
  }

  return (
    <label
      className="flex cursor-pointer items-center justify-between border-y border-[#e2e8f0] py-5"
      data-testid="cart-wallet-toggle"
    >
      <span className="text-sm text-[#45556c]">
        {cartMessages.walletBalance} (₹{balance})
      </span>
      <input
        type="checkbox"
        className="size-5 shrink-0 rounded border border-[#dadada] accent-[#977979]"
        checked={applied}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={cartMessages.walletBalance}
      />
    </label>
  );
}
