import {
  AUTH_USER_STORAGE_KEY,
  DEVICE_ID_STORAGE_KEY,
  getAuthRequirement,
  isProtectedRoute,
  type AuthGuardKind,
  type AuthRequirement,
} from '@/config/auth/auth.config';
import { cookieClient } from '@/lib/cookies/client';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/cookies/constants';
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from '@/lib/storage/local-storage';
import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  DeviceInfo,
  JwtClaims,
} from '@/types/auth/auth.types';

const MIN_COOKIE_DAYS = 1 / 24;

type RawJwtClaims = Record<string, unknown>;

// ─── JWT helpers ─────────────────────────────────────────────────────────────

/**
 * Decodes a base64url JWT segment to UTF-8 JSON text.
 *
 * @param segment - Middle segment of a JWT.
 * @returns Decoded string payload.
 */
function decodeBase64Url(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }
  return atob(padded);
}

/**
 * Maps backend JWT payload variants to domain JwtClaims.
 *
 * @param raw - Decoded JWT payload object.
 * @returns Normalised claims for session hydration.
 */
export function normalizeJwtClaims(raw: RawJwtClaims): JwtClaims {
  const userId = raw.user_id ?? raw.sub ?? raw.id ?? raw.userId;
  const sessionId = raw.session_id ?? raw.sid ?? raw.jti ?? userId;
  const guestFlag = raw.is_guest ?? raw.isGuest;
  const isGuest = typeof guestFlag === 'boolean' ? guestFlag : raw.type === 'guest';

  return {
    user_id: String(userId ?? ''),
    session_id: String(sessionId ?? ''),
    is_guest: Boolean(isGuest),
    shopify_customer_id:
      typeof raw.shopify_customer_id === 'string' ? raw.shopify_customer_id : undefined,
    exp: Number(raw.exp ?? 0),
    iat: Number(raw.iat ?? 0),
    type: raw.type === 'refresh' || raw.type === 'access' ? raw.type : undefined,
  };
}

/**
 * Decodes JWT payload without signature verification.
 *
 * @param token - Raw JWT string.
 * @returns Parsed claims object.
 * @throws Error when token format is invalid.
 */
export function parseJwtPayload(token: string): JwtClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const segment = parts[1];
  if (!segment) {
    throw new Error('Invalid JWT payload segment');
  }
  const json = decodeBase64Url(segment);
  const payload = JSON.parse(json) as RawJwtClaims;
  return normalizeJwtClaims(payload);
}

/** Alias for parseJwtPayload — emphasises access-token hydration use. */
export const parseAccessTokenClaims = parseJwtPayload;

/**
 * Returns true when JWT claims represent a usable access token (not refresh, not expired).
 *
 * @param claims - Decoded JWT payload.
 * @param options - When allowExpired is true, only rejects refresh type and missing user_id.
 * @returns True when token can hydrate a client session.
 */
export function isUsableAccessTokenClaims(
  claims: JwtClaims,
  options?: { allowExpired?: boolean },
): boolean {
  if (claims.type === 'refresh') {
    return false;
  }
  if (!claims.user_id) {
    return false;
  }
  if (!options?.allowExpired && claims.exp * 1000 <= Date.now()) {
    return false;
  }
  return true;
}

/**
 * Returns true when the stored access token belonged to an authenticated (non-guest) user.
 * Works even when the token is expired — used before demotion to guest.
 *
 * @returns True when access cookie JWT has is_guest false.
 */
export function wasAuthenticatedSession(): boolean {
  const token = getAccessToken();
  if (!token) {
    return false;
  }
  try {
    return !parseJwtPayload(token).is_guest;
  } catch {
    return false;
  }
}

/**
 * Returns true when access token belongs to a guest session.
 *
 * @param accessToken - Raw JWT access token.
 * @returns True when JWT claims indicate guest user.
 */
export function isGuestToken(accessToken: string): boolean {
  try {
    return parseJwtPayload(accessToken).is_guest;
  } catch {
    return true;
  }
}

// ─── Token storage ───────────────────────────────────────────────────────────

/**
 * Converts API `expires_in` seconds to js-cookie `expires` days.
 *
 * @param seconds - Token lifetime from auth API.
 * @returns Cookie expiry in fractional days.
 */
function secondsToCookieDays(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return MIN_COOKIE_DAYS;
  }
  return Math.max(seconds / 86_400, MIN_COOKIE_DAYS);
}

/**
 * Reads the access JWT from cookies.
 *
 * @returns Access token string or undefined when absent.
 */
export function getAccessToken(): string | undefined {
  return cookieClient.get(AUTH_TOKEN_KEY);
}

/**
 * Reads the refresh JWT from cookies.
 *
 * @returns Refresh token string or undefined when absent.
 */
export function getRefreshToken(): string | undefined {
  return cookieClient.get(REFRESH_TOKEN_KEY);
}

/**
 * Persists access and refresh tokens in cookies.
 *
 * @param tokens - Token pair and expiry metadata from auth API.
 */
export function setTokens(tokens: AuthTokens): void {
  if (!tokens.accessToken || !tokens.refreshToken) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth] setTokens skipped — missing access or refresh token from API');
    }
    return;
  }
  cookieClient.set(AUTH_TOKEN_KEY, tokens.accessToken, secondsToCookieDays(tokens.expiresIn));
  cookieClient.set(
    REFRESH_TOKEN_KEY,
    tokens.refreshToken,
    secondsToCookieDays(tokens.refreshTokenExpiresIn),
  );
}

/**
 * Removes auth tokens from cookies.
 */
export function clearTokens(): void {
  cookieClient.remove(AUTH_TOKEN_KEY);
  cookieClient.remove(REFRESH_TOKEN_KEY);
}

/**
 * Persists user profile in localStorage (mobile AsyncStorage equivalent).
 *
 * @param user - Current auth user profile.
 */
export function persistAuthUser(user: AuthUser): void {
  writeLocalStorage(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Reads stored user profile from localStorage.
 *
 * @returns AuthUser or null when absent or invalid.
 */
export function getStoredAuthUser(): AuthUser | null {
  const raw = readLocalStorage(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Removes stored user profile from localStorage.
 */
export function clearStoredAuthUser(): void {
  removeLocalStorage(AUTH_USER_STORAGE_KEY);
}

/**
 * Clears tokens and stored user profile.
 */
export function clearAuthStorage(): void {
  clearTokens();
  clearStoredAuthUser();
}

/**
 * Returns true when auth token cookies exist (bootstrap should restore, not guest-login).
 *
 * @returns True when access or refresh cookie is present.
 */
export function hasStoredCredentials(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

let authBootstrapInFlight = false;
let authLogoutInFlight = false;

/**
 * Marks auth bootstrap in progress so 401 handlers do not clear cookies mid-restore.
 *
 * @param value - True while bootstrapAuthSession is running.
 */
export function setAuthBootstrapInFlight(value: boolean): void {
  authBootstrapInFlight = value;
}

/**
 * Returns true while bootstrapAuthSession is in flight.
 */
export function isAuthBootstrapInFlight(): boolean {
  return authBootstrapInFlight;
}

/**
 * Marks explicit logout in progress so refresh/validate/recovery do not re-auth.
 *
 * @param value - True while logoutAndResetSession is running.
 */
export function setAuthLogoutInFlight(value: boolean): void {
  authLogoutInFlight = value;
}

/**
 * Returns true while logoutAndResetSession is in flight.
 */
export function isAuthLogoutInFlight(): boolean {
  return authLogoutInFlight;
}

// ─── Device info ─────────────────────────────────────────────────────────────

/**
 * Returns a stable device id for guest/login API bodies (persists in localStorage).
 *
 * @returns UUID device identifier.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server-device-id';
  }
  const existing = readLocalStorage(DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  writeLocalStorage(DEVICE_ID_STORAGE_KEY, id);
  return id;
}

/**
 * Builds web device_info for auth APIs (guest-login and login).
 *
 * @returns DeviceInfo for repository requests.
 */
export function getWebDeviceInfo(): DeviceInfo {
  const deviceId = getOrCreateDeviceId();
  const deviceName =
    typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 120) : 'Web Browser';
  return {
    deviceType: 'web',
    deviceId,
    deviceName,
    fcmToken: null,
  };
}

// ─── Dev logging ─────────────────────────────────────────────────────────────

/**
 * Dev-only KwikPass auth flow logging.
 *
 * @param step - Flow step identifier.
 * @param message - Human-readable message.
 * @param data - Optional structured context.
 */
export function logKwikpassAuth(step: string, message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.info('[auth.kwikpass]', step, message, data ?? '');
  }
}

// ─── Auth guard helpers ──────────────────────────────────────────────────────

export type { AuthGuardKind, AuthRequirement };

/**
 * Returns true when session satisfies the auth requirement.
 *
 * @param session - Current client auth session or null.
 * @param requirement - Required access level from registry.
 * @returns True when user may proceed.
 */
export function canAccessSession(
  session: AuthSession | null,
  requirement: AuthRequirement = 'authenticated',
): boolean {
  if (!session) {
    return false;
  }
  if (requirement === 'guest') {
    return true;
  }
  return !session.user.isGuest;
}

/**
 * Warns in development when a guard id is not registered in auth config.
 *
 * @param kind - Guard surface kind.
 * @param id - Registry id to validate.
 */
export function warnUnregisteredGuardId(kind: AuthGuardKind, id: string): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  if (getAuthRequirement(kind, id) === undefined) {
    console.warn(`[auth.guard] Unregistered ${kind} id: ${id}`);
  }
}

export { isProtectedRoute, getAuthRequirement };
