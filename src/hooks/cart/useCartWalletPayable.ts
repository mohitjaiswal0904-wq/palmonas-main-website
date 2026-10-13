'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { isCartFeatureEnabled } from '@/config/cart/cart.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { useWallet } from '@/hooks/user/useWallet';

function computeWalletApplication(balance: number, cartTotal: number) {
  const safeBalance = Math.max(0, balance);
  const safeTotal = Math.max(0, cartTotal);
  const walletApplied = Math.min(safeBalance, safeTotal);

  return {
    walletApplied,
    payableTotal: Math.max(0, safeTotal - walletApplied),
  };
}

/**
 * Cart-only wallet payable composition on `/cart` (uses shared `useWallet` cache).
 *
 * @param cartTotal - Current cart total before wallet.
 * @returns Applied wallet amount, payable total, and loading state.
 */
export function useCartWalletPayable(cartTotal: number, walletAppliedByUser = false) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isCartRoute = pathname === '/cart';
  const walletEnabled = isCartFeatureEnabled('wallet') && isCartRoute && isAuthenticated;

  const { balance, loading, isFetching, error } = useWallet({
    enabled: walletEnabled,
  });

  const effectiveBalance = walletEnabled && walletAppliedByUser ? balance : 0;

  const application = useMemo(
    () => computeWalletApplication(effectiveBalance, cartTotal),
    [effectiveBalance, cartTotal],
  );

  return {
    balance,
    walletApplied: application.walletApplied,
    payableTotal: application.payableTotal,
    loading,
    isFetching,
    error,
  };
}
