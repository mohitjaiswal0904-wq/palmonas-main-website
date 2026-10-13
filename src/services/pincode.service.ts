/** Client-only — pincode validation (India Post) and EDD via @/lib/mto-api. Used by usePincode hook. */
import { normaliseError } from '@/lib/errors';
import { mtoApi } from '@/lib/mto-api';
import { postalPincodeApi } from '@/lib/postal-pincode-api';
import { transformEdd, type CheckEddParams, type EddResult } from '@/types/edd';
import { transformPincodeValidation } from '@/types/pincode/pincode.transforms';
import type {
  IndiaPostPincodeApiResponse,
  PincodeValidationResult,
} from '@/types/pincode/pincode.types';

/**
 * Validates a pincode against India Post lookup before accepting it.
 *
 * @param pincode - Six-digit Indian pincode.
 * @returns Validation result; `valid: false` when API reports no records.
 * @throws Normalised error on network or unexpected API failure.
 */
export async function validatePincode(pincode: string): Promise<PincodeValidationResult> {
  try {
    const { data } = await postalPincodeApi.get<IndiaPostPincodeApiResponse[]>(
      `/pincode/${pincode}`,
    );
    const raw = Array.isArray(data) ? data[0] : data;

    if (!raw) {
      return transformPincodeValidation(pincode, {
        Message: 'No records found',
        Status: 'Error',
        PostOffice: null,
      });
    }

    return transformPincodeValidation(pincode, raw);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function checkEdd({ pincode, inStock, type }: CheckEddParams): Promise<EddResult> {
  try {
    const { data } = await mtoApi.get('/api/edd', {
      params: {
        pincode,
        inStock: inStock ? 'true' : 'false',
        type,
      },
    });

    return transformEdd(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
