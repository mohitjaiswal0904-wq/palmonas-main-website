import {
  mixpanelDistinctIdCookieDays,
  mixpanelDistinctIdStorageKey,
} from '@/config/analytics/analytics.config';
import { cookieClient } from '@/lib/cookies/client';

/**
 * Reads the Mixpanel distinct id from localStorage, then the cookie.
 *
 * @returns Stored distinct id, or null when missing/unavailable.
 */
export function readMixpanelDistinctId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const fromStorage = readStoredDistinctId();
  if (fromStorage) {
    writeDistinctIdCookie(fromStorage);
    return fromStorage;
  }

  const fromCookie = readDistinctIdCookie();
  if (fromCookie) {
    writeDistinctIdStorage(fromCookie);
    return fromCookie;
  }

  return null;
}

/**
 * Persists the Mixpanel distinct id in localStorage and a first-party cookie.
 *
 * @param distinctId - Mixpanel distinct id to store.
 */
export function writeMixpanelDistinctId(distinctId: string): void {
  const trimmed = distinctId.trim();
  if (!trimmed || typeof window === 'undefined') {
    return;
  }

  writeDistinctIdStorage(trimmed);
  writeDistinctIdCookie(trimmed);
}

function readStoredDistinctId(): string | null {
  try {
    return window.localStorage.getItem(mixpanelDistinctIdStorageKey)?.trim() || null;
  } catch {
    return null;
  }
}

function writeDistinctIdStorage(distinctId: string): void {
  try {
    window.localStorage.setItem(mixpanelDistinctIdStorageKey, distinctId);
  } catch {
    // Private mode / quota — cookie + Mixpanel SDK persistence remain.
  }
}

function readDistinctIdCookie(): string | null {
  try {
    return cookieClient.get(mixpanelDistinctIdStorageKey)?.trim() || null;
  } catch {
    return null;
  }
}

function writeDistinctIdCookie(distinctId: string): void {
  try {
    cookieClient.set(mixpanelDistinctIdStorageKey, distinctId, mixpanelDistinctIdCookieDays);
  } catch {
    // Cookie blocked — localStorage + Mixpanel SDK persistence remain.
  }
}
