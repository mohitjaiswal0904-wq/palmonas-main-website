import { mixpanelDistinctIdStorageKey } from '@/config/analytics/analytics.config';
import { cookieClient } from '@/lib/cookies/client';
import {
  readMixpanelDistinctId,
  writeMixpanelDistinctId,
} from '@/lib/analytics/mixpanel-distinct-id-storage';

describe('mixpanel-distinct-id-storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    cookieClient.remove(mixpanelDistinctIdStorageKey);
  });

  it('writes and reads a distinct id from localStorage and cookie', () => {
    writeMixpanelDistinctId(' user-1 ');
    expect(window.localStorage.getItem(mixpanelDistinctIdStorageKey)).toBe('user-1');
    expect(cookieClient.get(mixpanelDistinctIdStorageKey)).toBe('user-1');
    expect(readMixpanelDistinctId()).toBe('user-1');
  });

  it('returns null when the key is missing', () => {
    expect(readMixpanelDistinctId()).toBeNull();
  });

  it('ignores a blank distinct id', () => {
    writeMixpanelDistinctId('   ');
    expect(readMixpanelDistinctId()).toBeNull();
  });

  it('returns null when localStorage throws and no cookie exists', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(readMixpanelDistinctId()).toBeNull();
    getItem.mockRestore();
  });

  it('restores from cookie when localStorage is empty', () => {
    cookieClient.set(mixpanelDistinctIdStorageKey, 'cookie-user');

    expect(readMixpanelDistinctId()).toBe('cookie-user');
    expect(window.localStorage.getItem(mixpanelDistinctIdStorageKey)).toBe('cookie-user');
  });

  it('prefers localStorage and backfills the cookie', () => {
    window.localStorage.setItem(mixpanelDistinctIdStorageKey, 'storage-user');

    expect(readMixpanelDistinctId()).toBe('storage-user');
    expect(cookieClient.get(mixpanelDistinctIdStorageKey)).toBe('storage-user');
  });
});
