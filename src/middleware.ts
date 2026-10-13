import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { buildLoginRedirectUrl, isPublicRoute } from '@/config/auth/auth.config';
import { AUTH_TOKEN_KEY } from '@/lib/cookies/constants';
import { isShopDuplicateHost } from '@/lib/seo/shop-host-canonical';

/**
 * Returns true when the JWT access token belongs to a guest session.
 *
 * @param token - Raw JWT access token from cookies.
 */
function isGuestAccessToken(token: string): boolean {
  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return true;
    }

    const padded = segment.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      is_guest?: boolean;
    };

    return payload.is_guest === true;
  } catch {
    return true;
  }
}

/**
 * All `/account/*` routes require a logged-in user except the public allowlist.
 *
 * @param pathname - Current request pathname.
 * @returns True when the account route requires an authenticated user.
 */
function isProtectedAccountRoute(pathname: string): boolean {
  if (!pathname.startsWith('/account')) {
    return false;
  }

  return !isPublicRoute(pathname);
}

/**
 * Strips an optional port from a Host header value.
 *
 * @param hostHeader - Raw `Host` header (may include `:port`).
 */
function resolveRequestHostname(hostHeader: string | null): string {
  if (!hostHeader) {
    return '';
  }

  return hostHeader.split(':')[0]?.toLowerCase() ?? '';
}

/**
 * Marks temporary shop duplicate hosts as noindex for crawlers that skip JS.
 *
 * @param response - Outgoing middleware response.
 * @param request - Incoming request (used for Host).
 */
function applyShopHostRobotsHeader(response: NextResponse, request: NextRequest): NextResponse {
  const hostname = resolveRequestHostname(request.headers.get('host'));
  if (isShopDuplicateHost(hostname)) {
    response.headers.set('X-Robots-Tag', 'noindex, follow');
  }
  return response;
}

/**
 * Auth gate for account routes — guests and missing tokens redirect to KwikPass login.
 * Shop duplicate hosts also get `X-Robots-Tag: noindex, follow`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedAccountRoute(pathname)) {
    const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;

    if (!token || isGuestAccessToken(token)) {
      return applyShopHostRobotsHeader(
        NextResponse.redirect(buildLoginRedirectUrl(pathname, request.url)),
        request,
      );
    }
  }

  return applyShopHostRobotsHeader(NextResponse.next(), request);
}

export const config = {
  matcher: [
    /*
     * Run on pages (auth + shop-host robots). Skip Next internals and static files.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
