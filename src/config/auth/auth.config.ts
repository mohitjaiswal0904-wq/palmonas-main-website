import rawConfig from '@/config/auth/auth.config.json';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/cookies/constants';

export { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY };

type AuthConfigJson = typeof rawConfig;

export const authConfig = rawConfig as AuthConfigJson;

export const authMessages = authConfig.messages;

export const AUTH_PROTECTED = authConfig.protected;

export const DEVICE_ID_STORAGE_KEY = authConfig.constants.deviceIdStorageKey;

export const AUTH_USER_STORAGE_KEY = authConfig.constants.authUserStorageKey;

export const TOKEN_REFRESH_THRESHOLD_SECONDS = authConfig.constants.tokenRefreshThresholdSeconds;

/** Max time login overlay stays in loading/opening/syncing before timing out. */
export const LOGIN_OVERLAY_TIMEOUT_MS = authConfig.constants.loginOverlayTimeoutMs;

export const AUTH_REDIRECT_ALLOWLIST = authConfig.redirectAllowlist;

/** Account/auth routes that stay accessible to guests (login, register, info pages). */
export const PUBLIC_ROUTES = authConfig.publicRoutes;

export type AuthRequirement = 'authenticated' | 'guest';

export type AuthProtectedActionId = keyof AuthConfigJson['protected']['actions'];

export type AuthProtectedModalId = keyof AuthConfigJson['protected']['modals'];

export type AuthProtectedApiId = keyof AuthConfigJson['protected']['apis'];

export type AuthGuardKind = 'route' | 'action' | 'modal' | 'api';

const GOKWIK_ORIGINS = authConfig.cspOrigins.gokwik;

const SHOPIFY_ORIGINS = authConfig.cspOrigins.shopify;

const POSTAL_PINCODE_ORIGINS = authConfig.cspOrigins.postalPincode;

const CSP_KW = authConfig.cspKeywords;

/** Content-Security-Policy directives for KwikPass + Shopify integration. */
export const CSP_DIRECTIVES = {
  'default-src': [CSP_KW.self],
  'script-src': [CSP_KW.self, CSP_KW.unsafeInline, ...GOKWIK_ORIGINS],
  'connect-src': [
    CSP_KW.self,
    'https://staging.palmonas.ae',
    ...GOKWIK_ORIGINS,
    ...SHOPIFY_ORIGINS,
    ...POSTAL_PINCODE_ORIGINS,
  ],
  'frame-src': [CSP_KW.self, ...GOKWIK_ORIGINS],
  'img-src': [CSP_KW.self, 'data:', 'blob:', ...GOKWIK_ORIGINS, ...SHOPIFY_ORIGINS],
  'style-src': [CSP_KW.self, CSP_KW.unsafeInline, ...GOKWIK_ORIGINS],
  'font-src': [CSP_KW.self, 'data:', ...GOKWIK_ORIGINS],
} as const;

/** Permissive CSP for local development (KwikPass plugin debugging on localhost). */
export const CSP_DIRECTIVES_DEVELOPMENT = {
  'default-src': [CSP_KW.self, 'https:', 'http:', 'data:', 'blob:'],
  'script-src': [CSP_KW.self, CSP_KW.unsafeInline, CSP_KW.unsafeEval, 'https:', 'http:'],
  'connect-src': [CSP_KW.self, 'https:', 'http:', 'ws:', 'wss:'],
  'frame-src': [CSP_KW.self, 'https:', 'http:'],
  'img-src': [CSP_KW.self, 'data:', 'blob:', 'https:', 'http:'],
  'style-src': [CSP_KW.self, CSP_KW.unsafeInline, 'https:', 'http:'],
  'font-src': [CSP_KW.self, 'data:', 'https:', 'http:'],
} as const;

/**
 * Validates redirect target against allowlist.
 *
 * @param redirect - Raw redirect query param.
 * @returns Safe path or null if invalid.
 */
export function sanitizeAuthRedirect(redirect: string | null | undefined): string | null {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return null;
  }
  const path = redirect.split('?')[0] ?? redirect;
  const allowed = AUTH_REDIRECT_ALLOWLIST.some(
    (entry) => path === entry || path.startsWith(`${entry}/`),
  );
  return allowed ? redirect : null;
}

/**
 * Builds CSP header value from directives map.
 *
 * @param development - When true, use permissive directives for localhost.
 * @returns CSP header string for middleware.
 */
export function buildContentSecurityPolicy(development = false): string {
  const directives = development ? CSP_DIRECTIVES_DEVELOPMENT : CSP_DIRECTIVES;
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Resolves whether a pathname requires an authenticated (non-guest) user.
 *
 * @param pathname - Current route pathname.
 * @returns True when route requires logged-in user.
 */
export function isProtectedRoute(pathname: string): boolean {
  if (isPublicRoute(pathname)) {
    return false;
  }

  return AUTH_PROTECTED.routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Resolves whether a pathname is publicly accessible (guests allowed).
 *
 * @param pathname - Current route pathname.
 * @returns True when the route is in the public allowlist (exact or nested).
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Resolves auth requirement for a registered action id.
 *
 * @param actionId - Action key from AUTH_PROTECTED.actions.
 * @returns Requirement level or undefined if action is not registered.
 */
export function getActionAuthRequirement(actionId: AuthProtectedActionId): AuthRequirement {
  return AUTH_PROTECTED.actions[actionId] as AuthRequirement;
}

/**
 * Resolves auth requirement for a registered modal id.
 *
 * @param modalId - Modal key from AUTH_PROTECTED.modals.
 * @returns Requirement level or undefined if modal is not registered.
 */
export function getModalAuthRequirement(modalId: AuthProtectedModalId): AuthRequirement {
  return AUTH_PROTECTED.modals[modalId] as AuthRequirement;
}

/**
 * Resolves auth requirement for a registered API id.
 *
 * @param apiId - API key from AUTH_PROTECTED.apis.
 * @returns Requirement level or undefined if API is not registered.
 */
export function getApiAuthRequirement(apiId: AuthProtectedApiId): AuthRequirement {
  return AUTH_PROTECTED.apis[apiId] as AuthRequirement;
}

/**
 * Looks up auth requirement by guard kind and registry id.
 *
 * @param kind - Guard surface (route, action, modal, api).
 * @param id - Registry key for the surface.
 * @returns Requirement level or undefined when not registered.
 */
export function getAuthRequirement(kind: AuthGuardKind, id: string): AuthRequirement | undefined {
  switch (kind) {
    case 'action':
      return id in AUTH_PROTECTED.actions
        ? (AUTH_PROTECTED.actions[id as AuthProtectedActionId] as AuthRequirement)
        : undefined;
    case 'modal':
      return id in AUTH_PROTECTED.modals
        ? (AUTH_PROTECTED.modals[id as AuthProtectedModalId] as AuthRequirement)
        : undefined;
    case 'api':
      return id in AUTH_PROTECTED.apis
        ? (AUTH_PROTECTED.apis[id as AuthProtectedApiId] as AuthRequirement)
        : undefined;
    case 'route':
      return isProtectedRoute(id) ? 'authenticated' : undefined;
    default:
      return undefined;
  }
}

/**
 * Static Next.js middleware matcher — must be a compile-time literal array.
 * Keep in sync with AUTH_PROTECTED.routes (validated in auth.config tests).
 */
export const MIDDLEWARE_MATCHER = [
  '/checkout/:path*',
  '/account/orders/:path*',
  '/account/profile/:path*',
] as const;

/**
 * Builds Next.js middleware matcher patterns from protected routes config.
 *
 * @returns Matcher array synced with AUTH_PROTECTED.routes.
 */
export function getMiddlewareMatcherFromConfig(): string[] {
  return [...MIDDLEWARE_MATCHER];
}

/**
 * Builds login redirect URL with safe redirect param.
 *
 * @param pathname - Protected path user attempted to access.
 * @param baseUrl - Request origin URL string.
 * @returns Login URL with `login=1` and `redirect` query params.
 */
export function buildLoginRedirectUrl(pathname: string, baseUrl: string): URL {
  const loginUrl = new URL('/', baseUrl);
  loginUrl.searchParams.set('login', '1');
  loginUrl.searchParams.set('redirect', pathname);
  return loginUrl;
}
