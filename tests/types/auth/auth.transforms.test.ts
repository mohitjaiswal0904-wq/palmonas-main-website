import {
  buildAuthSession,
  jwtClaimsToSessionClaims,
  mapKpTokenToGokwik,
  toDeviceInfoApi,
  toGokwikApi,
  transformAuthLoginResponse,
  transformAuthUser,
  transformGokwikPayload,
  transformRefreshTokens,
} from '@/types/auth/auth.transforms';

describe('auth.transforms', () => {
  it('mapKpTokenToGokwik builds gokwik with kp_token for backend decode', () => {
    expect(mapKpTokenToGokwik('kp-token-abc', '9876543210')).toEqual({
      phone: '9876543210',
      email: null,
      password: null,
      shopifyCustomerId: null,
      isNewUser: false,
      state: 'active',
      kpToken: 'kp-token-abc',
      multipassToken: null,
      customerInsights: null,
    });
  });

  it('mapKpTokenToGokwik defaults phone to empty string', () => {
    expect(mapKpTokenToGokwik('kp-token-xyz').phone).toBe('');
  });

  it('transformAuthUser maps API user fields', () => {
    expect(
      transformAuthUser({
        id: 'guest_1',
        first_name: 'Guest',
        last_name: 'User',
        email: null,
        phone_number: null,
        profile_picture: null,
        gender: 'prefer-not-to-say',
        is_guest: true,
      }),
    ).toEqual({
      id: 'guest_1',
      firstName: 'Guest',
      lastName: 'User',
      email: null,
      phoneNumber: null,
      profilePicture: null,
      gender: 'prefer-not-to-say',
      isGuest: true,
    });
  });

  it('transformAuthLoginResponse maps token envelope', () => {
    const result = transformAuthLoginResponse({
      status: 200,
      message: 'ok',
      data: {
        success: true,
        user: {
          id: '1',
          first_name: 'Jane',
          last_name: null,
          email: 'j@palmonas.com',
          phone_number: '+911',
          profile_picture: null,
          gender: 'prefer-not-to-say',
          is_guest: false,
        },
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in: 86400,
        refresh_token_expires_in: 172800,
      },
    });
    expect(result.tokens.accessToken).toBe('access');
    expect(result.user.isGuest).toBe(false);
    expect(result.cartId).toBeUndefined();
  });

  it('transformAuthLoginResponse maps cart_id when present', () => {
    const result = transformAuthLoginResponse({
      status: 200,
      message: 'ok',
      data: {
        success: true,
        user: {
          id: '1',
          first_name: 'Jane',
          last_name: null,
          email: 'j@palmonas.com',
          phone_number: '+911',
          profile_picture: null,
          gender: 'prefer-not-to-say',
          is_guest: false,
        },
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in: 86400,
        refresh_token_expires_in: 172800,
        cart_id: 'gid://shopify/Cart/abc',
      },
    });
    expect(result.cartId).toBe('gid://shopify/Cart/abc');
  });

  it('toGokwikApi serialises kp_token and optional fields', () => {
    expect(
      toGokwikApi({
        phone: '9876543210',
        email: null,
        password: null,
        shopifyCustomerId: null,
        isNewUser: false,
        state: 'active',
        kpToken: 'kp-abc',
        multipassToken: null,
        customerInsights: null,
      }),
    ).toEqual({
      phone: '9876543210',
      email: null,
      password: null,
      shopify_customer_id: null,
      is_new_user: false,
      state: 'active',
      kp_token: 'kp-abc',
      multipass_token: null,
      customer_insights: null,
    });
  });

  it('jwtClaimsToSessionClaims maps exp to expiresAt', () => {
    expect(
      jwtClaimsToSessionClaims({
        user_id: 'u1',
        session_id: 's1',
        is_guest: false,
        shopify_customer_id: 'shop-1',
        exp: 12345,
        iat: 1000,
        type: 'access',
      }),
    ).toEqual({
      userId: 'u1',
      sessionId: 's1',
      isGuest: false,
      shopifyCustomerId: 'shop-1',
      expiresAt: 12345,
    });
  });

  it('jwtClaimsToSessionClaims defaults shopify customer id to null', () => {
    expect(
      jwtClaimsToSessionClaims({
        user_id: 'u1',
        session_id: 's1',
        is_guest: true,
        exp: 1,
        iat: 1,
        type: 'access',
      }).shopifyCustomerId,
    ).toBeNull();
  });

  it('transformRefreshTokens maps refresh response', () => {
    expect(
      transformRefreshTokens({
        access_token: 'a2',
        refresh_token: 'r2',
        expires_in: 100,
        refresh_token_expires_in: 200,
      }),
    ).toEqual({
      accessToken: 'a2',
      refreshToken: 'r2',
      expiresIn: 100,
      refreshTokenExpiresIn: 200,
    });
  });

  it('transformAuthLoginResponse defaults missing expires_in', () => {
    const result = transformAuthLoginResponse({
      status: 200,
      message: 'ok',
      data: {
        success: true,
        user: {
          id: '1',
          first_name: 'Jane',
          last_name: null,
          email: 'j@palmonas.com',
          phone_number: '+911',
          profile_picture: null,
          gender: 'prefer-not-to-say',
          is_guest: false,
        },
        access_token: 'access',
        refresh_token: 'refresh',
      },
    });
    expect(result.tokens.expiresIn).toBe(86400);
    expect(result.tokens.refreshTokenExpiresIn).toBe(604800);
  });

  it('transformAuthLoginResponse accepts expires_in_seconds alias', () => {
    const result = transformAuthLoginResponse({
      status: 200,
      message: 'ok',
      data: {
        success: true,
        user: {
          id: '1',
          first_name: 'Jane',
          last_name: null,
          email: null,
          phone_number: null,
          profile_picture: null,
          gender: 'prefer-not-to-say',
          is_guest: true,
        },
        access_token: 'access',
        refresh_token: 'refresh',
        expires_in_seconds: 7200,
        refresh_token_expires_in_seconds: 14400,
      },
    });
    expect(result.tokens.expiresIn).toBe(7200);
    expect(result.tokens.refreshTokenExpiresIn).toBe(14400);
  });

  it('transformRefreshTokens accepts expires_in_seconds alias', () => {
    expect(
      transformRefreshTokens({
        access_token: 'a2',
        refresh_token: 'r2',
        expires_in_seconds: 500,
        refresh_token_expires_in_seconds: 600,
      }),
    ).toEqual({
      accessToken: 'a2',
      refreshToken: 'r2',
      expiresIn: 500,
      refreshTokenExpiresIn: 600,
    });
  });

  it('transformRefreshTokens defaults invalid expires_in', () => {
    expect(
      transformRefreshTokens({
        access_token: 'a2',
        refresh_token: 'r2',
        expires_in: Number.NaN,
        refresh_token_expires_in: undefined,
      }),
    ).toEqual({
      accessToken: 'a2',
      refreshToken: 'r2',
      expiresIn: 86400,
      refreshTokenExpiresIn: 604800,
    });
  });

  it('toGokwikApi includes optional token fields', () => {
    expect(
      toGokwikApi({
        phone: '9876543210',
        email: 'a@b.com',
        password: null,
        shopifyCustomerId: 'sc-1',
        isNewUser: true,
        state: 'active',
        kpToken: 'kp',
        multipassToken: 'mp',
        customerInsights: { tier: 'gold' },
      }).multipass_token,
    ).toBe('mp');
  });

  it('transformGokwikPayload maps snake_case API fields', () => {
    expect(
      transformGokwikPayload({
        phone: '999',
        shopify_customer_id: 'sc-1',
        is_new_user: true,
        state: 'active',
      }),
    ).toEqual({
      phone: '999',
      email: null,
      password: null,
      shopifyCustomerId: 'sc-1',
      isNewUser: true,
      state: 'active',
    });
  });

  it('transformGokwikPayload fills optional API fields', () => {
    expect(
      transformGokwikPayload({
        phone: '999',
        email: 'a@b.com',
        password: 'secret',
        shopify_customer_id: 'sc-1',
        is_new_user: true,
        state: 'pending',
      }),
    ).toEqual({
      phone: '999',
      email: 'a@b.com',
      password: 'secret',
      shopifyCustomerId: 'sc-1',
      isNewUser: true,
      state: 'pending',
    });
  });

  it('buildAuthSession combines user and claims', () => {
    const user = {
      id: 'u1',
      firstName: null,
      lastName: null,
      email: null,
      phoneNumber: null,
      profilePicture: null,
      gender: 'prefer-not-to-say',
      isGuest: true,
    };
    const session = buildAuthSession(user, {
      user_id: 'u1',
      session_id: 's1',
      is_guest: true,
      shopify_customer_id: 'shop-99',
      exp: 999,
      iat: 1,
      type: 'access',
    });
    expect(session.claims.expiresAt).toBe(999);
    expect(session.claims.shopifyCustomerId).toBe('shop-99');
    expect(session.user).toBe(user);
  });

  it('toDeviceInfoApi serialises device fields', () => {
    expect(
      toDeviceInfoApi({
        deviceType: 'web',
        deviceId: 'dev-1',
        deviceName: 'Chrome',
        fcmToken: null,
      }),
    ).toEqual({
      deviceType: 'web',
      device_id: 'dev-1',
      device_name: 'Chrome',
      fcm_token: null,
    });
  });

  it('transformGokwikPayload applies defaults for missing fields', () => {
    expect(transformGokwikPayload({})).toEqual({
      phone: '',
      email: null,
      password: null,
      shopifyCustomerId: null,
      isNewUser: false,
      state: 'active',
    });
  });
});
