'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { useAuthContext } from '@/providers/auth/auth.context';
import {
  createUserAddress,
  getRecentlyViewedProducts,
  getUserAddressById,
  getUserAddresses,
  getUserOrderById,
  getUserOrders,
  getUserProfile,
  getUserWallet,
  getUserWalletTransactions,
  setDefaultUserAddress,
  deleteUserAddress,
  updateUserAddress,
  updateUserProfile,
} from '@/services/user.service';
import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
  UpdateUserProfileInput,
  UserAddress,
  UserOrderDetail,
  UserOrderSummary,
  UserOrdersQuery,
  UserProfile,
  UserWallet,
  WalletTransaction,
} from '@/types/user';

const STALE_TIME = 1000 * 60 * 2;

export function useUserProfile(): {
  profile: UserProfile | undefined;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => void;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: () => guardApi(() => getUserProfile(), { apiId: 'user.profile.get' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    profile: data,
    isLoading,
    error: isAppError(error) ? error : null,
    refetch: () => void refetch(),
  };
}

export function useUpdateUserProfile(): {
  updateProfile: (input: UpdateUserProfileInput) => Promise<UserProfile>;
  isPending: boolean;
  error: AppError | null;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();
  const { patchSessionUser } = useAuthContext();

  const mutation = useMutation({
    mutationFn: (input: UpdateUserProfileInput) =>
      guardApi(() => updateUserProfile(input), { apiId: 'user.profile.update' }),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.user.profile(), profile);
      patchSessionUser({
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        phoneNumber: profile.phone || null,
      });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}

export function useUserAddresses(): {
  addresses: UserAddress[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.addresses(),
    queryFn: () => guardApi(() => getUserAddresses(), { apiId: 'user.addresses.list' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    addresses: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useUserAddress(addressId: string): {
  address: UserAddress | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.address(addressId),
    queryFn: () => guardApi(() => getUserAddressById(addressId), { apiId: 'user.addresses.get' }),
    enabled: isAuthenticated && Boolean(addressId),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    address: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useCreateUserAddress(): {
  createAddress: (input: CreateUserAddressInput) => Promise<UserAddress>;
  isPending: boolean;
  error: AppError | null;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (input: CreateUserAddressInput) =>
      guardApi(() => createUserAddress(input), { apiId: 'user.addresses.create' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
  });

  return {
    createAddress: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}

export function useUpdateUserAddress(): {
  updateAddress: (addressId: string, input: UpdateUserAddressInput) => Promise<UserAddress>;
  isPending: boolean;
  error: AppError | null;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: ({ addressId, input }: { addressId: string; input: UpdateUserAddressInput }) =>
      guardApi(() => updateUserAddress(addressId, input), { apiId: 'user.addresses.update' }),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.address(variables.addressId) });
    },
  });

  return {
    updateAddress: (addressId, input) => mutation.mutateAsync({ addressId, input }),
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}

export function useSetDefaultAddress(): {
  setDefaultAddress: (addressId: string) => Promise<UserAddress>;
  isPending: boolean;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (addressId: string) =>
      guardApi(() => setDefaultUserAddress(addressId), { apiId: 'user.addresses.setDefault' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
    },
  });

  return {
    setDefaultAddress: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useDeleteUserAddress(): {
  deleteAddress: (addressId: string) => Promise<void>;
  isPending: boolean;
  error: AppError | null;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (addressId: string) =>
      guardApi(() => deleteUserAddress(addressId), { apiId: 'user.addresses.delete' }),
    onSuccess: (_, addressId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses() });
      queryClient.removeQueries({ queryKey: queryKeys.user.address(addressId) });
    },
  });

  return {
    deleteAddress: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}

export function useUserOrders(query: UserOrdersQuery = { limit: 50 }): {
  orders: UserOrderSummary[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.orders(query),
    queryFn: () => guardApi(() => getUserOrders(query), { apiId: 'user.orders.list' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    orders: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useUserOrderDetail(orderId: string): {
  order: UserOrderDetail | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.order(orderId),
    queryFn: () => guardApi(() => getUserOrderById(orderId), { apiId: 'user.orders.detail' }),
    enabled: isAuthenticated && Boolean(orderId),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    order: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useUserWallet(): {
  wallet: UserWallet | undefined;
  transactions: WalletTransaction[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();

  const walletQuery = useQuery({
    queryKey: queryKeys.user.wallet(),
    queryFn: () => guardApi(() => getUserWallet(), { apiId: 'user.wallet.get' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.user.walletTransactions(),
    queryFn: () =>
      guardApi(() => getUserWalletTransactions(), { apiId: 'user.wallet.transactions' }),
    enabled: isAuthenticated && walletQuery.isSuccess,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const error = walletQuery.error ?? transactionsQuery.error;

  return {
    wallet: walletQuery.data,
    transactions: transactionsQuery.data,
    isLoading: walletQuery.isLoading || transactionsQuery.isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useRecentlyViewedProducts(limit = 10): {
  productIds: string[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.recentlyViewed(limit),
    queryFn: () =>
      guardApi(() => getRecentlyViewedProducts(limit), { apiId: 'user.recentlyViewed.list' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    productIds: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}
