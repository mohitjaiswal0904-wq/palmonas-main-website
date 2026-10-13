/** @jest-environment node */

import { NextRequest } from 'next/server';

import { AUTH_TOKEN_KEY } from '@/lib/cookies/constants';
import { middleware } from '@/middleware';

function encodeJwtPayload(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.sig`;
}

function requestWithCookie(path: string, token?: string, host = 'palmonas.ae'): NextRequest {
  const req = new NextRequest(`https://${host}${path}`, {
    headers: { host },
  });
  if (token) {
    req.cookies.set(AUTH_TOKEN_KEY, token);
  }
  return req;
}

describe('middleware auth', () => {
  const guestToken = encodeJwtPayload({
    user_id: 'g1',
    session_id: 's1',
    is_guest: true,
    exp: 9999999999,
    iat: 1,
    type: 'access',
  });

  const authedToken = encodeJwtPayload({
    user_id: 'u1',
    session_id: 's2',
    is_guest: false,
    exp: 9999999999,
    iat: 1,
    type: 'access',
  });

  it('allows public routes without token', () => {
    const response = middleware(requestWithCookie('/'));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
  });

  it('allows protected route with authenticated token', () => {
    const response = middleware(requestWithCookie('/checkout', authedToken));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects protected account route without token', () => {
    const response = middleware(requestWithCookie('/account'));
    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('login=1');
    expect(location).toContain('redirect=%2Faccount');
  });

  it('redirects protected route with guest token', () => {
    const response = middleware(requestWithCookie('/account/profile', guestToken));
    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('login=1');
    expect(location).toContain('redirect=%2Faccount%2Fprofile');
  });

  it('redirects account hub with guest token', () => {
    const response = middleware(requestWithCookie('/account', guestToken));
    expect(response.status).toBe(307);
    const location = response.headers.get('location') ?? '';
    expect(location).toContain('login=1');
    expect(location).toContain('redirect=%2Faccount');
  });
});

describe('middleware shop-host robots', () => {
  it('sets X-Robots-Tag noindex on shop.palmonas.com', () => {
    const response = middleware(
      requestWithCookie('/collections/rings', undefined, 'shop.palmonas.com'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
  });

  it('sets X-Robots-Tag noindex on palmonas.myshopify.com', () => {
    const response = middleware(requestWithCookie('/', undefined, 'palmonas.myshopify.com'));
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, follow');
  });

  it('does not set X-Robots-Tag on the primary host', () => {
    const response = middleware(requestWithCookie('/', undefined, 'palmonas.com'));
    expect(response.headers.get('X-Robots-Tag')).toBeNull();
  });
});
