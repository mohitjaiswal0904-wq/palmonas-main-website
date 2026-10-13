import { addressMessages } from '@/config/address/address.config';
import {
  indianMobileValidator,
  normalizeIndianPhoneDigits,
  pincodeValidator,
} from '@/lib/validators';

/** Validated account address form fields. */
export interface AddressFormValidationInput {
  firstName: string;
  lastName: string;
  addressLine1: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
}

export type AddressFormFieldErrors = Partial<Record<keyof AddressFormValidationInput, string>>;

/**
 * Validates mandatory account address fields before save.
 *
 * @param input - Raw form values (may include whitespace).
 * @returns Field-level error messages; empty object when valid.
 */
export function validateAddressForm(input: AddressFormValidationInput): AddressFormFieldErrors {
  const errors: AddressFormFieldErrors = {};
  const validation = addressMessages.validation;

  if (!input.firstName.trim()) {
    errors.firstName = validation.firstNameRequired;
  }

  if (!input.lastName.trim()) {
    errors.lastName = validation.lastNameRequired;
  }

  if (!input.addressLine1.trim()) {
    errors.addressLine1 = validation.addressLine1Required;
  }

  if (!input.city.trim()) {
    errors.city = validation.cityRequired;
  }

  if (!input.province.trim()) {
    errors.province = validation.stateRequired;
  }

  if (!input.country.trim()) {
    errors.country = validation.countryRequired;
  }

  if (!pincodeValidator.safeParse(input.zip.trim()).success) {
    errors.zip = validation.pincodeInvalid;
  }

  if (!indianMobileValidator.safeParse(normalizeIndianPhoneDigits(input.phone.trim())).success) {
    errors.phone = validation.phoneInvalid;
  }

  return errors;
}

/** Returns true when the address form has one or more validation errors. */
export function hasAddressFormErrors(errors: AddressFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Strips non-digit characters from pincode or phone inputs. */
export function sanitizeNumericAddressInput(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
