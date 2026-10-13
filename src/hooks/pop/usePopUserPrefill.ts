'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { getUserDetailsForPopPrefill } from '@/services/customer.service';
import type { PopUserPrefill } from '@/types/customer';

/**
 * Loads authenticated user details for POP personal-details prefills.
 * Failures are surfaced as `error` so the form can still render empty/editable fields.
 *
 * @param enabled - Whether to run the query (typically when the details step is active).
 * @returns Prefill data plus loading/error state.
 */
export function usePopUserPrefill(enabled = true): {
  prefill: PopUserPrefill | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getUserDetailsForPopPrefill,
    enabled,
    // Prefill is best-effort — fail open quickly so the form stays usable.
    retry: false,
  });

  return {
    prefill: data,
    isLoading: enabled && isLoading,
    error: isAppError(error) ? error : null,
  };
}
