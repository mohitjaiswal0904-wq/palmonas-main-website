/**
 * Reads a localStorage key (no-op on SSR).
 *
 * @param key - Storage key.
 * @returns Stored value or undefined on SSR / when absent.
 */
export function readLocalStorage(key: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return localStorage.getItem(key) ?? undefined;
}

/**
 * Writes a localStorage key (no-op on SSR).
 *
 * @param key - Storage key.
 * @param value - Serialised value to persist.
 */
export function writeLocalStorage(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(key, value);
}

/**
 * Removes a localStorage key (no-op on SSR).
 *
 * @param key - Storage key to delete.
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(key);
}
