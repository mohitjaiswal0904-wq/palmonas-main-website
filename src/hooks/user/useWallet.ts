'use client';

import { useQuery } from '@tanstack/react-query';

import { USER_WALLET_CACHE_MS } from '@/config/user/user.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { queryKeys } from '@/lib/query/keys';
import { fetchWalletDetails } from '@/services/user/wallet.service';

/**
 * Login-gated wallet query reusable across cart, account, and profile flows.
 *
 * @param options - Optional `enabled` override (defaults to true when authenticated).
 * @returns Wallet data, balance, loading state, and refetch.
 */
export function useWallet(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuth();
  const enabled = (options?.enabled ?? true) && isAuthenticated;

  const query = useQuery({
    queryKey: queryKeys.user.wallet(),
    queryFn: fetchWalletDetails,
    staleTime: USER_WALLET_CACHE_MS,
    refetchOnMount: false,
    enabled,
  });

  return {
    wallet: query.data ?? null,
    balance: query.data?.balance ?? 0,
    loading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
