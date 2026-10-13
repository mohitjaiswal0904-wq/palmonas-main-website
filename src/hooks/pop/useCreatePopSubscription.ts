'use client';

import { useMutation } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { createPopSubscription } from '@/services/pop.service';
import type { CreatePopSubscriptionInput, PopSubscriptionResult } from '@/types/pop/subscription';

/**
 * Mutation hook for creating a POP subscription on form submit.
 *
 * @returns Async create helper plus pending/error state.
 */
export function useCreatePopSubscription(): {
  createSubscription: (input: CreatePopSubscriptionInput) => Promise<PopSubscriptionResult>;
  isSubmitting: boolean;
  error: AppError | null;
  reset: () => void;
} {
  const mutation = useMutation({
    mutationFn: (input: CreatePopSubscriptionInput) => createPopSubscription(input),
  });

  return {
    createSubscription: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: isAppError(mutation.error) ? mutation.error : null,
    reset: mutation.reset,
  };
}
