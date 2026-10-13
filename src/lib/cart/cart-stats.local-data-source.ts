import { CART_STATS_STORAGE_KEY } from '@/config/cart/cart.config';
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/lib/storage/local-storage';

export interface PersistedCartStatsSnapshot {
  cartCount: number;
  cartCountHydrated: boolean;
  wishlistCount: number;
  wishlistCountHydrated: boolean;
}

function isPersistedCartStatsSnapshot(value: unknown): value is PersistedCartStatsSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<PersistedCartStatsSnapshot>;

  return (
    typeof snapshot.cartCount === 'number' &&
    typeof snapshot.cartCountHydrated === 'boolean' &&
    typeof snapshot.wishlistCount === 'number' &&
    typeof snapshot.wishlistCountHydrated === 'boolean'
  );
}

/**
 * Persists header badge counts to localStorage (no-op on SSR).
 *
 * @param snapshot - Cart and wishlist badge state to store.
 */
export function persistCartStatsSnapshot(snapshot: PersistedCartStatsSnapshot): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    writeLocalStorage(CART_STATS_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Quota / private mode — badge recovers on next stats fetch.
  }
}

/**
 * Reads persisted header badge counts (null on SSR, missing, or invalid JSON).
 *
 * @returns Last persisted badge snapshot or null.
 */
export function readCartStatsSnapshot(): PersistedCartStatsSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = readLocalStorage(CART_STATS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isPersistedCartStatsSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Clears persisted header badge counts (no-op on SSR). */
export function clearCartStatsSnapshot(): void {
  if (typeof window === 'undefined') {
    return;
  }

  removeLocalStorage(CART_STATS_STORAGE_KEY);
}
