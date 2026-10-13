'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import {
  createPopSubscriptionFromAccount,
  getPopSubscriptionById,
  getPopSubscriptions,
} from '@/services/pop.service';
import type {
  CreatePopSubscriptionInput,
  CreatePopSubscriptionResult,
  PopSubscriptionDetail,
  PopSubscriptionTrackQuery,
  PopSubscriptionsPage,
  PopSubscriptionsQuery,
} from '@/types/pop';

const STALE_TIME = 1000 * 60 * 2;

export function usePopSubscriptions(query: PopSubscriptionsQuery = { limit: 50, offset: 0 }): {
  subscriptions: PopSubscriptionsPage | undefined;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => void;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.pop.subscriptions(query),
    queryFn: () => guardApi(() => getPopSubscriptions(query), { apiId: 'pop.subscriptions.list' }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    subscriptions: data,
    isLoading,
    error: isAppError(error) ? error : null,
    refetch: () => void refetch(),
  };
}

export function useCreatePopSubscription(): {
  createSubscription: (input: CreatePopSubscriptionInput) => Promise<CreatePopSubscriptionResult>;
  isPending: boolean;
  error: AppError | null;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (input: CreatePopSubscriptionInput) =>
      guardApi(() => createPopSubscriptionFromAccount(input), {
        apiId: 'pop.subscriptions.create',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pop.all });
    },
  });

  return {
    createSubscription: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}

export function usePopSubscriptionDetail(
  subscriptionId: string,
  query: PopSubscriptionTrackQuery = { count: 50, skip: 0 },
): {
  detail: PopSubscriptionDetail | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { isAuthenticated, guardApi } = useRequireAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.pop.subscription(subscriptionId, query),
    queryFn: () =>
      guardApi(() => getPopSubscriptionById(subscriptionId, query), {
        apiId: 'pop.subscriptions.track',
      }),
    enabled: isAuthenticated && Boolean(subscriptionId),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    detail: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}
