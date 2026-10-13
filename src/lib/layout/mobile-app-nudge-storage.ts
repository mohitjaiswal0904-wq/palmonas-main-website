import { mobileAppNudgeDismissStorageKey } from '@/config/layout/mobile-app-nudge.config';
import { readLocalStorage, writeLocalStorage } from '@/lib/storage/local-storage';

/**
 * Returns true when the user previously dismissed the mobile app download nudge.
 */
export function isMobileAppNudgeDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return readLocalStorage(mobileAppNudgeDismissStorageKey) === '1';
}

/**
 * Persists dismissal of the mobile app download nudge (no-op on SSR).
 */
export function dismissMobileAppNudge(): void {
  if (typeof window === 'undefined') {
    return;
  }

  writeLocalStorage(mobileAppNudgeDismissStorageKey, '1');
}
