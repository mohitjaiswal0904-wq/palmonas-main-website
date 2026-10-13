import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  CartLoginItem,
  DeviceInfo,
  GokwikPayload,
  JwtClaims,
  LoginType,
  SessionClaims,
} from '@/types/auth/auth.types';

const DEFAULT_ACCESS_EXPIRES_IN = 86_400;
const DEFAULT_REFRESH_EXPIRES_IN = 604_800;

/**
 * Coerces API token lifetime seconds with safe fallbacks.
 *
 * @param value - Raw expires_in from API.
 * @param fallback - Default when missing or invalid.
 * @returns Positive seconds for cookie expiry.
 */
function coerceExpiresIn(value: unknown, fallback: number): number {
  const seconds = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return fallback;
  }
  return seconds;
}

interface AuthUserApi {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  profile_picture: string | null;
  gender: string;
  is_guest: boolean;
}

interface AuthLoginDataApi {
  success: boolean;
  user: AuthUserApi;
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  expires_in_seconds?: number;
  refresh_token_expires_in_seconds?: number;
  is_verified?: boolean;
  is_new?: boolean;
  message?: string;
  cart_id?: string | null;
}

interface AuthEnvelopeApi<T> {
  status: number;
  message: string;
  data: T;
}

export type AuthLoginResponseApi = AuthEnvelopeApi<AuthLoginDataApi>;

interface GokwikApi {
  phone?: string;
  email?: string | null;
  password?: string | null;
  shopify_customer_id?: string | null;
  is_new_user?: boolean;
  state?: string | null;
}

/**
 * Maps API user object to domain AuthUser.
 *
 * @param raw - User object from auth API envelope.
 * @returns Normalised AuthUser for context and UI.
 */
export function transformAuthUser(raw: AuthUserApi): AuthUser {
  return {
    id: raw.id,
    firstName: raw.first_name,
    lastName: raw.last_name,
    email: raw.email,
    phoneNumber: raw.phone_number,
    profilePicture: raw.profile_picture,
    gender: raw.gender,
    isGuest: raw.is_guest,
  };
}

/**
 * Maps login/guest-login API envelope to domain tokens + user.
 *
 * @param envelope - Full API response from guest-login or login.
 * @returns Tokens and user for session persistence.
 */
export function transformAuthLoginResponse(envelope: AuthLoginResponseApi): {
  tokens: AuthTokens;
  user: AuthUser;
  cartId?: string;
} {
  const { data } = envelope;
  const cartId = data.cart_id?.trim() || undefined;
  return {
    tokens: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: coerceExpiresIn(
        data.expires_in ?? data.expires_in_seconds,
        DEFAULT_ACCESS_EXPIRES_IN,
      ),
      refreshTokenExpiresIn: coerceExpiresIn(
        data.refresh_token_expires_in ?? data.refresh_token_expires_in_seconds,
        DEFAULT_REFRESH_EXPIRES_IN,
      ),
    },
    user: transformAuthUser(data.user),
    cartId,
  };
}

/**
 * Builds gokwik body for login — cart_jwe sends kp_token only; cart sends plaintext fields.
 *
 * @param gokwik - Domain gokwik payload.
 * @param loginType - Login merge / cart strategy.
 * @returns API gokwik object for login request.
 */
export function toLoginGokwikApi(
  gokwik: GokwikPayload,
  loginType: LoginType,
): Record<string, unknown> {
  if (loginType === 'cart_jwe' || loginType === 'jwe') {
    return { kp_token: gokwik.kpToken ?? null };
  }
  if (loginType === 'cart') {
    return {
      phone: gokwik.phone,
      email: gokwik.email,
      shopify_customer_id: gokwik.shopifyCustomerId,
    };
  }
  return toGokwikApi(gokwik);
}

/**
 * Serialises cart login line items to API snake_case body.
 *
 * @param items - Domain cart lines for cart / cart_jwe login.
 * @returns API cart_items array.
 */
export function toCartLoginItemsApi(items: CartLoginItem[]): Array<{
  merchandiseId: string;
  quantity: number;
}> {
  return items.map((item) => ({
    merchandiseId: item.merchandiseId,
    quantity: item.quantity,
  }));
}

/**
 * Maps refresh-token API data to domain AuthTokens.
 *
 * @param data - Refresh response data payload.
 * @returns Updated token pair.
 */
export function transformRefreshTokens(data: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  expires_in_seconds?: number;
  refresh_token_expires_in_seconds?: number;
}): AuthTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: coerceExpiresIn(
      data.expires_in ?? data.expires_in_seconds,
      DEFAULT_ACCESS_EXPIRES_IN,
    ),
    refreshTokenExpiresIn: coerceExpiresIn(
      data.refresh_token_expires_in ?? data.refresh_token_expires_in_seconds,
      DEFAULT_REFRESH_EXPIRES_IN,
    ),
  };
}

/**
 * Maps KwikPass kpToken to Gokwik login body (backend decodes token like mobile app).
 *
 * @param kpToken - JWE token from verifyOtp response.
 * @param phone - Phone collected in Palmonas login UI.
 * @returns GokwikPayload for Palmonas login API.
 */
export function mapKpTokenToGokwik(kpToken: string, phone?: string): GokwikPayload {
  return {
    phone: phone ?? '',
    email: null,
    password: null,
    shopifyCustomerId: null,
    isNewUser: false,
    state: 'active',
    kpToken,
    multipassToken: null,
    customerInsights: null,
  };
}

/**
 * Maps decoded JWE / KwikPass payload to Gokwik login body shape.
 *
 * @param payload - Decrypted kpToken payload from server decode route.
 * @returns GokwikPayload for login service.
 */
export function transformGokwikPayload(payload: GokwikApi): GokwikPayload {
  return {
    phone: payload.phone ?? '',
    email: payload.email ?? null,
    password: payload.password ?? null,
    shopifyCustomerId: payload.shopify_customer_id ?? null,
    isNewUser: payload.is_new_user ?? false,
    state: payload.state ?? 'active',
  };
}

/**
 * Maps JWT claims + user into client AuthSession.
 *
 * @param user - Current user profile.
 * @param claims - Parsed JWT claims from server.
 * @returns AuthSession for React context.
 */
export function buildAuthSession(user: AuthUser, claims: JwtClaims): AuthSession {
  const sessionClaims: SessionClaims = {
    userId: claims.user_id,
    sessionId: claims.session_id,
    isGuest: claims.is_guest,
    shopifyCustomerId: claims.shopify_customer_id ?? null,
    expiresAt: claims.exp,
  };
  return { user, claims: sessionClaims };
}

/**
 * Serialises domain DeviceInfo to API snake_case body.
 *
 * @param device - Client device descriptor.
 * @returns API request device_info object.
 */
export function toDeviceInfoApi(device: DeviceInfo): Record<string, string | null> {
  return {
    deviceType: device.deviceType,
    device_id: device.deviceId,
    device_name: device.deviceName,
    fcm_token: device.fcmToken,
  };
}

/**
 * Serialises GokwikPayload to API snake_case body.
 *
 * @param gokwik - Domain gokwik payload.
 * @returns API gokwik object for login request.
 */
export function toGokwikApi(gokwik: GokwikPayload): Record<string, unknown> {
  return {
    phone: gokwik.phone,
    email: gokwik.email,
    password: gokwik.password,
    shopify_customer_id: gokwik.shopifyCustomerId,
    is_new_user: gokwik.isNewUser,
    state: gokwik.state,
    kp_token: gokwik.kpToken ?? null,
    multipass_token: gokwik.multipassToken ?? null,
    customer_insights: gokwik.customerInsights ?? null,
  };
}

/**
 * Builds session claims from JWT payload (server-side).
 *
 * @param claims - Decoded JWT access token claims.
 * @returns SessionClaims safe for client exposure.
 */
export function jwtClaimsToSessionClaims(claims: JwtClaims): SessionClaims {
  return {
    userId: claims.user_id,
    sessionId: claims.session_id,
    isGuest: claims.is_guest,
    shopifyCustomerId: claims.shopify_customer_id ?? null,
    expiresAt: claims.exp,
  };
}
