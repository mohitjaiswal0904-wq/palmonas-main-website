'use client';

import { useMutation } from '@tanstack/react-query';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import { isAppError, type AppError } from '@/lib/errors';
import { getUserOrderInvoice } from '@/services/user.service';
import type { UserOrderInvoice } from '@/types/user';

/** Fetches a printable invoice payload for a user order. */
export function useUserOrderInvoice(): {
  fetchInvoice: (orderId: string) => Promise<UserOrderInvoice>;
  isPending: boolean;
  error: AppError | null;
} {
  const { guardApi } = useRequireAuth();

  const mutation = useMutation({
    mutationFn: (orderId: string) =>
      guardApi(() => getUserOrderInvoice(orderId), { apiId: 'user.orders.invoice' }),
  });

  return {
    fetchInvoice: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
  };
}
