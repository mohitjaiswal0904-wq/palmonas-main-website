import * as authClient from '@/lib/auth/auth.client';
import * as authService from '@/services/auth/auth.service';
import {
  bootstrapAuthSession,
  clearSession,
  completeKwikpassLogin,
  completeMockLogin,
  fetchSession,
  hydrateSessionFromStorage,
  logoutAndResetSession,
  persistAuthSnapshot,
  persistSession,
  recoverAuthSession,
  refreshAuthSession,
  restoreGuestSession,
  syncSessionFromStorage,
} from '@/repositories/auth/auth.repository';

jest.mock('@/lib/auth/auth.client', () => ({
  ...jest.requireActual('@/lib/auth/auth.client'),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
  clearAuthStorage: jest.fn(),
  wasAuthenticatedSession: jest.fn(),
  hasStoredCredentials: jest.fn(),
  getStoredAuthUser: jest.fn(),
  persistAuthUser: jest.fn(),
  getWebDeviceInfo: () => ({
    deviceType: 'web',
    deviceId: 'dev-1',
    deviceName: 'Chrome',
    fcmToken: null,
  }),
}));
jest.mock('@/services/auth/auth.service');

const mockClearLocalCartState = jest.fn();
jest.mock('@/lib/cart/clear-local-cart-state', () => ({
  clearLocalCartState: () => mockClearLocalCartState(),
}));

const mockTokenStorage = authClient as jest.Mocked<typeof authClient>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

function makeAccessToken(claims: Record<string, unknown>): string {
  const payload = {
    user_id: 'user-1',
    session_id: 'sess-1',
    is_guest: false,
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: 1000,
    type: 'access',
    ...claims,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.sig`;
}

const mockUser = {
  id: 'user-1',
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  phoneNumber: '999',
  profilePicture: null,
  gender: 'prefer-not-to-say',
  isGuest: false,
};

const mockTokens = {
  accessToken: makeAccessToken({}),
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  refreshTokenExpiresIn: 7200,
};

describe('auth.repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authClient.setAuthBootstrapInFlight(false);
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(false);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(null);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.hasStoredCredentials.mockImplementation(
      () =>
        Boolean(mockTokenStorage.getAccessToken() || mockTokenStorage.getRefreshToken()),
    );
  });

  it('persistSession delegates to setTokens', () => {
    persistSession(mockTokens);
    expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('fetchSession returns null when no access token', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    await expect(fetchSession()).resolves.toBeNull();
  });

  it('fetchSession hydrates from validate API', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const session = await fetchSession();
    expect(session?.user.id).toBe('user-1');
    expect(session?.claims.sessionId).toBe('sess-1');
  });

  it('fetchSession falls back to JWT claims when validate fails', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockRejectedValue(new Error('network'));

    const session = await fetchSession();
    expect(session?.user.isGuest).toBe(false);
    expect(session?.claims.userId).toBe('user-1');
  });

  it('bootstrapAuthSession returns existing session when valid', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const result = await bootstrapAuthSession();
    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.session.user.id).toBe('user-1');
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('bootstrapAuthSession reuses session when JWT omits type claim', async () => {
    const tokenWithoutType = makeAccessToken({ type: undefined });
    mockTokenStorage.getAccessToken.mockReturnValue(tokenWithoutType);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const result = await bootstrapAuthSession();
    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.session.user.id).toBe('user-1');
  });

  it('bootstrapAuthSession skips guest-login on second call with same valid cookie', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    await bootstrapAuthSession();
    await bootstrapAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
  });

  it('bootstrapAuthSession creates guest on cold start only', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(null);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });

    const result = await bootstrapAuthSession();
    expect(mockTokenStorage.clearAuthStorage).not.toHaveBeenCalled();
    expect(mockAuthService.createGuestSession).toHaveBeenCalled();
    expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(mockTokens);
    expect(mockTokenStorage.persistAuthUser).toHaveBeenCalledWith({ ...mockUser, isGuest: true });
    expect(result.session.user.isGuest).toBe(true);
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('bootstrapAuthSession reuses stored user with expired access without guest-login', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: true,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.getStoredAuthUser.mockReturnValue({ ...mockUser, isGuest: true });

    const result = await bootstrapAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(mockAuthService.refreshAccessToken).not.toHaveBeenCalled();
    expect(result.session.user.isGuest).toBe(true);
    expect(result.session.user.id).toBe('user-1');
  });

  it('bootstrapAuthSession refreshes when access expired but refresh token exists', async () => {
    const expiredToken = makeAccessToken({ exp: Math.floor(Date.now() / 1000) - 10 });
    const refreshedToken = makeAccessToken({ type: undefined });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockTokenStorage.getStoredAuthUser.mockReturnValue(mockUser);
    mockAuthService.refreshAccessToken.mockImplementation(async () => {
      mockTokenStorage.getAccessToken.mockReturnValue(refreshedToken);
      return {
        ...mockTokens,
        accessToken: refreshedToken,
      };
    });

    const result = await bootstrapAuthSession();

    expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith('refresh');
    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.session.user.id).toBe('user-1');
  });

  it('bootstrapAuthSession refreshes when only refresh cookie exists', async () => {
    const refreshedToken = makeAccessToken({ type: undefined });
    mockTokenStorage.hasStoredCredentials.mockReturnValue(true);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockImplementation(async () => {
      mockTokenStorage.getAccessToken.mockReturnValue(refreshedToken);
      return {
        ...mockTokens,
        accessToken: refreshedToken,
      };
    });

    const result = await bootstrapAuthSession();

    expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith('refresh');
    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.session.user.id).toBe('user-1');
  });

  it('bootstrapAuthSession deduplicates concurrent in-flight bootstraps', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockAuthService.createGuestSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                tokens: mockTokens,
                user: { ...mockUser, isGuest: true },
              }),
            30,
          );
        }),
    );
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const [first, second] = await Promise.all([
      bootstrapAuthSession(),
      bootstrapAuthSession(),
    ]);

    expect(mockAuthService.createGuestSession).toHaveBeenCalledTimes(1);
    expect(first.session.user.isGuest).toBe(true);
    expect(second.session.user.isGuest).toBe(true);
  });

  it('completeKwikpassLogin persists tokens and returns session', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const session = await completeKwikpassLogin('kp-token');
    expect(mockAuthService.loginWithKwikpass).toHaveBeenCalled();
    expect(session.user.id).toBe('user-1');
  });

  it('logoutAndResetSession clears local auth before server revoke and bootstraps guest', async () => {
    const callOrder: string[] = [];
    mockTokenStorage.getAccessToken
      .mockReturnValueOnce(mockTokens.accessToken)
      .mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockTokenStorage.clearAuthStorage.mockImplementation(() => {
      callOrder.push('clear');
    });
    mockAuthService.logoutUser.mockImplementation(async () => {
      callOrder.push('logout');
    });
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: { ...mockTokens, accessToken: makeAccessToken({ is_guest: true }) },
      user: { ...mockUser, isGuest: true },
    });

    const session = await logoutAndResetSession();
    expect(callOrder).toEqual(['clear', 'logout']);
    expect(mockClearLocalCartState).toHaveBeenCalledTimes(1);
    expect(mockAuthService.logoutUser).toHaveBeenCalled();
    expect(mockTokenStorage.clearAuthStorage).toHaveBeenCalled();
    expect(mockAuthService.validateAccessToken).not.toHaveBeenCalled();
    expect(session.user.isGuest).toBe(true);
  });

  it('refreshAuthSession refreshes tokens when refresh cookie exists', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockResolvedValue(mockTokens);
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const result = await refreshAuthSession();
    expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith('refresh');
    expect(result.session.user.id).toBe('user-1');
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('fetchSession returns null for expired access token', async () => {
    const expiredToken = makeAccessToken({ exp: Math.floor(Date.now() / 1000) - 10 });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);

    await expect(fetchSession()).resolves.toBeNull();
  });

  it('completeKwikpassLogin falls back to JWT session when fetchSession returns null', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);

    const session = await completeKwikpassLogin('kp-token');
    expect(session.user.id).toBe('user-1');
  });

  it('completeKwikpassLogin forwards optional phone and cart id to login payload', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    await completeKwikpassLogin('kp-token', 'checkout', {
      phone: '+919999999999',
      cartId: 'gid://shopify/Cart/abc',
    });

    expect(mockAuthService.loginWithKwikpass).toHaveBeenCalledWith(
      expect.objectContaining({
        loginType: 'checkout',
        cartId: 'gid://shopify/Cart/abc',
      }),
    );
  });

  it('logoutAndResetSession still bootstraps guest when logout API fails', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.logoutUser.mockRejectedValue(new Error('api fail'));
    mockTokenStorage.getAccessToken
      .mockReturnValueOnce(mockTokens.accessToken)
      .mockReturnValue(undefined);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const session = await logoutAndResetSession();
    expect(session.user.isGuest).toBe(true);
  });

  it('refreshAuthSession bootstraps guest when no refresh token and no credentials', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(false);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.hasStoredCredentials.mockReturnValue(false);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const result = await refreshAuthSession();
    expect(mockTokenStorage.clearAuthStorage).not.toHaveBeenCalled();
    expect(mockAuthService.createGuestSession).toHaveBeenCalled();
    expect(result.session.user.isGuest).toBe(true);
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('refreshAuthSession reuses stale session when refresh fails but access cookie exists', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: true,
    });
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));

    const result = await refreshAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.demotedFromAuthenticated).toBe(false);
    expect(result.session.user.id).toBe('user-1');
  });

  it('refreshAuthSession creates guest without clearing when refresh fails and credentials remain', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(true);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.hasStoredCredentials.mockReturnValue(true);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const result = await refreshAuthSession();
    expect(mockTokenStorage.clearAuthStorage).not.toHaveBeenCalled();
    expect(mockAuthService.createGuestSession).toHaveBeenCalled();
    expect(result.session.user.isGuest).toBe(true);
    expect(result.demotedFromAuthenticated).toBe(true);
  });

  it('refreshAuthSession does not flag demotion for guest refresh failure', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(false);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const result = await refreshAuthSession();
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('bootstrapAuthSession reuses stale session from JWT when authed refresh fails', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: false,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockTokenStorage.getStoredAuthUser.mockReturnValue(null);
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));

    const result = await bootstrapAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.demotedFromAuthenticated).toBe(false);
    expect(result.session.user.id).toBe('user-1');
  });

  it('bootstrapAuthSession reuses stale session when authed refresh fails with stored user', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: false,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockTokenStorage.getStoredAuthUser.mockReturnValue(mockUser);
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));

    const result = await bootstrapAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.demotedFromAuthenticated).toBe(false);
    expect(result.session.user.id).toBe('user-1');
  });

  it('refreshAuthSession reuses stale session from expired access cookie without refresh token', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: false,
    });
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(null);

    const result = await refreshAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(result.demotedFromAuthenticated).toBe(false);
    expect(result.session.user.id).toBe('user-1');
  });

  it('fetchSession returns null for non-access token type', async () => {
    const refreshToken = makeAccessToken({ type: 'refresh' });
    mockTokenStorage.getAccessToken.mockReturnValue(refreshToken);

    await expect(fetchSession()).resolves.toBeNull();
  });

  it('fetchSession returns null for malformed jwt', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue('not-a-jwt');

    await expect(fetchSession()).resolves.toBeNull();
  });

  it('bootstrapAuthSession falls back to JWT when fetchSession fails after guest create', async () => {
    mockTokenStorage.getAccessToken
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });

    const result = await bootstrapAuthSession();
    expect(result.session.user.isGuest).toBe(true);
    expect(result.session.claims.userId).toBe('user-1');
  });

  it('logoutAndResetSession skips API when tokens are missing', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockAuthService.validateAccessToken.mockResolvedValue({ ...mockUser, isGuest: true });

    const session = await logoutAndResetSession();
    expect(mockAuthService.logoutUser).not.toHaveBeenCalled();
    expect(session.user.isGuest).toBe(true);
  });

  it('syncSessionFromStorage hydrates without validate API', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);

    const session = await syncSessionFromStorage();
    expect(session?.user.id).toBe('user-1');
    expect(mockAuthService.validateAccessToken).not.toHaveBeenCalled();
  });

  it('refreshAuthSession persists user after successful refresh', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockResolvedValue(mockTokens);
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(mockUser);

    const result = await refreshAuthSession();

    expect(mockTokenStorage.persistAuthUser).toHaveBeenCalledWith(mockUser);
    expect(result.demotedFromAuthenticated).toBe(false);
    expect(result.session.user.id).toBe('user-1');
  });

  it('refreshAuthSession falls back to JWT when fetchSession fails after refresh', async () => {
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockResolvedValue(mockTokens);
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);

    const result = await refreshAuthSession();
    expect(result.session.user.id).toBe('user-1');
  });

  it('recoverAuthSession reuses stale session when refresh fails after 401 invalidation', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
      is_guest: false,
    });
    mockTokenStorage.hasStoredCredentials.mockReturnValue(true);
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh');
    mockAuthService.refreshAccessToken.mockRejectedValue(new Error('expired'));

    const result = await recoverAuthSession();

    expect(mockAuthService.createGuestSession).not.toHaveBeenCalled();
    expect(mockTokenStorage.clearAuthStorage).not.toHaveBeenCalled();
    expect(result.session.user.id).toBe('user-1');
    expect(result.demotedFromAuthenticated).toBe(false);
  });

  it('recoverAuthSession deduplicates concurrent recovery calls', async () => {
    mockTokenStorage.hasStoredCredentials.mockReturnValue(true);
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const [first, second] = await Promise.all([recoverAuthSession(), recoverAuthSession()]);

    expect(first.session.user.id).toBe('user-1');
    expect(second.session.user.id).toBe('user-1');
  });

  it('recoverAuthSession creates guest without clearing when restore fails', async () => {
    mockTokenStorage.hasStoredCredentials.mockReturnValue(true);
    mockTokenStorage.getAccessToken.mockReturnValue('not-a-jwt');
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(false);
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: mockTokens,
      user: { ...mockUser, isGuest: true },
    });

    const result = await recoverAuthSession();

    expect(mockTokenStorage.clearAuthStorage).not.toHaveBeenCalled();
    expect(mockAuthService.createGuestSession).toHaveBeenCalled();
    expect(result.session.user.isGuest).toBe(true);
  });

  it('completeMockLogin forwards cart id when provided', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    await completeMockLogin('checkout', { cartId: 'gid://shopify/Cart/guest-1' });

    expect(mockAuthService.loginWithKwikpass).toHaveBeenCalledWith(
      expect.objectContaining({
        loginType: 'checkout',
        cartId: 'gid://shopify/Cart/guest-1',
      }),
    );
  });

  it('completeMockLogin forwards cart login coupon codes when provided', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    await completeMockLogin('cart', {
      cartItems: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 }],
      couponCodes: ['SAVE10'],
    });

    expect(mockAuthService.loginWithKwikpass).toHaveBeenCalledWith(
      expect.objectContaining({
        loginType: 'cart',
        cartItems: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 }],
        couponCodes: ['SAVE10'],
      }),
    );
  });

  it('completeMockLogin persists session from fetchSession', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const session = await completeMockLogin('checkout');

    expect(mockAuthService.loginWithKwikpass).toHaveBeenCalled();
    expect(session.user.id).toBe('user-1');
  });

  it('completeMockLogin builds session from JWT when fetchSession returns null', async () => {
    mockAuthService.loginWithKwikpass.mockResolvedValue({
      tokens: mockTokens,
      user: mockUser,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);

    const session = await completeMockLogin('normal');

    expect(session.user.id).toBe('user-1');
  });

  it('hydrateSessionFromStorage validates token and keeps stored user when validate fails', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(mockUser);
    mockAuthService.validateAccessToken.mockRejectedValue(new Error('offline'));

    const session = await hydrateSessionFromStorage({ validate: true });

    expect(session?.user.id).toBe('user-1');
    expect(mockTokenStorage.persistAuthUser).not.toHaveBeenCalled();
  });

  it('hydrateSessionFromStorage persists user after successful validate', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockAuthService.validateAccessToken.mockResolvedValue(mockUser);

    const session = await hydrateSessionFromStorage({ validate: true });

    expect(session?.user.id).toBe('user-1');
    expect(mockTokenStorage.persistAuthUser).toHaveBeenCalledWith(mockUser);
  });

  it('hydrateSessionFromStorage accepts expired token when allowExpired is true', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);

    const session = await hydrateSessionFromStorage({ validate: false, allowExpired: true });

    expect(session?.user.id).toBe('user-1');
  });

  it('hydrateSessionFromStorage skips validate API when allowExpired is true', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);

    await hydrateSessionFromStorage({ validate: true, allowExpired: true });

    expect(mockAuthService.validateAccessToken).not.toHaveBeenCalled();
  });

  it('hydrateSessionFromStorage builds user from claims when stored profile is missing', async () => {
    mockTokenStorage.getAccessToken.mockReturnValue(mockTokens.accessToken);
    mockTokenStorage.getStoredAuthUser.mockReturnValue(null);

    const session = await hydrateSessionFromStorage({ validate: false });

    expect(session?.user.id).toBe('user-1');
    expect(session?.user.isGuest).toBe(false);
  });

  it('hydrateSessionFromStorage returns null for expired token without allowExpired', async () => {
    const expiredToken = makeAccessToken({
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    mockTokenStorage.getAccessToken.mockReturnValue(expiredToken);

    await expect(
      hydrateSessionFromStorage({ validate: false, allowExpired: false }),
    ).resolves.toBeNull();
  });

  it('clearSession clears auth storage', () => {
    clearSession();
    expect(mockTokenStorage.clearAuthStorage).toHaveBeenCalled();
  });

  it('persistAuthSnapshot stores tokens and user profile', () => {
    persistAuthSnapshot(mockTokens, mockUser);
    expect(mockTokenStorage.setTokens).toHaveBeenCalledWith(mockTokens);
    expect(mockTokenStorage.persistAuthUser).toHaveBeenCalledWith(mockUser);
  });

  it('persistAuthSnapshot syncs GoKwik identity for authenticated users', () => {
    window.localStorage.clear();
    persistAuthSnapshot(mockTokens, {
      ...mockUser,
      isGuest: false,
      phoneNumber: '+919833290022',
    });
    expect(window.localStorage.getItem('kp-login-no')).toBe('9833290022');
  });

  it('restoreGuestSession clears session and creates guest with demotion flag', async () => {
    mockTokenStorage.wasAuthenticatedSession.mockReturnValue(true);
    const guestTokens = {
      ...mockTokens,
      accessToken: makeAccessToken({ is_guest: true }),
    };
    mockAuthService.createGuestSession.mockResolvedValue({
      tokens: guestTokens,
      user: { ...mockUser, isGuest: true },
    });
    mockTokenStorage.getAccessToken.mockReturnValue(guestTokens.accessToken);

    const result = await restoreGuestSession();

    expect(mockTokenStorage.clearAuthStorage).toHaveBeenCalled();
    expect(result.session.user.isGuest).toBe(true);
    expect(result.demotedFromAuthenticated).toBe(true);
  });
});
