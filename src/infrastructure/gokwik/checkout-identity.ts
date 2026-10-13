const GOKWIK_PHONE_KEY = 'kp-login-no';
const GOKWIK_EMAIL_KEY = 'kp_email';
const GOKWIK_IDENTITY_COOKIE_MAX_AGE_DAYS = 365;

export interface GokwikCheckoutIdentity {
  phone: string;
  email?: string | null;
}

/**
 * Normalizes an Indian phone to 10 digits for GoKwik checkout pre-fill.
 *
 * @param phone - Raw phone from auth profile or mock credentials.
 * @returns Last 10 digits when available; empty string when input has no digits.
 */
export function normalizePhoneForGokwikCheckout(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

function setGokwikIdentityCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;

  const maxAgeSeconds = GOKWIK_IDENTITY_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie =
    `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; ` +
    'SameSite=None; Secure';
}

function clearGokwikIdentityCookie(name: string): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
}

/**
 * Mirrors Palmonas authenticated user into GoKwik checkout identity storage.
 * Always overwrites stale `kp-login-no` so checkout prefills the current session phone.
 * GoKwik reads `kp-login-no` from localStorage then cookies on checkout open.
 */
export function syncGokwikCheckoutIdentity(identity: GokwikCheckoutIdentity): void {
  if (typeof window === 'undefined') return;

  const normalizedPhone = normalizePhoneForGokwikCheckout(identity.phone);
  if (!normalizedPhone) return;

  // Drop stale phone first when session number changed (or leftover from prior user).
  window.localStorage.removeItem(GOKWIK_PHONE_KEY);
  window.sessionStorage.removeItem(GOKWIK_PHONE_KEY);
  clearGokwikIdentityCookie(GOKWIK_PHONE_KEY);

  window.localStorage.setItem(GOKWIK_PHONE_KEY, normalizedPhone);
  window.sessionStorage.setItem(GOKWIK_PHONE_KEY, normalizedPhone);
  setGokwikIdentityCookie(GOKWIK_PHONE_KEY, normalizedPhone);

  if (identity.email) {
    window.localStorage.setItem(GOKWIK_EMAIL_KEY, identity.email);
  }
}

/**
 * Clears GoKwik checkout identity keys set by {@link syncGokwikCheckoutIdentity}.
 */
export function clearGokwikCheckoutIdentity(): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(GOKWIK_PHONE_KEY);
  window.sessionStorage.removeItem(GOKWIK_PHONE_KEY);
  window.localStorage.removeItem(GOKWIK_EMAIL_KEY);
  clearGokwikIdentityCookie(GOKWIK_PHONE_KEY);
}
