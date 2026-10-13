import { pincodeMessages } from '@/config/pincode/pincode.config';
import type {
  IndiaPostPincodeApiResponse,
  PincodeValidationResult,
} from '@/types/pincode/pincode.types';

/**
 * Maps India Post lookup response to a pincode validation result.
 *
 * @param pincode - Six-digit pincode that was looked up.
 * @param raw - First item from India Post API array response.
 * @returns Validation result with user-facing invalid copy on failure.
 */
export function transformPincodeValidation(
  pincode: string,
  raw: IndiaPostPincodeApiResponse,
): PincodeValidationResult {
  const postOffices = raw.PostOffice ?? [];
  const isValid = raw.Status !== 'Error' && postOffices.length > 0;

  return {
    valid: isValid,
    pincode,
    message: isValid ? raw.Message : pincodeMessages.invalidPincode,
    postOffices,
  };
}
