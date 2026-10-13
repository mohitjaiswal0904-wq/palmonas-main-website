/** @jest-environment jsdom */

jest.mock('@/lib/analytics/webengage-bootstrap', () => {
  const actual = jest.requireActual('@/lib/analytics/webengage-bootstrap') as typeof import('@/lib/analytics/webengage-bootstrap');

  return {
    ...actual,
    isWebEngageRuntimeEnabled: jest.fn(() => true),
  };
});

jest.mock('@/lib/analytics/bootstrap-webengage', () => {
  const actual = jest.requireActual('@/lib/analytics/bootstrap-webengage') as typeof import('@/lib/analytics/bootstrap-webengage');

  return {
    ...actual,
    bootstrapWebEngageIfReady: jest.fn(actual.bootstrapWebEngageIfReady),
  };
});

jest.mock('@/lib/env', () => {
  const actual = jest.requireActual('@/lib/env') as typeof import('@/lib/env');

  return {
    ...actual,
    isWebEngageAnalyticsEnabled: jest.fn(actual.isWebEngageAnalyticsEnabled),
  };
});

import { bootstrapWebEngageIfReady } from '@/lib/analytics/bootstrap-webengage';
import { createWebEngageClient } from '@/infrastructure/analytics/clients/webengage.client';
import { isWebEngageAnalyticsEnabled } from '@/lib/env';
import { webengageBootstrapScriptId } from '@/lib/analytics/webengage-bootstrap';

const mockBootstrapWebEngageIfReady = bootstrapWebEngageIfReady as jest.MockedFunction<
  typeof bootstrapWebEngageIfReady
>;

const mockIsWebEngageAnalyticsEnabled = isWebEngageAnalyticsEnabled as jest.MockedFunction<
  typeof isWebEngageAnalyticsEnabled
>;

describe('createWebEngageClient', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    delete window.webengage;
    delete window.webengageInitialized;
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(true);
    mockBootstrapWebEngageIfReady.mockResolvedValue(true);
  });

  it('skips init when analytics is disabled', async () => {
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(false);

    const client = createWebEngageClient('8261894a');

    expect(client.isConfigured()).toBe(false);
    expect(await client.init()).toBe(false);
  });

  it('loads bootstrap and tracks events when SDK becomes ready', async () => {
    const client = createWebEngageClient('8261894a');
    const track = jest.fn();
    const onReady = jest.fn((callback: () => void) => {
      window.webengageInitialized = true;
      callback();
    });

    window.webengage = {
      init: jest.fn(),
      track,
      onReady,
      user: {
        login: jest.fn(),
        logout: jest.fn(),
        setAttribute: jest.fn(),
      },
    };

    document.body.innerHTML = `<script id="${webengageBootstrapScriptId}"></script>`;

    expect(client.isConfigured()).toBe(true);
    expect(await client.init()).toBe(true);

    await client.track('Page View', { path: '/cart', we_reserved: 'drop' });

    expect(track).toHaveBeenCalledWith('Page View', { path: '/cart' });
  });

  it('logs in and sets profile attributes through WebEngage identity APIs', async () => {
    const client = createWebEngageClient('8261894a');
    const login = jest.fn();
    const setAttribute = jest.fn();

    window.webengage = {
      init: jest.fn(),
      track: jest.fn(),
      onReady: jest.fn((callback: () => void) => {
        window.webengageInitialized = true;
        callback();
      }),
      user: {
        login,
        logout: jest.fn(),
        setAttribute,
      },
    };

    document.body.innerHTML = `<script id="${webengageBootstrapScriptId}"></script>`;

    expect(await client.init()).toBe(true);

    await client.identify?.('cGhvbmU=', {
      webengageUserId: 'user-123',
      webengageProfile: {
        email: 'shopper@example.com',
        firstName: 'Asha',
        lastName: 'Sharma',
        phoneNumber: '9876543210',
        gender: 'female',
      },
    });

    expect(login).toHaveBeenCalledWith('user-123');
    expect(setAttribute).toHaveBeenCalledWith({
      we_email: 'shopper@example.com',
      we_first_name: 'Asha',
      we_last_name: 'Sharma',
      we_phone: '+919876543210',
      we_gender: 'female',
    });
  });

  it('logs out users through WebEngage identity APIs', async () => {
    const client = createWebEngageClient('8261894a');
    const logout = jest.fn();

    window.webengage = {
      init: jest.fn(),
      track: jest.fn(),
      onReady: jest.fn((callback: () => void) => {
        window.webengageInitialized = true;
        callback();
      }),
      user: {
        login: jest.fn(),
        logout,
        setAttribute: jest.fn(),
      },
    };

    document.body.innerHTML = `<script id="${webengageBootstrapScriptId}"></script>`;

    expect(await client.init()).toBe(true);
    await client.resetIdentity?.();

    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('does not mark client ready when onReady never fires', async () => {
    jest.useFakeTimers();

    try {
      const client = createWebEngageClient('8261894a');

      window.webengage = {
        init: jest.fn(),
        track: jest.fn(),
        onReady: jest.fn(),
        user: {
          login: jest.fn(),
          logout: jest.fn(),
          setAttribute: jest.fn(),
        },
      };

      document.body.innerHTML = `<script id="${webengageBootstrapScriptId}"></script>`;

      const initPromise = client.init();
      await jest.advanceTimersByTimeAsync(15_000);

      await expect(initPromise).resolves.toBe(false);
      expect(client.isReady()).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });
});
