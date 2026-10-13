import { normalizeMetaPhoneE164 } from '@/lib/analytics/meta-pixel';
import type { AuthUser } from '@/types/auth/auth.types';

/** Profile fields synced to WebEngage system user attributes. */
export type WebEngageUserProfileInput = Pick<
  AuthUser,
  'email' | 'firstName' | 'lastName' | 'phoneNumber' | 'gender'
>;

/**
 * Normalizes gender to WebEngage's accepted values.
 *
 * @param gender - Raw gender from auth profile.
 * @returns `male`, `female`, `other`, or undefined when unknown.
 */
export function normalizeWebEngageGender(gender: string): 'male' | 'female' | 'other' | undefined {
  const normalized = gender.trim().toLowerCase();

  if (normalized === 'male' || normalized === 'm') {
    return 'male';
  }

  if (normalized === 'female' || normalized === 'f') {
    return 'female';
  }

  if (normalized === 'other') {
    return 'other';
  }

  return undefined;
}

/**
 * Builds WebEngage system user attributes from an authenticated profile.
 *
 * @param profile - Known user profile fields from auth.
 * @returns Attribute map for `webengage.user.setAttribute`.
 */
export function buildWebEngageUserAttributes(
  profile: WebEngageUserProfileInput,
): Record<string, string> {
  const attributes: Record<string, string> = {};

  const email = profile.email?.trim().toLowerCase();
  if (email) {
    attributes.we_email = email;
  }

  const firstName = profile.firstName?.trim();
  if (firstName) {
    attributes.we_first_name = firstName;
  }

  const lastName = profile.lastName?.trim();
  if (lastName) {
    attributes.we_last_name = lastName;
  }

  const phone = profile.phoneNumber ? normalizeMetaPhoneE164(profile.phoneNumber) : undefined;
  if (phone) {
    attributes.we_phone = phone;
  }

  const gender = profile.gender ? normalizeWebEngageGender(profile.gender) : undefined;
  if (gender) {
    attributes.we_gender = gender;
  }

  return attributes;
}
