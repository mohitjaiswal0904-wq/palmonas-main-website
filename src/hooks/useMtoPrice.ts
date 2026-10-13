'use client';

import { useQuery } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getMtoPrice } from '@/services/mto-price.service';
import type { MtoPrice } from '@/types/mto-price';

const STALE_TIME = 1000 * 60 * 2;

export function useMtoPrice(
  sku: string | undefined,
  purity: string,
  initialPrice?: MtoPrice,
  enabled = true,
): {
  price: MtoPrice | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.mtoPrice.detail(sku ?? '', purity),
    queryFn: () => getMtoPrice({ sku: sku ?? '', purity }),
    enabled: enabled && Boolean(sku && purity),
    initialData: initialPrice,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    price: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}
