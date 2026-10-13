import axios from 'axios';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { getApiBaseUrl } from '@/lib/env';
import { normaliseError } from '@/lib/errors';
import type { AuthLoginResponseApi } from '@/types/auth/auth.transforms';
import {
  toCartLoginItemsApi,
  toDeviceInfoApi,
  toLoginGokwikApi,
  transformAuthLoginResponse,
  transformAuthUser,
  transformRefreshTokens,
} from '@/types/auth/auth.transforms';
import type {
  AuthTokens,
  AuthUser,
  DeviceInfo,
  KwikpassLoginInput,
  LogoutInput,
} from '@/types/auth/auth.types';

interface ValidateResponseApi {
  data: {
    user: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phone_number: string | null;
      profile_picture: string | null;
      gender: string;
      is_guest: boolean;
    };
  };
}

interface RefreshResponseApi {
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in: number;
  };
}

/**
 * Creates a guest session via backend guest-login API.
 *
 * @param deviceInfo - Stable device descriptor for cart continuity.
 * @returns Tokens and guest user profile.
 * @throws Normalised app error when the API request fails.
 */
export async function createGuestSession(deviceInfo: DeviceInfo): Promise<{
  tokens: AuthTokens;
  user: AuthUser;
}> {
  try {
    const { data } = await api.post<AuthLoginResponseApi>(ENDPOINTS.auth.guestLogin, {
      device_info: toDeviceInfoApi(deviceInfo),
    });
    return transformAuthLoginResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Authenticates user after KwikPass OTP via backend login API.
 *
 * @param input - Gokwik payload, device info, login type, optional cart id for merge.
 * @returns Tokens and authenticated user profile.
 * @throws Normalised app error when the API request fails.
 */
export async function loginWithKwikpass(input: KwikpassLoginInput): Promise<{
  tokens: AuthTokens;
  user: AuthUser;
  cartId?: string;
}> {
  try {
    const { data } = await api.post<AuthLoginResponseApi>(ENDPOINTS.auth.login, {
      gokwik: toLoginGokwikApi(input.gokwik, input.loginType),
      device_info: toDeviceInfoApi(input.deviceInfo),
      login_type: input.loginType,
      ...(input.cartId ? { cart_id: input.cartId } : {}),
      ...(input.cartItems?.length ? { cart_items: toCartLoginItemsApi(input.cartItems) } : {}),
      ...(input.couponCodes?.length ? { coupon_codes: input.couponCodes } : {}),
    });
    return transformAuthLoginResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Logs out user and revokes tokens on backend.
 * Uses a direct HTTP call (no auth interceptors) so a 401 cannot trigger token refresh.
 *
 * @param input - User id and token pair for logout body.
 * @throws Normalised app error when the API request fails.
 */
export async function logoutUser(input: LogoutInput): Promise<void> {
  try {
    const baseUrl = getApiBaseUrl().replace(/\/$/, '');
    await axios.post(
      `${baseUrl}${ENDPOINTS.auth.logout}`,
      {
        user_id: input.userId,
        access_token: input.accessToken,
        refresh_token: input.refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input.accessToken}`,
        },
        timeout: 15_000,
      },
    );
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Validates access token and returns user profile.
 *
 * @param accessToken - Current access JWT.
 * @returns User when token is valid.
 * @throws Normalised app error when validation fails.
 */
export async function validateAccessToken(accessToken: string): Promise<AuthUser> {
  try {
    const { data } = await api.post<ValidateResponseApi>(ENDPOINTS.auth.validate, {
      access_token: accessToken,
    });
    return transformAuthUser(data.data.user);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Refreshes tokens using refresh token.
 *
 * @param refreshToken - Refresh JWT.
 * @returns New token pair.
 * @throws Normalised app error when refresh fails.
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const { data } = await api.post<RefreshResponseApi>(ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });
    return transformRefreshTokens(data.data);
  } catch (err) {
    throw normaliseError(err);
  }
}
