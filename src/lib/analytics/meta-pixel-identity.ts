import {
  buildMetaAdvancedMatchingParams,
  type MetaAdvancedMatchingInput,
} from '@/lib/analytics/meta-pixel';
import type { AuthUser } from '@/types/auth/auth.types';

let cachedIdentity: MetaAdvancedMatchingInput | null = null;

/**
 * Stores the latest customer identity used for Meta advanced matching.
 *
 * @param identity - Advanced matching fields, or `null` on logout.
 */
export function setMetaPixelIdentity(identity: MetaAdvancedMatchingInput | null): void {
  cachedIdentity = identity;
}

/**
 * Returns the cached Meta advanced-matching identity.
 *
 * @returns Cached identity fields (empty object when unset).
 */
export function getMetaPixelIdentity(): MetaAdvancedMatchingInput {
  return cachedIdentity ?? {};
}

/**
 * Maps an authenticated Palmonas user into Meta advanced-matching fields.
 *
 * @param user - Authenticated user profile.
 * @param externalId - Stable external id (defaults to `user.id`).
 * @returns Advanced matching input for Meta Pixel init.
 */
export function buildMetaPixelIdentityFromAuthUser(
  user: AuthUser,
  externalId?: string,
): MetaAdvancedMatchingInput {
  return {
    email: user.email,
    phone: user.phoneNumber,
    externalId: externalId ?? user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: user.gender,
    country: 'in',
  };
}

/**
 * Builds advanced-matching init params from the cached identity store.
 *
 * @returns Plaintext advanced matching map for `fbq('init', ...)`.
 */
export function getMetaPixelAdvancedMatchingParams(): Record<string, string> {
  return buildMetaAdvancedMatchingParams(getMetaPixelIdentity());
}
