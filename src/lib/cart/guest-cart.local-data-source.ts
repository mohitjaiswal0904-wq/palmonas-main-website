import { GUEST_CART_STORAGE_KEY } from '@/config/cart/cart.config';
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/lib/storage/local-storage';
import type { Cart } from '@/types/cart';

function isCartSnapshot(value: unknown): value is Cart {
  if (!value || typeof value !== 'object') return false;
  const cart = value as Partial<Cart>;
  return (
    typeof cart.id === 'string' && typeof cart.totalItems === 'number' && Array.isArray(cart.items)
  );
}

/**
 * Returns true when cached cart lines are missing product images and need a full GET /cart.
 *
 * @param cart - Current cart snapshot from localStorage, mutations, or query cache.
 */
export function cartNeedsImageRefresh(cart: Cart | null): boolean {
  return Boolean(cart?.items.some((item) => !item.product.primaryImage));
}

/**
 * Persists guest cart snapshot to localStorage (no-op on SSR).
 * Passing `null` clears the snapshot.
 *
 * @param cart - UI cart from last mutation/query, or null to clear.
 */
export function persistGuestCartSnapshot(cart: Cart | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (!cart || cart.totalItems <= 0) {
    clearGuestCartSnapshot();
    return;
  }
  try {
    writeLocalStorage(GUEST_CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Quota / private mode — badge will recover on next mutation or /cart visit.
  }
}

/**
 * Reads the stored guest cart snapshot (null on SSR, missing, or invalid JSON).
 *
 * @returns Last persisted guest cart or null.
 */
export function readGuestCartSnapshot(): Cart | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = readLocalStorage(GUEST_CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCartSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Removes the guest cart snapshot from localStorage (no-op on SSR).
 */
export function clearGuestCartSnapshot(): void {
  if (typeof window === 'undefined') {
    return;
  }
  removeLocalStorage(GUEST_CART_STORAGE_KEY);
}
