import axios from 'axios';

import { ENDPOINTS } from '@/lib/endpoints';
import {
  createGuestSession,
  loginWithKwikpass,
  logoutUser,
  refreshAccessToken,
  validateAccessToken,
} from '@/services/auth/auth.service';

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('@/lib/env', () => ({
  getApiBaseUrl: () => 'https://api.test',
}));

const mockApi = jest.requireMock<{ api: { post: jest.Mock } }>('@/lib/api').api;
const mockAxiosPost = axios.post as jest.Mock;

const guestEnvelope = {
  status: 200,
  message: 'ok',
  data: {
    success: true,
    user: {
      id: 'guest-1',
      first_name: null,
      last_name: null,
      email: null,
      phone_number: null,
      profile_picture: null,
      gender: 'prefer-not-to-say',
      is_guest: true,
    },
    access_token: 'access',
    refresh_token: 'refresh',
    expires_in: 3600,
    refresh_token_expires_in: 7200,
  },
};

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createGuestSession posts device_info and returns tokens + user', async () => {
    mockApi.post.mockResolvedValue({ data: guestEnvelope });

    const result = await createGuestSession({
      deviceType: 'web',
      deviceId: 'd1',
      deviceName: 'Chrome',
      fcmToken: null,
    });

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.auth.guestLogin, {
      device_info: expect.objectContaining({ device_id: 'd1' }),
    });
    expect(result.tokens.accessToken).toBe('access');
    expect(result.user.isGuest).toBe(true);
  });

  it('loginWithKwikpass posts gokwik payload', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        ...guestEnvelope,
        data: { ...guestEnvelope.data, is_guest: false },
      },
    });

    await loginWithKwikpass({
      gokwik: {
        phone: '999',
        email: null,
        password: null,
        shopifyCustomerId: null,
        isNewUser: false,
        state: 'active',
        kpToken: 'kp',
      },
      deviceInfo: {
        deviceType: 'web',
        deviceId: 'd1',
        deviceName: 'Chrome',
        fcmToken: null,
      },
      loginType: 'normal',
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.auth.login,
      expect.objectContaining({
        login_type: 'normal',
        gokwik: expect.objectContaining({ kp_token: 'kp' }),
      }),
    );
  });

  it('loginWithKwikpass posts cart_jwe payload with cart_items', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        ...guestEnvelope,
        data: {
          ...guestEnvelope.data,
          cart_id: 'gid://shopify/Cart/new',
          is_guest: false,
        },
      },
    });

    await loginWithKwikpass({
      gokwik: {
        phone: '',
        email: null,
        password: null,
        shopifyCustomerId: null,
        isNewUser: false,
        state: 'active',
        kpToken: 'kp-jwe',
      },
      deviceInfo: {
        deviceType: 'web',
        deviceId: 'd1',
        deviceName: 'Chrome',
        fcmToken: null,
      },
      loginType: 'cart_jwe',
      cartItems: [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 }],
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.auth.login,
      expect.objectContaining({
        login_type: 'cart_jwe',
        gokwik: { kp_token: 'kp-jwe' },
        cart_items: [{ merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 }],
      }),
    );
  });

  it('loginWithKwikpass posts cart login payload with coupon_codes when provided', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        ...guestEnvelope,
        data: {
          ...guestEnvelope.data,
          cart_id: 'gid://shopify/Cart/new',
          is_guest: false,
        },
      },
    });

    await loginWithKwikpass({
      gokwik: {
        phone: '+919876543210',
        email: null,
        password: null,
        shopifyCustomerId: null,
        isNewUser: false,
        state: 'active',
        kpToken: 'kp',
      },
      deviceInfo: {
        deviceType: 'web',
        deviceId: 'd1',
        deviceName: 'Chrome',
        fcmToken: null,
      },
      loginType: 'cart',
      cartItems: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 }],
      couponCodes: ['SAVE10'],
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.auth.login,
      expect.objectContaining({
        login_type: 'cart',
        gokwik: expect.objectContaining({ phone: '+919876543210' }),
        cart_items: [{ merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1 }],
        coupon_codes: ['SAVE10'],
      }),
    );
  });

  it('loginWithKwikpass includes cart_id when provided', async () => {
    mockApi.post.mockResolvedValue({ data: guestEnvelope });

    await loginWithKwikpass({
      gokwik: {
        phone: '9999999999',
        email: null,
        password: null,
        shopifyCustomerId: null,
        isNewUser: false,
        state: 'active',
        kpToken: 'kp',
        multipassToken: null,
        customerInsights: null,
      },
      deviceInfo: {
        deviceType: 'web',
        deviceId: 'd1',
        deviceName: 'Chrome',
        fcmToken: null,
      },
      loginType: 'checkout',
      cartId: 'gid://shopify/Cart/abc',
    });

    expect(mockApi.post).toHaveBeenCalledWith(
      ENDPOINTS.auth.login,
      expect.objectContaining({
        login_type: 'checkout',
        cart_id: 'gid://shopify/Cart/abc',
      }),
    );
  });

  it('logoutUser posts user_id and tokens via direct axios', async () => {
    mockAxiosPost.mockResolvedValue({ data: {} });

    await logoutUser({
      userId: 'u1',
      accessToken: 'a',
      refreshToken: 'r',
    });

    expect(mockAxiosPost).toHaveBeenCalledWith(
      `https://api.test${ENDPOINTS.auth.logout}`,
      {
        user_id: 'u1',
        access_token: 'a',
        refresh_token: 'r',
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer a',
        }),
      }),
    );
    expect(mockApi.post).not.toHaveBeenCalled();
  });

  it('validateAccessToken returns transformed user', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          user: guestEnvelope.data.user,
        },
      },
    });

    const user = await validateAccessToken('token');
    expect(user.id).toBe('guest-1');
    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.auth.validate, {
      access_token: 'token',
    });
  });

  it('refreshAccessToken returns new token pair', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-a',
          refresh_token: 'new-r',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });

    const tokens = await refreshAccessToken('old-r');
    expect(tokens.accessToken).toBe('new-a');
    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.auth.refresh, {
      refresh_token: 'old-r',
    });
  });

  it('createGuestSession throws normalised error on API failure', async () => {
    mockApi.post.mockRejectedValue({ response: { status: 500 } });

    await expect(
      createGuestSession({
        deviceType: 'web',
        deviceId: 'd1',
        deviceName: 'Chrome',
        fcmToken: null,
      }),
    ).rejects.toBeDefined();
  });

  it('loginWithKwikpass throws on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('network'));

    await expect(
      loginWithKwikpass({
        gokwik: {
          phone: '999',
          email: null,
          password: null,
          shopifyCustomerId: null,
          isNewUser: false,
          state: 'active',
          kpToken: 'kp',
        },
        deviceInfo: {
          deviceType: 'web',
          deviceId: 'd1',
          deviceName: 'Chrome',
          fcmToken: null,
        },
        loginType: 'checkout',
      }),
    ).rejects.toBeDefined();
  });

  it('logoutUser throws on API failure', async () => {
    mockApi.post.mockRejectedValue({ response: { status: 500 } });

    await expect(
      logoutUser({ userId: 'u1', accessToken: 'a', refreshToken: 'r' }),
    ).rejects.toBeDefined();
  });

  it('validateAccessToken throws on API failure', async () => {
    mockApi.post.mockRejectedValue({ response: { status: 401 } });

    await expect(validateAccessToken('bad-token')).rejects.toBeDefined();
  });

  it('refreshAccessToken throws on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('expired'));

    await expect(refreshAccessToken('old-r')).rejects.toBeDefined();
  });
});
