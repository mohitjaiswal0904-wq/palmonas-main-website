/**
 * Normalises a phone number and returns a base64 distinct id for Mixpanel.
 *
 * @param phone - Raw phone from auth profile.
 * @returns Base64 distinct id or null when phone is empty.
 */
export function encodeMixpanelDistinctIdFromPhone(phone: string): string | null {
  const normalized = phone.replace(/\s+/g, '').trim();

  if (!normalized) {
    return null;
  }

  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(normalized);
  }

  return Buffer.from(normalized, 'utf-8').toString('base64');
}
