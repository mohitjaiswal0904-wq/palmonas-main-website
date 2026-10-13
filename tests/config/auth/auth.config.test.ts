import {
  AUTH_PROTECTED,
  authConfig,
  buildContentSecurityPolicy,
  buildLoginRedirectUrl,
  getActionAuthRequirement,
  getApiAuthRequirement,
  getAuthRequirement,
  getMiddlewareMatcherFromConfig,
  MIDDLEWARE_MATCHER,
  getModalAuthRequirement,
  isProtectedRoute,
  sanitizeAuthRedirect,
} from '@/config/auth/auth.config';
import {
  buildMockGokwikPayload,
  generateMockPassword,
  getMockAuthCredentials,
  getMockAuthKpToken,
  getMockAuthOtp,
  getMockAuthUiDelayMs,
  isMockAuthEnabled,
} from '@/config/auth/mock-auth.config';

describe('auth.config security', () => {
  it('loads JSON registry exports', () => {
    expect(authConfig.protected.routes.length).toBeGreaterThan(0);
    expect(AUTH_PROTECTED.routes).toContain('/checkout');
  });

  it('allows listed redirect paths', () => {
    expect(sanitizeAuthRedirect('/cart')).toBe('/cart');
    expect(sanitizeAuthRedirect('/account')).toBe('/account');
    expect(sanitizeAuthRedirect('/account/profile')).toBe('/account/profile');
  });

  it('rejects external and protocol-relative redirects', () => {
    expect(sanitizeAuthRedirect('https://evil.com')).toBeNull();
    expect(sanitizeAuthRedirect('//evil.com')).toBeNull();
    expect(sanitizeAuthRedirect('/unknown-path')).toBeNull();
  });

  it('includes postal pincode API in production CSP', () => {
    const csp = buildContentSecurityPolicy(false);
    expect(csp).toContain('https://api.postalpincode.in');
  });

  it('includes KwikPass and Shopify origins in production CSP', () => {
    const csp = buildContentSecurityPolicy(false);
    expect(csp).toContain('https://api.gokwik.co');
    expect(csp).toContain('https://gkx.gokwik.co');
    expect(csp).toContain('https://api-gw-v4.dev.gokwik.io');
    expect(csp).toContain('https://palmonas.myshopify.com');
    expect(csp).toContain('https://cdn.shopify.com');
  });

  it('uses permissive connect-src in development CSP', () => {
    const csp = buildContentSecurityPolicy(true);
    expect(csp).toContain('connect-src \'self\' https: http: ws: wss:');
  });
});

describe('auth.config protected registry', () => {
  it('detects protected routes', () => {
    expect(isProtectedRoute('/checkout')).toBe(true);
    expect(isProtectedRoute('/account')).toBe(true);
    expect(isProtectedRoute('/account/orders')).toBe(true);
    expect(isProtectedRoute('/account/login')).toBe(false);
    expect(isProtectedRoute('/')).toBe(false);
  });

  it('rejects null and empty redirect values', () => {
    expect(sanitizeAuthRedirect(null)).toBeNull();
    expect(sanitizeAuthRedirect('')).toBeNull();
  });

  it('allows subpaths of allowlisted routes', () => {
    expect(sanitizeAuthRedirect('/cart/extra')).toBe('/cart/extra');
  });

  it('allows allowlisted paths with query strings', () => {
    expect(sanitizeAuthRedirect('/cart?coupon=SAVE10')).toBe('/cart?coupon=SAVE10');
  });

  it('builds production CSP by default', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain('https://api.gokwik.co');
    expect(csp).not.toContain('connect-src \'self\' https: http: ws: wss:');
  });

  it('returns undefined for unknown action ids', () => {
    expect(getAuthRequirement('action', 'unknown.action')).toBeUndefined();
    expect(getAuthRequirement('modal', 'unknown.modal')).toBeUndefined();
    expect(getAuthRequirement('api', 'unknown.api')).toBeUndefined();
  });

  it('returns undefined for unknown paths via route kind lookup', () => {
    expect(getAuthRequirement('route', '/')).toBeUndefined();
  });

  it('returns action auth requirement', () => {
    expect(getActionAuthRequirement('reviews.write')).toBe('authenticated');
    expect(getAuthRequirement('action', 'cart.checkout')).toBeUndefined();
  });

  it('returns modal auth requirement', () => {
    expect(getModalAuthRequirement('checkout.address')).toBe('authenticated');
  });

  it('returns api auth requirement', () => {
    expect(getApiAuthRequirement('wishlist.add')).toBe('authenticated');
    expect(getAuthRequirement('api', 'cart.addItem')).toBeUndefined();
  });

  it('returns authenticated for protected route lookup', () => {
    expect(getAuthRequirement('route', '/checkout')).toBe('authenticated');
  });

  it('returns registered modal and api requirements via lookup helper', () => {
    expect(getAuthRequirement('modal', 'checkout.address')).toBe('authenticated');
    expect(getAuthRequirement('api', 'wishlist.add')).toBe('authenticated');
    expect(getAuthRequirement('api', 'cart.addItem')).toBeUndefined();
  });

  it('matches protected route prefixes', () => {
    expect(isProtectedRoute('/account/orders/123')).toBe(true);
  });

  it('builds middleware matcher from protected routes', () => {
    expect(getMiddlewareMatcherFromConfig()).toEqual([...MIDDLEWARE_MATCHER]);
    expect(getMiddlewareMatcherFromConfig()).toEqual([
      '/checkout/:path*',
      '/account/orders/:path*',
      '/account/profile/:path*',
    ]);
  });

  it('builds login redirect URL with safe params', () => {
    const url = buildLoginRedirectUrl('/checkout', 'https://palmonas.ae');
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('login')).toBe('1');
    expect(url.searchParams.get('redirect')).toBe('/checkout');
  });

  it('returns undefined for unsupported guard kinds', () => {
    expect(getAuthRequirement('unknown' as 'route', '/checkout')).toBeUndefined();
  });
});

describe('auth.config exports', () => {
  it('exposes registry constants from JSON config', async () => {
    const config = await import('@/config/auth/auth.config');
    expect(config.DEVICE_ID_STORAGE_KEY).toBeTruthy();
    expect(config.TOKEN_REFRESH_THRESHOLD_SECONDS).toBeGreaterThan(0);
    expect(config.AUTH_REDIRECT_ALLOWLIST.length).toBeGreaterThan(0);
    expect(config.authMessages.loginCta).toBeTruthy();
    expect(config.CSP_DIRECTIVES['default-src']).toContain('\'self\'');
    expect(config.CSP_DIRECTIVES_DEVELOPMENT['connect-src']).toContain('ws:');
    expect(config.AUTH_TOKEN_KEY).toBe('auth_token');
    expect(config.REFRESH_TOKEN_KEY).toBe('refresh_token');
    expect(config.AUTH_USER_STORAGE_KEY).toBe('palmonas_auth_user');
    expect(config.LOGIN_OVERLAY_TIMEOUT_MS).toBeGreaterThan(0);
    expect(config.authMessages.errors.loginTimedOut).toBeTruthy();
  });
});

describe('mock-auth.config', () => {
  it('reads mock auth enabled from NEXT_PUBLIC_MOCK_AUTH_ENABLED', () => {
    const previous = process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED;
    process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED = 'true';
    expect(isMockAuthEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED = 'false';
    expect(isMockAuthEnabled()).toBe(false);

    delete process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED;
    expect(isMockAuthEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED = previous;
  });

  it('exposes mock auth settings from JSON', () => {
    expect(getMockAuthOtp()).toBe('1111');
    expect(getMockAuthUiDelayMs()).toBe(1000);
  });

  it('returns credentials from config fallback', () => {
    const credentials = getMockAuthCredentials();
    expect(credentials.phone).toBeTruthy();
    expect(credentials.email).toBeTruthy();
    expect(credentials.shopifyCustomerId).toBeTruthy();
  });

  it('prefers NEXT_PUBLIC mock auth env vars when set', () => {
    const previous = {
      phone: process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE,
      email: process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL,
      shopifyCustomerId: process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID,
    };

    process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE = '8888888888';
    process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL = 'mock@example.com';
    process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID = 'shopify-mock-1';

    expect(getMockAuthCredentials()).toEqual({
      phone: '8888888888',
      email: 'mock@example.com',
      shopifyCustomerId: 'shopify-mock-1',
    });

    process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE = previous.phone;
    process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL = previous.email;
    process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID = previous.shopifyCustomerId;
  });

  it('throws when mock auth credentials are incomplete', () => {
    const previous = {
      phone: process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE,
      email: process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL,
      shopifyCustomerId: process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID,
    };

    process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE = '';
    process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL = '';
    process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID = '';

    expect(() => getMockAuthCredentials()).toThrow(/incomplete/);

    process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE = previous.phone;
    process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL = previous.email;
    process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID = previous.shopifyCustomerId;
  });

  it('generates mock password of requested length', () => {
    const password = generateMockPassword(8);
    expect(password).toHaveLength(8);
    expect(password).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('builds gokwik payload from credentials', () => {
    const payload = buildMockGokwikPayload();
    expect(payload.phone).toBeTruthy();
    expect(payload.email).toBeTruthy();
    expect(payload.password).toHaveLength(13);
    expect(payload.kpToken).toBe(getMockAuthKpToken());
    expect(payload.isNewUser).toBe(false);
  });

  it('prefers NEXT_PUBLIC mock auth kp token when set', () => {
    const previous = process.env.NEXT_PUBLIC_MOCK_AUTH_KP_TOKEN;
    process.env.NEXT_PUBLIC_MOCK_AUTH_KP_TOKEN = 'mock-kp-token-override';

    expect(getMockAuthKpToken()).toBe('mock-kp-token-override');

    process.env.NEXT_PUBLIC_MOCK_AUTH_KP_TOKEN = previous;
  });
});
