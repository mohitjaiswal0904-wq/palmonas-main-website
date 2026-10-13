import { buildMockGokwikPayload } from '@/config/auth/mock-auth.config';
import { clearGokwikCheckoutIdentity, syncGokwikCheckoutIdentity } from '@/infrastructure/checkout';
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getStoredAuthUser,
  getWebDeviceInfo,
  hasStoredCredentials,
  isUsableAccessTokenClaims,
  isAuthLogoutInFlight,
  logKwikpassAuth,
  parseJwtPayload,
  persistAuthUser,
  setAuthBootstrapInFlight,
  setAuthLogoutInFlight,
  setTokens,
  wasAuthenticatedSession,
} from '@/lib/auth/auth.client';
import { clearLocalCartState } from '@/lib/cart/clear-local-cart-state';
import {
  createGuestSession,
  loginWithKwikpass,
  logoutUser,
  refreshAccessToken,
  validateAccessToken,
} from '@/services/auth/auth.service';
import { useCartStore } from '@/store/cart/cart.store';
import { buildAuthSession, mapKpTokenToGokwik } from '@/types/auth/auth.transforms';
import type {
  AuthSession,
  AuthSessionResult,
  AuthTokens,
  AuthUser,
  CartLoginItem,
  LoginType,
} from '@/types/auth/auth.types';
import { isCartLoginType } from '@/types/auth/auth.types';

/**
 * Builds a minimal user profile from JWT claims when validate API is unreachable.
 *
 * @param claims - Decoded access token claims.
 * @returns Guest-shaped user for session hydration.
 */
function userFromClaims(claims: ReturnType<typeof parseJwtPayload>): AuthUser {
  return {
    id: claims.user_id,
    firstName: null,
    lastName: null,
    email: null,
    phoneNumber: null,
    profilePicture: null,
    gender: 'prefer-not-to-say',
    isGuest: claims.is_guest,
  };
}

/**
 * Persists tokens and user profile in client storage.
 *
 * @param tokens - Access and refresh token pair from auth API.
 * @param user - User profile to mirror in localStorage.
 */
export function persistAuthSnapshot(tokens: AuthTokens, user: AuthUser): void {
  setTokens(tokens);
  persistAuthUser(user);

  // Prefill GoKwik checkout with session phone (mock + real KwikPass).
  if (!user.isGuest && user.phoneNumber) {
    syncGokwikCheckoutIdentity({ phone: user.phoneNumber, email: user.email });
  }
}

/**
 * Persists tokens in secure client cookies.
 *
 * @param tokens - Access and refresh token pair from auth API.
 */
export function persistSession(tokens: AuthTokens): void {
  setTokens(tokens);
  const storedUser = getStoredAuthUser();
  if (storedUser) {
    persistAuthUser(storedUser);
  }
}

/**
 * Returns true when the access token JWT is past expiry.
 *
 * @param accessToken - Raw access JWT.
 * @returns True when exp is in the past.
 */
function isAccessTokenExpired(accessToken: string): boolean {
  try {
    const claims = parseJwtPayload(accessToken);
    return claims.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/** Options controlling how {@link hydrateSessionFromStorage} reads stored credentials. */
export interface HydrateSessionOptions {
  /** When true, validates access token via API and refreshes stored user profile. */
  validate?: boolean;
  /** When true, accepts expired access JWT for stale session reuse. */
  allowExpired?: boolean;
}

/**
 * Hydrates session from stored tokens and user profile without requiring guest-login.
 *
 * @param options - validate: call validate API; allowExpired: accept expired access JWT.
 * @returns Auth session or null when tokens cannot be parsed.
 */
export async function hydrateSessionFromStorage(
  options: HydrateSessionOptions = {},
): Promise<AuthSession | null> {
  const { validate = false, allowExpired = false } = options;
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  try {
    const claims = parseJwtPayload(accessToken);
    if (!isUsableAccessTokenClaims(claims, { allowExpired })) {
      return null;
    }

    let user = getStoredAuthUser() ?? userFromClaims(claims);

    if (validate && !allowExpired && !isAuthLogoutInFlight()) {
      try {
        user = await validateAccessToken(accessToken);
        persistAuthUser(user);
      } catch {
        // Keep stored user or JWT-derived profile.
      }
    }

    return buildAuthSession(user, claims);
  } catch {
    return null;
  }
}

/**
 * Hydrates session from stored access token and validate API (strict, live token).
 *
 * @returns Auth session or null when no valid token exists.
 */
export async function fetchSession(): Promise<AuthSession | null> {
  return hydrateSessionFromStorage({ validate: true, allowExpired: false });
}

/**
 * Re-reads session from storage after silent token refresh (no API).
 *
 * @returns Auth session or null when storage is empty.
 */
export async function syncSessionFromStorage(): Promise<AuthSession | null> {
  return hydrateSessionFromStorage({ validate: false, allowExpired: false });
}

/**
 * Clears auth cookies and stored user profile.
 */
export function clearSession(): void {
  clearGokwikCheckoutIdentity();
  clearAuthStorage();
}

let bootstrapPromise: Promise<AuthSessionResult> | null = null;
let recoverPromise: Promise<AuthSessionResult> | null = null;

/**
 * Creates a new guest session when restore is impossible (overwrites cookies; no clearSession).
 *
 * @returns Guest session result with demotion flag when applicable.
 */
async function createGuestSessionAfterRestoreFailed(
  phase: 'bootstrap' | 'recover' | 'refresh',
  reason: string,
): Promise<AuthSessionResult> {
  const demotedFromAuthenticated = wasAuthenticatedSession();
  logKwikpassAuth(`${phase}.guest`, 'Creating guest session', { reason });
  const session = await createGuestAuthSession();
  return toSessionResult(
    session,
    demotedFromAuthenticated && session.user.isGuest,
    'guest',
    phase,
    reason,
  );
}

/**
 * Restore-first session recovery from stored credentials (no cold-start guest-login).
 *
 * @param phase - Caller context for dev diagnostics.
 * @returns Active session; guest-login only when credentials exist but cannot be restored.
 */
async function restoreSessionFromCredentials(
  phase: 'bootstrap' | 'recover' | 'refresh',
): Promise<AuthSessionResult> {
  logKwikpassAuth(`${phase}.restore`, 'Restoring session from storage', {
    hasAccessCookie: Boolean(getAccessToken()),
    hasRefreshCookie: Boolean(getRefreshToken()),
  });

  const hydrated = await hydrateSessionFromStorage({ validate: false, allowExpired: true });

  if (hydrated) {
    const accessToken = getAccessToken();
    const expired = !accessToken || isAccessTokenExpired(accessToken);

    if (!expired) {
      return toSessionResult(hydrated, false, 'reuse', phase);
    }

    const refreshed = await tryRefreshStoredSession();
    if (refreshed) {
      return toSessionResult(refreshed, false, 'refresh', phase);
    }

    return toSessionResult(hydrated, false, 'reuse', phase, 'stale_reuse');
  }

  const refreshed = await tryRefreshStoredSession();
  if (refreshed) {
    return toSessionResult(refreshed, false, 'refresh', phase, 'access_missing');
  }

  if (!hasStoredCredentials()) {
    return createGuestSessionAfterRestoreFailed(phase, 'cold_start');
  }

  return createGuestSessionAfterRestoreFailed(phase, 'restore_failed');
}

/**
 * Creates a new guest session and persists tokens + user.
 *
 * @returns Active guest session.
 */
async function createGuestAuthSession(): Promise<AuthSession> {
  const deviceInfo = getWebDeviceInfo();
  const { tokens, user } = await createGuestSession(deviceInfo);
  persistAuthSnapshot(tokens, user);

  const session = await hydrateSessionFromStorage({ validate: false, allowExpired: false });
  if (session) {
    return session;
  }

  const claims = parseJwtPayload(tokens.accessToken);
  return buildAuthSession(user, claims);
}

/**
 * Clears credentials and creates a fresh guest session (logout / session invalidation).
 *
 * @returns New guest session and demotion flag when applicable.
 */
export async function restoreGuestSession(): Promise<AuthSessionResult> {
  const demotedFromAuthenticated = wasAuthenticatedSession();
  clearSession();
  const session = await createGuestAuthSession();
  return {
    session,
    demotedFromAuthenticated: demotedFromAuthenticated && session.user.isGuest,
  };
}

/**
 * Emits dev-only bootstrap/recover diagnostics (cookie presence, user id, branch).
 *
 * @param phase - bootstrap, recover, or refresh caller.
 * @param branch - Restore path taken.
 * @param session - Resulting session.
 * @param reason - Optional sub-reason for the branch.
 */
function logBootstrapDiagnostics(
  phase: 'bootstrap' | 'recover' | 'refresh',
  branch: 'reuse' | 'refresh' | 'guest',
  session: AuthSession,
  reason?: string,
): void {
  logKwikpassAuth(`${phase}.ok`, 'Auth session ready', {
    branch,
    reason,
    isGuest: session.user.isGuest,
    userId: session.user.id,
    hasAccessCookie: Boolean(getAccessToken()),
    hasRefreshCookie: Boolean(getRefreshToken()),
  });
}

/**
 * Logs dev bootstrap/recover branch and builds {@link AuthSessionResult}.
 *
 * @param session - Hydrated or refreshed session.
 * @param demotedFromAuthenticated - True when user dropped from authed to guest.
 * @param branch - Restore path taken (reuse, refresh, or guest).
 * @param phase - Caller context for diagnostics.
 * @param reason - Optional sub-reason (stale_reuse, cold_start, …).
 * @returns Session result for AuthProvider.
 */
function toSessionResult(
  session: AuthSession,
  demotedFromAuthenticated: boolean,
  branch: 'reuse' | 'refresh' | 'guest',
  phase: 'bootstrap' | 'recover' | 'refresh' = 'bootstrap',
  reason?: string,
): AuthSessionResult {
  logBootstrapDiagnostics(phase, branch, session, reason);
  return { session, demotedFromAuthenticated };
}

/**
 * Refreshes tokens from the refresh cookie and hydrates session.
 *
 * @returns Refreshed session or null when refresh token is absent or refresh fails.
 */
async function tryRefreshStoredSession(): Promise<AuthSession | null> {
  if (isAuthLogoutInFlight()) {
    return null;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    persistSession(tokens);
    const session =
      (await hydrateSessionFromStorage({ validate: false, allowExpired: false })) ??
      (isAuthLogoutInFlight()
        ? null
        : await hydrateSessionFromStorage({ validate: true, allowExpired: false }));
    if (session) {
      persistAuthUser(session.user);
      return session;
    }
  } catch {
    // Fall through — caller decides stale reuse vs guest-login.
  }

  return null;
}

/**
 * Hydrates, refreshes, or creates guest session (single in-flight call).
 *
 * @returns Active session and whether user was demoted from authenticated to guest.
 */
async function bootstrapAuthSessionCore(): Promise<AuthSessionResult> {
  setAuthBootstrapInFlight(true);
  try {
    if (!hasStoredCredentials()) {
      logKwikpassAuth('bootstrap.guest', 'Creating guest session', { reason: 'cold_start' });
      const session = await createGuestAuthSession();
      return toSessionResult(session, false, 'guest', 'bootstrap', 'cold_start');
    }

    return restoreSessionFromCredentials('bootstrap');
  } finally {
    setAuthBootstrapInFlight(false);
  }
}

/**
 * Recover session after 401 invalidation — restore-first, same rules as bootstrap.
 *
 * @returns Restored session; guest-login only when credentials cannot be recovered.
 */
async function recoverAuthSessionCore(): Promise<AuthSessionResult> {
  setAuthBootstrapInFlight(true);
  try {
    if (!hasStoredCredentials()) {
      return createGuestSessionAfterRestoreFailed('recover', 'invalidation_no_credentials');
    }

    return restoreSessionFromCredentials('recover');
  } finally {
    setAuthBootstrapInFlight(false);
  }
}

/**
 * Bootstraps auth: restore from storage, refresh, or create guest on cold start.
 *
 * @returns Active session and demotion flag when applicable.
 */
export async function bootstrapAuthSession(): Promise<AuthSessionResult> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapAuthSessionCore().finally(() => {
      bootstrapPromise = null;
    });
  }
  return bootstrapPromise;
}

/**
 * Recovers session after API 401 invalidation without clearing cookies first.
 *
 * @returns Restored session and demotion flag when applicable.
 */
export async function recoverAuthSession(): Promise<AuthSessionResult> {
  if (!recoverPromise) {
    recoverPromise = recoverAuthSessionCore().finally(() => {
      recoverPromise = null;
    });
  }
  return recoverPromise;
}

/**
 * Completes login after KwikPass OTP success.
 *
 * @param kpToken - Token from kp_data_sent event.
 * @param loginType - Cart merge strategy label for backend.
 * @param options - Optional phone and pre-resolved cart id for merge.
 * @returns Authenticated session.
 */
export async function completeKwikpassLogin(
  kpToken: string,
  loginType: LoginType = 'jwe',
  options?: {
    phone?: string;
    cartId?: string;
    cartItems?: CartLoginItem[];
    couponCodes?: string[];
  },
): Promise<AuthSession> {
  const gokwik = mapKpTokenToGokwik(kpToken, options?.phone);
  const deviceInfo = getWebDeviceInfo();
  const { tokens, user, cartId } = await loginWithKwikpass({
    gokwik,
    deviceInfo,
    loginType,
    cartId: options?.cartId,
    cartItems: options?.cartItems,
    couponCodes: options?.couponCodes,
  });
  persistAuthSnapshot(tokens, user);

  if (isCartLoginType(loginType)) {
    useCartStore.getState().setSkipNextGuestCartMerge(true);
    if (cartId) {
      useCartStore.getState().setPostLoginCheckoutCartId(cartId);
    }
  }

  const session = await fetchSession();
  if (session) {
    return session;
  }

  const claims = parseJwtPayload(tokens.accessToken);
  return buildAuthSession(user, claims);
}

/**
 * Completes login via mock credentials (temporary until KwikPass is available).
 *
 * @param loginType - Cart merge strategy for backend.
 * @param options - Optional pre-resolved cart id or cart_items for cart login flows.
 * @returns Authenticated session.
 */
export async function completeMockLogin(
  loginType: LoginType = 'normal',
  options?: { cartId?: string; cartItems?: CartLoginItem[]; couponCodes?: string[] },
): Promise<AuthSession> {
  const gokwik = buildMockGokwikPayload();
  const deviceInfo = getWebDeviceInfo();
  const { tokens, user, cartId } = await loginWithKwikpass({
    gokwik,
    deviceInfo,
    loginType,
    cartId: options?.cartId,
    cartItems: options?.cartItems,
    couponCodes: options?.couponCodes,
  });
  persistAuthSnapshot(tokens, user);

  if (isCartLoginType(loginType)) {
    useCartStore.getState().setSkipNextGuestCartMerge(true);
    if (cartId) {
      useCartStore.getState().setPostLoginCheckoutCartId(cartId);
    }
  }

  const session = await fetchSession();
  if (session) {
    return session;
  }

  const claims = parseJwtPayload(tokens.accessToken);
  return buildAuthSession(user, claims);
}

/**
 * Logs out user, clears cookies, and creates fresh guest session.
 *
 * @returns New guest session after logout.
 */
export async function logoutAndResetSession(): Promise<AuthSession> {
  setAuthLogoutInFlight(true);

  try {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    let userId: string | undefined;

    if (accessToken) {
      try {
        userId = parseJwtPayload(accessToken).user_id;
      } catch {
        userId = undefined;
      }
    }

    clearSession();
    clearLocalCartState();

    if (userId && accessToken && refreshToken) {
      try {
        await logoutUser({
          userId,
          accessToken,
          refreshToken,
        });
      } catch {
        // Proceed with guest session when backend logout fails.
      }
    }

    const session = await createGuestAuthSession();
    return session;
  } finally {
    setAuthLogoutInFlight(false);
  }
}

/**
 * Refreshes session when nearing expiry or after proactive refresh.
 *
 * @returns Updated session; uses restore-first fallback instead of restoreGuestSession.
 */
export async function refreshAuthSession(): Promise<AuthSessionResult> {
  if (isAuthLogoutInFlight()) {
    const session = await hydrateSessionFromStorage({ validate: false, allowExpired: true });
    if (session) {
      return { session, demotedFromAuthenticated: false };
    }
    return createGuestSessionAfterRestoreFailed('refresh', 'logout_in_flight');
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    const stale = await hydrateSessionFromStorage({ validate: false, allowExpired: true });
    if (stale) {
      return { session: stale, demotedFromAuthenticated: false };
    }

    if (!hasStoredCredentials()) {
      return createGuestSessionAfterRestoreFailed('refresh', 'no_refresh_token');
    }

    return createGuestSessionAfterRestoreFailed('refresh', 'restore_failed');
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    persistSession(tokens);
    const session =
      (await hydrateSessionFromStorage({ validate: false, allowExpired: false })) ??
      (isAuthLogoutInFlight()
        ? null
        : await hydrateSessionFromStorage({ validate: true, allowExpired: false }));
    if (session) {
      persistAuthUser(session.user);
      return { session, demotedFromAuthenticated: false };
    }
  } catch {
    // Fall through to stale reuse or restore-first guest fallback.
  }

  const stale = await hydrateSessionFromStorage({ validate: false, allowExpired: true });
  if (stale) {
    return { session: stale, demotedFromAuthenticated: false };
  }

  if (!hasStoredCredentials()) {
    return createGuestSessionAfterRestoreFailed('refresh', 'refresh_failed');
  }

  return createGuestSessionAfterRestoreFailed('refresh', 'restore_failed');
}
