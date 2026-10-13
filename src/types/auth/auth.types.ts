/** Login overlay and provider flow states. */
export type LoginStatus = 'idle' | 'loading' | 'opening' | 'syncing' | 'success' | 'error';

/** KwikPass script load state (reserved for future UI). */
export type KwikpassScriptState = 'loading' | 'ready' | 'error';

/** JWT access-token payload fields used for session claims. */
export interface JwtClaims {
  user_id: string;
  session_id: string;
  is_guest: boolean;
  shopify_customer_id?: string;
  exp: number;
  iat: number;
  /** Omitted when backend does not set token type (treated as access). */
  type?: 'access' | 'refresh';
}

/** Authenticated or guest user profile from auth APIs. */
export interface AuthUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  profilePicture: string | null;
  gender: string;
  isGuest: boolean;
}

/** Non-secret session claims exposed to the client via useAuth().claims. */
export interface SessionClaims {
  userId: string;
  sessionId: string;
  isGuest: boolean;
  shopifyCustomerId: string | null;
  expiresAt: number;
}

/** Full client auth session (identity only — tokens stay in secure client cookies). */
export interface AuthSession {
  user: AuthUser;
  claims: SessionClaims;
}

/** Result from bootstrap/refresh when session level may change. */
export interface AuthSessionResult {
  session: AuthSession;
  demotedFromAuthenticated: boolean;
}

export interface AuthTokens {
  /** JWT access token. */
  accessToken: string;
  /** JWT refresh token. */
  refreshToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  /** Refresh token lifetime in seconds. */
  refreshTokenExpiresIn: number;
}

export interface GokwikPayload {
  phone: string;
  email: string | null;
  password: string | null;
  shopifyCustomerId: string | null;
  isNewUser: boolean;
  state: string | null;
  kpToken?: string | null;
  multipassToken?: string | null;
  customerInsights?: Record<string, unknown> | null;
}

export interface DeviceInfo {
  deviceType: 'ios' | 'android' | 'web';
  deviceId: string;
  deviceName: string;
  fcmToken: string | null;
}

/** Cart merge strategy for KwikPass login API. */
export type LoginType = 'normal' | 'checkout' | 'jwe' | 'cart' | 'cart_jwe';

/** Line item for cart / cart_jwe login — replaces user cart server-side. */
export interface CartLoginItem {
  merchandiseId: string;
  quantity: number;
}

/** Returns true when login creates a fresh cart from supplied cart_items. */
export function isCartLoginType(loginType: LoginType): boolean {
  return loginType === 'cart' || loginType === 'cart_jwe';
}

/** Input for loginWithKwikpass service call. */
export interface KwikpassLoginInput {
  gokwik: GokwikPayload;
  deviceInfo: DeviceInfo;
  loginType: LoginType;
  cartId?: string;
  cartItems?: CartLoginItem[];
  couponCodes?: string[];
}

/** Input for logoutUser service call. */
export interface LogoutInput {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface SessionApiResponse {
  user: AuthUser;
  claims: SessionClaims;
}

/** Auth context value exposed by AuthProvider. */
export interface AuthContextValue {
  session: AuthSession | null;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginStatus: LoginStatus;
  loginError: string | null;
  error: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  startLogin: () => void;
  dismissLoginStatus: () => void;
  /** Marks the login flow as timed out and shows retry UI in the overlay. */
  expireLoginFlow: () => void;
  retryLogin: () => void;
  logout: () => Promise<void>;
  guardAction: (action: () => void, options?: { loginType?: LoginType; actionId?: string }) => void;
  guardNavigation: (path: string) => void;
  guardModal: (open: () => void, options?: { modalId?: string; loginType?: LoginType }) => void;
  guardApi: <T>(
    fn: () => Promise<T>,
    options?: { apiId?: string; loginType?: LoginType },
  ) => Promise<T>;
  /** Merges profile fields into the client session and localStorage auth user snapshot. */
  patchSessionUser: (
    updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'phoneNumber'>>,
  ) => void;
}
