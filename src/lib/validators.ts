import { z } from 'zod';

export const emailValidator = z.string().email();

/** Indian postal pincode: 6 digits; first digit cannot be 0. */
export const pincodeValidator = z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6 digit pincode');

/** Indian mobile number: 10 digits starting with 6, 7, 8, or 9. */
export const indianMobileValidator = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10 digit mobile number');

/**
 * Extracts the 10-digit Indian mobile from values that may include a +91 / 91 prefix.
 *
 * @param phone - Raw phone input or API value (e.g. `+919876543210`).
 * @returns Last 10 digits, or empty when no digits are present.
 */
export function normalizeIndianPhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.slice(-10);
}

/**
 * Sanitizes Indian phone input while typing; drops +91 when more than 10 national digits are present.
 *
 * @param value - Current phone field value.
 * @returns Sanitized phone string capped at 10 national digits.
 */
export function sanitizeIndianPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length > 10) {
    return digits.slice(-10);
  }
  return digits.slice(0, 10);
}

export const nonEmptyStringValidator = z.string().min(1);
