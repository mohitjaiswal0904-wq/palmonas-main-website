/** @jest-environment node */

import {
  clearStoredAuthUser,
  getOrCreateDeviceId,
  getStoredAuthUser,
  persistAuthUser,
} from '@/lib/auth/auth.client';
import type { AuthUser } from '@/types/auth/auth.types';

const guestUser: AuthUser = {
  id: 'g1',
  firstName: null,
  lastName: null,
  email: null,
  phoneNumber: null,
  profilePicture: null,
  gender: '',
  isGuest: true,
};

describe('auth.client device info (SSR)', () => {
  it('getOrCreateDeviceId returns server placeholder without window', () => {
    expect(getOrCreateDeviceId()).toBe('server-device-id');
  });

  it('getStoredAuthUser returns null without window', () => {
    expect(getStoredAuthUser()).toBeNull();
  });

  it('persistAuthUser is a no-op without window', () => {
    expect(() => persistAuthUser(guestUser)).not.toThrow();
    expect(getStoredAuthUser()).toBeNull();
  });

  it('clearStoredAuthUser is a no-op without window', () => {
    expect(() => clearStoredAuthUser()).not.toThrow();
  });
});
