import axios from 'axios';

import * as tokenStorage from '@/lib/auth/auth.client';
import { ENDPOINTS } from '@/lib/endpoints';

const mockClient = jest.fn();
const requestHandlers: Array<(config: Record<string, unknown>) => Record<string, unknown>> = [];
const responseHandlers: Array<{
  fulfilled: (response: unknown) => unknown;
  rejected: (error: unknown) => Promise<unknown>;
}> = [];

jest.mock('axios', () => {
  const mockAxiosPost = jest.fn();
  const instance = Object.assign(
    jest.fn().mockImplementation((config) => Promise.resolve({ data: {}, config })),
    {
      interceptors: {
        request: {
          use: (fn: (config: Record<string, unknown>) => Record<string, unknown>) => {
            requestHandlers.push(fn);
          },
        },
        response: {
          use: (
            fulfilled: (response: unknown) => unknown,
            rejected: (error: unknown) => Promise<unknown>,
          ) => {
            responseHandlers.push({ fulfilled, rejected });
          },
        },
      },
    },
  );

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      post: mockAxiosPost,
    },
  };
});

jest.mock('@/lib/auth/auth.client', () => ({
  ...jest.requireActual('@/lib/auth/auth.client'),
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  clearTokens: jest.fn(),
  setTokens: jest.fn(),
  isAuthBootstrapInFlight: jest.fn(() => false),
  isAuthLogoutInFlight: jest.fn(() => false),
}));
jest.mock('@/lib/env', () => ({
  getApiBaseUrl: () => 'https://api.test',
}));

const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;
const mockAxiosPost = axios.post as jest.Mock;

describe('lib/api auth interceptors', () => {
  beforeAll(async () => {
    await import('@/lib/api');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenStorage.isAuthBootstrapInFlight.mockReturnValue(false);
    mockTokenStorage.isAuthLogoutInFlight.mockReturnValue(false);
    mockTokenStorage.getAccessToken.mockReturnValue('access-token');
    mockTokenStorage.getRefreshToken.mockReturnValue('refresh-token');
  });

  it('request interceptor adds Bearer when token exists', () => {
    const handler = requestHandlers[0];
    expect(handler).toBeDefined();

    const config = handler!({ url: '/api/v1/cart', headers: {} });
    expect(config.headers).toEqual({ Authorization: 'Bearer access-token' });
  });

  it('request interceptor skips Bearer for guest-login', () => {
    const handler = requestHandlers[0]!;
    const config = handler({
      url: ENDPOINTS.auth.guestLogin,
      headers: {},
    });
    expect(config.headers).toEqual({});
  });

  it('request interceptor skips Bearer for refresh-token and validate-token', () => {
    const handler = requestHandlers[0]!;
    expect(handler({ url: ENDPOINTS.auth.refresh, headers: {} }).headers).toEqual({});
    expect(handler({ url: ENDPOINTS.auth.validate, headers: {} }).headers).toEqual({});
  });

  it('does not refresh or recover session while logout is in flight', async () => {
    mockTokenStorage.isAuthLogoutInFlight.mockReturnValue(true);
    const { registerSessionInvalidationHandler } = await import('@/lib/api');
    const rejected = responseHandlers[0]?.rejected;
    const handler = jest.fn();
    registerSessionInvalidationHandler(handler);

    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not clear tokens on 401 refresh failure while auth bootstrap is in flight', async () => {
    mockTokenStorage.isAuthBootstrapInFlight.mockReturnValue(true);
    const rejected = responseHandlers[0]?.rejected;
    mockAxiosPost.mockRejectedValue(new Error('refresh failed'));

    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockTokenStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('response interceptor refreshes on 401 and retries once', async () => {
    const rejected = responseHandlers[0]?.rejected;
    expect(rejected).toBeDefined();

    mockAxiosPost.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });

    const originalConfig = { url: '/api/v1/cart', headers: {}, _retried: false };
    const error = {
      response: { status: 401 },
      config: originalConfig,
    };

    await rejected!(error);

    expect(mockAxiosPost).toHaveBeenCalledWith(
      `https://api.test${ENDPOINTS.auth.refresh}`,
      { refresh_token: 'refresh-token' },
      expect.any(Object),
    );
    expect(mockTokenStorage.setTokens).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 3600,
      refreshTokenExpiresIn: 7200,
    });
  });

  it('does not clear tokens on 401 refresh failure — recovery handles session restore', async () => {
    const rejected = responseHandlers[0]?.rejected;
    mockAxiosPost.mockRejectedValue(new Error('refresh failed'));

    const originalConfig = { url: '/api/v1/cart', headers: {}, _retried: false };
    const error = {
      response: { status: 401 },
      config: originalConfig,
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockTokenStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('response interceptor invokes session invalidation handler when refresh fails', async () => {
    const { registerSessionInvalidationHandler } = await import('@/lib/api');
    const rejected = responseHandlers[0]?.rejected;
    const handler = jest.fn();
    registerSessionInvalidationHandler(handler);
    mockAxiosPost.mockRejectedValue(new Error('refresh failed'));

    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(handler).toHaveBeenCalled();
  });

  it('request interceptor leaves headers empty when no access token', () => {
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);
    const handler = requestHandlers[0]!;
    const config = handler({ url: '/api/v1/cart', headers: {} });
    expect(config.headers).toEqual({});
  });

  it('response interceptor rejects 401 when request was already retried', async () => {
    const rejected = responseHandlers[0]?.rejected;
    const originalConfig = { url: '/api/v1/cart', headers: {}, _retried: true };
    const error = { response: { status: 401 }, config: originalConfig };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('response interceptor rejects 401 when original config is missing', async () => {
    const rejected = responseHandlers[0]?.rejected;
    const error = { response: { status: 401 }, config: undefined };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent refresh attempts on parallel 401 responses', async () => {
    const rejected = responseHandlers[0]?.rejected;
    mockAxiosPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                data: {
                  data: {
                    access_token: 'new-access',
                    refresh_token: 'new-refresh',
                    expires_in: 3600,
                    refresh_token_expires_in: 7200,
                  },
                },
              }),
            20,
          );
        }),
    );

    const errorA = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };
    const errorB = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await Promise.all([rejected!(errorA), rejected!(errorB)]);
    expect(mockAxiosPost).toHaveBeenCalledTimes(1);
  });

  it('does not clear tokens when refresh token is missing on 401', async () => {
    const rejected = responseHandlers[0]?.rejected;
    mockTokenStorage.getRefreshToken.mockReturnValue(undefined);
    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
    expect(mockTokenStorage.clearTokens).not.toHaveBeenCalled();
  });

  it('response interceptor invokes token refresh handler on successful refresh', async () => {
    const { registerTokenRefreshHandler } = await import('@/lib/api');
    const rejected = responseHandlers[0]?.rejected;
    const handler = jest.fn();
    registerTokenRefreshHandler(handler);

    mockAxiosPost.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });
    mockTokenStorage.getAccessToken.mockReturnValue('new-access');

    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await rejected!(error);
    expect(handler).toHaveBeenCalled();
  });

  it('registerTokenRefreshHandler unsubscribe clears only its handler', async () => {
    const { registerTokenRefreshHandler } = await import('@/lib/api');
    const rejected = responseHandlers[0]?.rejected;
    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const unsubscribeA = registerTokenRefreshHandler(handlerA);
    registerTokenRefreshHandler(handlerB);
    unsubscribeA();

    mockAxiosPost.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });
    mockTokenStorage.getAccessToken.mockReturnValue('new-access');

    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await rejected!(error);
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalled();
  });

  it('registerSessionInvalidationHandler unsubscribe clears only its handler', async () => {
    const { registerSessionInvalidationHandler } = await import('@/lib/api');
    const rejected = responseHandlers[0]?.rejected;
    const handlerA = jest.fn();
    const handlerB = jest.fn();
    const unsubscribeA = registerSessionInvalidationHandler(handlerA);
    registerSessionInvalidationHandler(handlerB);
    unsubscribeA();

    mockAxiosPost.mockRejectedValue(new Error('refresh failed'));
    const error = {
      response: { status: 401 },
      config: { url: '/api/v1/cart', headers: {}, _retried: false },
    };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).toHaveBeenCalled();
  });

  it('retries without Authorization when refresh succeeds but access token is missing', async () => {
    const rejected = responseHandlers[0]?.rejected;
    mockAxiosPost.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });
    mockTokenStorage.getAccessToken.mockReturnValue(undefined);

    const originalConfig: { url: string; headers: Record<string, string>; _retried: boolean } = {
      url: '/api/v1/cart',
      headers: {},
      _retried: false,
    };
    const error = { response: { status: 401 }, config: originalConfig };

    await rejected!(error);
    expect(originalConfig.headers.Authorization).toBeUndefined();
  });

  it('response fulfilled handler passes through successful responses', () => {
    const fulfilled = responseHandlers[0]?.fulfilled;
    const response = { data: { ok: true }, status: 200 };
    expect(fulfilled!(response)).toBe(response);
  });

  it('retries original request after successful token refresh', async () => {
    const rejected = responseHandlers[0]?.rejected;
    mockAxiosPost.mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
          refresh_token_expires_in: 7200,
        },
      },
    });
    mockTokenStorage.getAccessToken.mockReturnValue('new-access');

    const originalConfig: { url: string; headers: Record<string, string>; _retried: boolean } = {
      url: '/api/v1/cart',
      headers: {},
      _retried: false,
    };
    const error = { response: { status: 401 }, config: originalConfig };

    const result = await rejected!(error);
    expect(result).toEqual(expect.objectContaining({ data: {} }));
    expect(originalConfig.headers.Authorization).toBe('Bearer new-access');
    expect(originalConfig._retried).toBe(true);
  });

  it('response interceptor rejects non-401 errors without refresh attempt', async () => {
    const rejected = responseHandlers[0]?.rejected;
    const error = { response: { status: 500 }, config: { url: '/api/v1/cart', headers: {} } };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it('response interceptor rejects network errors without a response object', async () => {
    const rejected = responseHandlers[0]?.rejected;
    const error = { message: 'Network Error', config: { url: '/api/v1/cart', headers: {} } };

    await expect(rejected!(error)).rejects.toBe(error);
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });
});
