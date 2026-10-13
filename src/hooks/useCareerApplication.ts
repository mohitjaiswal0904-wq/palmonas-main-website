'use client';

import { useMutation } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import {
  submitGeneralCareerApplication,
  submitJobCareerApplication,
} from '@/services/careers.service';
import type {
  GeneralCareerApplicationInput,
  JobCareerApplicationInput,
} from '@/types/careers/careers.schemas';

interface SubmitJobParams {
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  application: JobCareerApplicationInput;
}

/**
 * Mutation hook for the general careers application form.
 *
 * @returns Submit helper plus pending/error/success state.
 */
export function useGeneralCareerApplication(): {
  submit: (application: GeneralCareerApplicationInput) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: AppError | null;
  reset: () => void;
} {
  const mutation = useMutation({
    mutationFn: (application: GeneralCareerApplicationInput) =>
      submitGeneralCareerApplication(application),
  });

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: isAppError(mutation.error) ? mutation.error : null,
    reset: mutation.reset,
  };
}

/**
 * Mutation hook for job-specific career applications.
 *
 * @returns Submit helper plus pending/error/success state.
 */
export function useJobCareerApplication(): {
  submit: (params: SubmitJobParams) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: AppError | null;
  reset: () => void;
} {
  const mutation = useMutation({
    mutationFn: (params: SubmitJobParams) => submitJobCareerApplication(params),
  });

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: isAppError(mutation.error) ? mutation.error : null,
    reset: mutation.reset,
  };
}
