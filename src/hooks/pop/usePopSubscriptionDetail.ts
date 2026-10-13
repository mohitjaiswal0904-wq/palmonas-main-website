'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getPopSubscriptionDetail } from '@/services/pop.service';
import type {
  PopPlanDetailResult,
  PopSubscriptionDetailParams,
} from '@/types/pop/subscription-detail';

const STALE_TIME = 1000 * 60;

/**
 * Loads instalment timeline for a single POP subscription.
 *
 * @param subscriptionId - POP subscription id from the route.
 * @param params - Pagination for GET /api/v2/pop/subscriptions/{sub_id}.
 * @param enabled - Whether the query should run.
 * @param initialData - SSR-hydrated plan detail from the page.
 * @returns Plan detail plus loading and error state.
 */
export function usePopSubscriptionDetail(
  subscriptionId: string,
  params: PopSubscriptionDetailParams = {},
  enabled = true,
  initialData?: PopPlanDetailResult,
): {
  detail: PopPlanDetailResult | undefined;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.pop.subscriptionDetail(subscriptionId, params),
    queryFn: () => getPopSubscriptionDetail(subscriptionId, params),
    enabled: enabled && subscriptionId.length > 0,
    initialData,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    detail: data,
    isLoading,
    error: isAppError(error) ? error : null,
    refetch: () => {
      void refetch();
    },
  };
}
