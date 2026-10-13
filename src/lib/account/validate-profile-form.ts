import { accountMessages } from '@/config/account/account.config';
import { indianMobileValidator, normalizeIndianPhoneDigits } from '@/lib/validators';

/** Validated account profile form fields. */
export interface ProfileFormValidationInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export type ProfileFormFieldErrors = Partial<Record<keyof ProfileFormValidationInput, string>>;

/**
 * Validates mandatory profile fields before save.
 *
 * @param input - Raw form values (may include whitespace).
 * @returns Field-level error messages; empty object when valid.
 */
export function validateProfileForm(input: ProfileFormValidationInput): ProfileFormFieldErrors {
  const errors: ProfileFormFieldErrors = {};
  const validation = accountMessages.validation;

  if (!input.firstName.trim()) {
    errors.firstName = validation.firstNameRequired;
  }

  if (!input.lastName.trim()) {
    errors.lastName = validation.lastNameRequired;
  }

  if (!indianMobileValidator.safeParse(normalizeIndianPhoneDigits(input.phone.trim())).success) {
    errors.phone = validation.phoneInvalid;
  }

  return errors;
}

/** Returns true when the profile form has one or more validation errors. */
export function hasProfileFormErrors(errors: ProfileFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
