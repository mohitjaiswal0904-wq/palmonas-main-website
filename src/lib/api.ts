import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import {
  getAccessToken,
  getRefreshToken,
  isAuthBootstrapInFlight,
  isAuthLogoutInFlight,
  setTokens,
} from '@/lib/auth/auth.client';
import { ENDPOINTS } from '@/lib/endpoints';
import { getApiBaseUrl } from '@/lib/env';
import { transformRefreshTokens } from '@/types/auth/auth.transforms';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

const AUTH_PATHS_WITHOUT_BEARER = [
  ENDPOINTS.auth.guestLogin,
  ENDPOINTS.auth.refresh,
  ENDPOINTS.auth.validate,
] as const;

const client = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<void> | null = null;
let onSessionInvalidated: (() => void) | null = null;
let onTokenRefreshed: (() => void) | null = null;

/**
 * Registers a handler invoked when token refresh fails after a 401 (e.g. session expired).
 *
 * @param handler - Callback to re-bootstrap session and notify the user.
 * @returns Unsubscribe function.
 */
export function registerSessionInvalidationHandler(handler: () => void): () => void {
  onSessionInvalidated = handler;
  return () => {
    if (onSessionInvalidated === handler) {
      onSessionInvalidated = null;
    }
  };
}

/**
 * Registers a handler invoked after a successful silent token refresh.
 *
 * @param handler - Callback to sync React session state from storage.
 * @returns Unsubscribe function.
 */
export function registerTokenRefreshHandler(handler: () => void): () => void {
  onTokenRefreshed = handler;
  return () => {
    if (onTokenRefreshed === handler) {
      onTokenRefreshed = null;
    }
  };
}

/**
 * Refreshes tokens via Palmonas API using the refresh cookie (no interceptors).
 *
 * @throws Error when refresh token is missing or refresh request fails.
 */
async function refreshSessionOnce(): Promise<void> {
  if (isAuthLogoutInFlight()) {
    throw new Error('Logout in flight');
  }

  if (refreshPromise) {
    await refreshPromise;
    return;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const baseUrl = getApiBaseUrl().replace(/\/$/, '');
    const { data } = await axios.post<{ data: Parameters<typeof transformRefreshTokens>[0] }>(
      `${baseUrl}${ENDPOINTS.auth.refresh}`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15_000 },
    );

    setTokens(transformRefreshTokens(data.data));
    onTokenRefreshed?.();
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Attaches Bearer token to outgoing requests; skips auth endpoints that must not send it.
 *
 * @param config - Axios request config.
 * @returns Config with Authorization header when applicable.
 */
function attachBearerToken(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const path = config.url ?? '';
  const skipBearer = AUTH_PATHS_WITHOUT_BEARER.some((endpoint) => path.includes(endpoint));
  if (!skipBearer) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}

/**
 * Handles 401 responses: refresh tokens once, retry request, or invoke session recovery.
 *
 * @param error - Axios error from failed request.
 * @returns Retried response on successful refresh, or rejected promise.
 */
async function handleUnauthorizedResponse(error: AxiosError): Promise<unknown> {
  if (isAuthLogoutInFlight()) {
    return Promise.reject(error);
  }

  const original = error.config as RetryableConfig | undefined;
  if (error.response?.status === 401 && original && !original._retried) {
    original._retried = true;
    try {
      await refreshSessionOnce();
      const token = getAccessToken();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
      }
      return client(original);
    } catch {
      if (!isAuthBootstrapInFlight() && !isAuthLogoutInFlight()) {
        onSessionInvalidated?.();
      }
    }
  }
  return Promise.reject(error);
}

client.interceptors.request.use(attachBearerToken);

client.interceptors.response.use((response) => response, handleUnauthorizedResponse);

/**
 * Single Axios instance for all client-side Palmonas API calls.
 * Attaches Bearer token and handles 401 refresh + retry.
 */
export const api = client;
