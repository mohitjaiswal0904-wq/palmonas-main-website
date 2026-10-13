'use client';

import { useMutation } from '@tanstack/react-query';

import { isAppError, type AppError } from '@/lib/errors';
import { checkEdd, validatePincode } from '@/services/pincode.service';
import type { CheckEddParams, EddResult } from '@/types/edd';
import type { PincodeValidationResult } from '@/types/pincode/pincode.types';

export function usePincode(): {
  checkEdd: (params: CheckEddParams) => Promise<EddResult>;
  validatePincode: (pincode: string) => Promise<PincodeValidationResult>;
  result: EddResult | undefined;
  isChecking: boolean;
  error: AppError | null;
  isValidating: boolean;
  reset: () => void;
} {
  const eddMutation = useMutation({
    mutationFn: (params: CheckEddParams) => checkEdd(params),
  });

  const validateMutation = useMutation({
    mutationFn: (pincode: string) => validatePincode(pincode),
  });

  return {
    checkEdd: eddMutation.mutateAsync,
    validatePincode: validateMutation.mutateAsync,
    result: eddMutation.data,
    isChecking: eddMutation.isPending,
    error: isAppError(eddMutation.error) ? eddMutation.error : null,
    isValidating: validateMutation.isPending,
    reset: () => {
      eddMutation.reset();
      validateMutation.reset();
    },
  };
}
