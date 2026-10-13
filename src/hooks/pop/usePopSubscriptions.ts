'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { listPopSubscriptions } from '@/services/pop.service';
import type {
  PopPlan,
  PopPlanListResult,
  PopSubscriptionListParams,
} from '@/types/pop/subscription-list';

const STALE_TIME = 1000 * 60;

/**
 * Loads the authenticated user's POP subscription plans.
 *
 * @param params - Pagination for GET /api/v2/pop/subscriptions.
 * @param enabled - Whether the query should run (typically when user is authenticated).
 * @param initialData - SSR-hydrated subscription list from the page.
 * @returns Plan list plus loading and error state.
 */
export function usePopSubscriptions(
  params: PopSubscriptionListParams = {},
  enabled = true,
  initialData?: PopPlanListResult,
): {
  plans: PopPlan[];
  total: number;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.pop.subscriptions(params),
    queryFn: () => listPopSubscriptions(params),
    enabled,
    initialData,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    plans: data?.plans ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: isAppError(error) ? error : null,
    refetch: () => {
      void refetch();
    },
  };
}
