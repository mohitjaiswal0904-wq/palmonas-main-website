import { popPersonalDetailsMessages } from '@/config/pop/pop-personal-details.config';
import type { PopEnrollmentMethod } from '@/config/pop.config';
import { emailValidator, indianMobileValidator, pincodeValidator } from '@/lib/validators';

/** POP personal-details form fields validated on submit. */
export interface PopPersonalDetailsValidationInput {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  city: string;
  pincode: string;
  enrollmentMethod: PopEnrollmentMethod;
  storeId: string;
  acceptedTerms: boolean;
}

export type PopPersonalDetailsFieldErrors = Partial<
  Record<keyof PopPersonalDetailsValidationInput, string>
>;

/**
 * Validates POP personal-details form values before payment setup.
 *
 * @param input - Raw form values (may include whitespace).
 * @returns Field-level error messages; empty object when valid.
 */
export function validatePopPersonalDetails(
  input: PopPersonalDetailsValidationInput,
): PopPersonalDetailsFieldErrors {
  const errors: PopPersonalDetailsFieldErrors = {};
  const validation = popPersonalDetailsMessages.validation;

  if (!input.name.trim()) {
    errors.name = validation.nameRequired;
  }

  if (!indianMobileValidator.safeParse(input.phone.trim()).success) {
    errors.phone = validation.phoneInvalid;
  }

  if (!emailValidator.safeParse(input.email.trim()).success) {
    errors.email = validation.emailInvalid;
  }

  if (!input.addressLine1.trim()) {
    errors.addressLine1 = validation.addressLine1Required;
  }

  if (!input.city.trim()) {
    errors.city = validation.cityRequired;
  }

  if (!pincodeValidator.safeParse(input.pincode.trim()).success) {
    errors.pincode = validation.pincodeInvalid;
  }

  if (!input.enrollmentMethod) {
    errors.enrollmentMethod = validation.enrollmentMethodRequired;
  }

  if (input.enrollmentMethod === 'at_store' && !input.storeId) {
    errors.storeId = validation.storeRequired;
  }

  if (!input.acceptedTerms) {
    errors.acceptedTerms = validation.termsRequired;
  }

  return errors;
}

/** Returns true when the POP personal-details form has validation errors. */
export function hasPopPersonalDetailsErrors(errors: PopPersonalDetailsFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
