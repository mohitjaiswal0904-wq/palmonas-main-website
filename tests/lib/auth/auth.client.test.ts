import { cookieClient } from '@/lib/cookies/client';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/cookies/constants';
import { AUTH_USER_STORAGE_KEY, DEVICE_ID_STORAGE_KEY } from '@/config/auth/auth.config';
import {
  canAccessSession,
  clearAuthStorage,
  clearStoredAuthUser,
  clearTokens,
  getAccessToken,
  getOrCreateDeviceId,
  getRefreshToken,
  getStoredAuthUser,
  getWebDeviceInfo,
  hasStoredCredentials,
  isAuthLogoutInFlight,
  isGuestToken,
  isUsableAccessTokenClaims,
  logKwikpassAuth,
  normalizeJwtClaims,
  parseJwtPayload,
  persistAuthUser,
  setAuthLogoutInFlight,
  setTokens,
  warnUnregisteredGuardId,
  wasAuthenticatedSession,
} from '@/lib/auth/auth.client';
import type { AuthSession } from '@/types/auth/auth.types';

jest.mock('@/lib/cookies/client', () => ({
  cookieClient: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockCookieClient = cookieClient as jest.Mocked<typeof cookieClient>;

const guestSession: AuthSession = {
  user: {
    id: 'g1',
    firstName: null,
    lastName: null,
    email: null,
    phoneNumber: null,
    profilePicture: null,
    gender: '',
    isGuest: true,
  },
  claims: {
    userId: 'g1',
    sessionId: 's1',
    isGuest: true,
    shopifyCustomerId: null,
    expiresAt: 9999999999,
  },
};

const authedSession: AuthSession = {
  ...guestSession,
  user: { ...guestSession.user, isGuest: false },
  claims: { ...guestSession.claims, isGuest: false },
};

function encodeJwtPayload(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.sig`;
}

describe('auth.client token storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('getAccessToken reads auth_token cookie', () => {
    mockCookieClient.get.mockReturnValue('access-jwt');
    expect(getAccessToken()).toBe('access-jwt');
    expect(mockCookieClient.get).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
  });

  it('getRefreshToken reads refresh_token cookie', () => {
    mockCookieClient.get.mockReturnValue('refresh-jwt');
    expect(getRefreshToken()).toBe('refresh-jwt');
    expect(mockCookieClient.get).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it('setTokens writes both cookies with expiry from API seconds', () => {
    setTokens({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 86_400,
      refreshTokenExpiresIn: 172_800,
    });

    expect(mockCookieClient.set).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'a', 1);
    expect(mockCookieClient.set).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'r', 2);
  });

  it('setTokens enforces minimum cookie lifetime', () => {
    setTokens({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 0,
      refreshTokenExpiresIn: 0,
    });

    expect(mockCookieClient.set).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'a', 1 / 24);
    expect(mockCookieClient.set).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'r', 1 / 24);
  });

  it('clearTokens removes both auth cookies', () => {
    clearTokens();
    expect(mockCookieClient.remove).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(mockCookieClient.remove).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it('persistAuthUser stores serialised user profile', () => {
    persistAuthUser(guestSession.user);
    expect(getStoredAuthUser()).toEqual(guestSession.user);
  });

  it('clearAuthStorage clears tokens and stored user', () => {
    mockCookieClient.get.mockReturnValue('token');
    localStorage.setItem(AUTH_USER_STORAGE_KEY, '{}');
    clearAuthStorage();
    expect(mockCookieClient.remove).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(mockCookieClient.remove).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
    expect(getStoredAuthUser()).toBeNull();
  });

  it('hasStoredCredentials is true when auth cookies exist', () => {
    mockCookieClient.get.mockImplementation((key) =>
      key === AUTH_TOKEN_KEY ? 'access-jwt' : undefined,
    );
    expect(hasStoredCredentials()).toBe(true);
  });

  it('hasStoredCredentials is false when only stored user profile exists', () => {
    persistAuthUser(guestSession.user);
    mockCookieClient.get.mockReturnValue(undefined);
    expect(hasStoredCredentials()).toBe(false);
  });

  it('tracks logout-in-flight flag', () => {
    expect(isAuthLogoutInFlight()).toBe(false);
    setAuthLogoutInFlight(true);
    expect(isAuthLogoutInFlight()).toBe(true);
    setAuthLogoutInFlight(false);
    expect(isAuthLogoutInFlight()).toBe(false);
  });
});

describe('auth.client JWT helpers', () => {
  it('decodes JWT payload segment', () => {
    const token = encodeJwtPayload({
      user_id: '1',
      session_id: 'sess-1',
      is_guest: false,
      exp: 9999999999,
      iat: 1000,
      type: 'access',
    });
    expect(parseJwtPayload(token).user_id).toBe('1');
    expect(parseJwtPayload(token).session_id).toBe('sess-1');
  });

  it('throws on invalid JWT format', () => {
    expect(() => parseJwtPayload('not-a-jwt')).toThrow('Invalid JWT format');
  });

  it('throws when payload segment is missing', () => {
    expect(() => parseJwtPayload('a..c')).toThrow('Invalid JWT payload segment');
  });

  it('decodes JWT payload via atob when Buffer is unavailable', () => {
    const token = encodeJwtPayload({
      user_id: 'atob-user',
      session_id: 'sess-1',
      is_guest: false,
      exp: 9999999999,
      iat: 1000,
      type: 'access',
    });
    const originalBuffer = global.Buffer;
    Object.defineProperty(global, 'Buffer', { value: undefined, configurable: true });
    expect(parseJwtPayload(token).user_id).toBe('atob-user');
    Object.defineProperty(global, 'Buffer', { value: originalBuffer, configurable: true });
  });

  it('isGuestToken returns true for guest claims', () => {
    const token = encodeJwtPayload({
      user_id: '1',
      session_id: 's',
      is_guest: true,
      exp: 1,
      iat: 1,
      type: 'access',
    });
    expect(isGuestToken(token)).toBe(true);
  });

  it('isGuestToken returns false for authenticated claims', () => {
    const token = encodeJwtPayload({
      user_id: '1',
      session_id: 's',
      is_guest: false,
      exp: 1,
      iat: 1,
      type: 'access',
    });
    expect(isGuestToken(token)).toBe(false);
  });

  it('isGuestToken treats malformed token as guest', () => {
    expect(isGuestToken('bad-token')).toBe(true);
  });

  it('normalizeJwtClaims maps sub and isGuest aliases', () => {
    expect(
      normalizeJwtClaims({
        sub: 'user-sub',
        sid: 'sess-sub',
        isGuest: true,
        exp: 999,
        iat: 1,
      }),
    ).toEqual({
      user_id: 'user-sub',
      session_id: 'sess-sub',
      is_guest: true,
      exp: 999,
      iat: 1,
      type: undefined,
      shopify_customer_id: undefined,
    });
  });

  it('parseJwtPayload normalises sub claim from token', () => {
    const token = encodeJwtPayload({
      sub: 'sub-user',
      sid: 'sess-sub',
      isGuest: false,
      exp: 9999999999,
      iat: 1000,
    });
    expect(parseJwtPayload(token).user_id).toBe('sub-user');
  });

  it('isUsableAccessTokenClaims accepts expired token when allowExpired is true', () => {
    expect(
      isUsableAccessTokenClaims(
        {
          user_id: '1',
          session_id: 's',
          is_guest: true,
          exp: 1,
          iat: 1,
        },
        { allowExpired: true },
      ),
    ).toBe(true);
  });

  it('isUsableAccessTokenClaims accepts JWT without type claim', () => {
    expect(
      isUsableAccessTokenClaims({
        user_id: '1',
        session_id: 's',
        is_guest: false,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: 1000,
      }),
    ).toBe(true);
  });

  it('isUsableAccessTokenClaims rejects refresh type in access slot', () => {
    expect(
      isUsableAccessTokenClaims({
        user_id: '1',
        session_id: 's',
        is_guest: false,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: 1000,
        type: 'refresh',
      }),
    ).toBe(false);
  });

  it('isUsableAccessTokenClaims rejects expired access token', () => {
    expect(
      isUsableAccessTokenClaims({
        user_id: '1',
        session_id: 's',
        is_guest: false,
        exp: Math.floor(Date.now() / 1000) - 10,
        iat: 1000,
        type: 'access',
      }),
    ).toBe(false);
  });

  it('isUsableAccessTokenClaims rejects missing user_id', () => {
    expect(
      isUsableAccessTokenClaims({
        user_id: '',
        session_id: 's',
        is_guest: true,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: 1000,
      }),
    ).toBe(false);
  });

  it('wasAuthenticatedSession returns false when access cookie is absent', () => {
    mockCookieClient.get.mockReturnValue(undefined);
    expect(wasAuthenticatedSession()).toBe(false);
  });

  it('wasAuthenticatedSession returns false for malformed access cookie', () => {
    mockCookieClient.get.mockReturnValue('not-a-jwt');
    expect(wasAuthenticatedSession()).toBe(false);
  });

  it('normalizeJwtClaims infers guest from type when is_guest is absent', () => {
    expect(
      normalizeJwtClaims({
        user_id: '1',
        session_id: 's',
        type: 'guest',
        exp: 1,
        iat: 1,
      }).is_guest,
    ).toBe(true);
  });

  it('normalizeJwtClaims maps shopify_customer_id and jti session alias', () => {
    expect(
      normalizeJwtClaims({
        user_id: '1',
        jti: 'jti-sess',
        shopify_customer_id: 'shop-1',
        is_guest: false,
        exp: 1,
        iat: 1,
        type: 'access',
      }),
    ).toEqual({
      user_id: '1',
      session_id: 'jti-sess',
      is_guest: false,
      shopify_customer_id: 'shop-1',
      exp: 1,
      iat: 1,
      type: 'access',
    });
  });

  it('getStoredAuthUser returns null for invalid JSON in localStorage', () => {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, '{not-json');
    expect(getStoredAuthUser()).toBeNull();
  });

  it('clearStoredAuthUser removes cached profile', () => {
    persistAuthUser(guestSession.user);
    clearStoredAuthUser();
    expect(getStoredAuthUser()).toBeNull();
  });

  it('wasAuthenticatedSession returns true for non-guest access cookie', () => {
    const token = encodeJwtPayload({
      user_id: '1',
      session_id: 's',
      is_guest: false,
      exp: Math.floor(Date.now() / 1000) - 10,
      iat: 1000,
    });
    mockCookieClient.get.mockReturnValue(token);
    expect(wasAuthenticatedSession()).toBe(true);
  });

  it('wasAuthenticatedSession returns false for guest access cookie', () => {
    const token = encodeJwtPayload({
      user_id: '1',
      session_id: 's',
      is_guest: true,
      exp: 1,
      iat: 1,
      type: 'access',
    });
    mockCookieClient.get.mockReturnValue(token);
    expect(wasAuthenticatedSession()).toBe(false);
  });

  it('setTokens uses minimum lifetime for invalid expiresIn values', () => {
    setTokens({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: Number.NaN,
      refreshTokenExpiresIn: Number.NaN,
    });

    expect(mockCookieClient.set).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'a', 1 / 24);
    expect(mockCookieClient.set).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, 'r', 1 / 24);
  });
});

describe('auth.client device info', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getOrCreateDeviceId persists uuid in localStorage', () => {
    const first = getOrCreateDeviceId();
    const second = getOrCreateDeviceId();
    expect(first).toBe(second);
    expect(localStorage.getItem(DEVICE_ID_STORAGE_KEY)).toBe(first);
  });

  it('getWebDeviceInfo returns web device with null fcm_token', () => {
    const info = getWebDeviceInfo();
    expect(info.deviceType).toBe('web');
    expect(info.deviceId).toBeTruthy();
    expect(info.fcmToken).toBeNull();
  });

  it('getWebDeviceInfo falls back when navigator is unavailable', () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, 'navigator', { value: undefined, configurable: true });
    const info = getWebDeviceInfo();
    expect(info.deviceName).toBe('Web Browser');
    Object.defineProperty(global, 'navigator', { value: originalNavigator, configurable: true });
  });
});

describe('auth.client guard helpers', () => {
  it('canAccessSession allows authenticated user', () => {
    expect(canAccessSession(authedSession, 'authenticated')).toBe(true);
  });

  it('canAccessSession denies guest for authenticated requirement', () => {
    expect(canAccessSession(guestSession, 'authenticated')).toBe(false);
  });

  it('canAccessSession denies null session', () => {
    expect(canAccessSession(null, 'authenticated')).toBe(false);
  });

  it('canAccessSession denies null session even for guest requirement', () => {
    expect(canAccessSession(null, 'guest')).toBe(false);
  });

  it('canAccessSession allows any session for guest requirement', () => {
    expect(canAccessSession(guestSession, 'guest')).toBe(true);
  });
});

describe('auth.client dev helpers', () => {
  beforeEach(() => {
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');
  });

  it('logKwikpassAuth logs in development', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    logKwikpassAuth('test.step', 'hello', { ok: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logKwikpassAuth omits empty data in development', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    logKwikpassAuth('test.step', 'hello');
    expect(spy).toHaveBeenCalledWith('[auth.kwikpass]', 'test.step', 'hello', '');
    spy.mockRestore();
  });

  it('warnUnregisteredGuardId warns for unknown ids in development', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnUnregisteredGuardId('action', 'unknown.action');
    expect(spy).toHaveBeenCalledWith('[auth.guard] Unregistered action id: unknown.action');
    spy.mockRestore();
  });

  it('warnUnregisteredGuardId is silent for registered ids', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnUnregisteredGuardId('action', 'reviews.write');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logKwikpassAuth is silent outside development', () => {
    jest.replaceProperty(process.env, 'NODE_ENV', 'test');
    const spy = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    logKwikpassAuth('test.step', 'hello');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');
  });

  it('warnUnregisteredGuardId is silent outside development', () => {
    jest.replaceProperty(process.env, 'NODE_ENV', 'test');
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    warnUnregisteredGuardId('action', 'unknown.action');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');
  });
});
