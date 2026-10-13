/** @jest-environment jsdom */

jest.mock('@/infrastructure/analytics/create-analytics-providers', () => ({
  createAnalyticsProviders: jest.fn(() => []),
}));

jest.mock('@/infrastructure/analytics/clients', () => ({
  createAnalyticsVendorClients: jest.fn(() => []),
}));

import { createAnalyticsVendorClients } from '@/infrastructure/analytics/clients';

import { AnalyticsClient } from '@/infrastructure/analytics/analytics-client';
import { createAnalyticsProviders } from '@/infrastructure/analytics/create-analytics-providers';
import type { AnalyticsProviderPort } from '@/types/analytics/analytics-provider.port';

const mockCreateAnalyticsProviders = createAnalyticsProviders as jest.MockedFunction<
  typeof createAnalyticsProviders
>;
const mockCreateAnalyticsVendorClients = createAnalyticsVendorClients as jest.MockedFunction<
  typeof createAnalyticsVendorClients
>;

function createMockProvider(
  id: AnalyticsProviderPort['id'],
  state: { configured?: boolean; initialized?: boolean; initSucceeds?: boolean },
): AnalyticsProviderPort & {
  initialize: jest.Mock;
  track: jest.Mock;
} {
  let initialized = state.initialized ?? false;
  const configured = state.configured ?? true;
  const initSucceeds = state.initSucceeds ?? true;

  return {
    id,
    isConfigured: () => configured,
    isInitialized: () => initialized,
    initialize: jest.fn(async () => {
      if (initSucceeds) {
        initialized = true;
      }
    }),
    track: jest.fn(async () => undefined),
  };
}

describe('AnalyticsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateAnalyticsProviders.mockReturnValue([]);
    mockCreateAnalyticsVendorClients.mockReturnValue([]);
  });

  it('initializes only configured providers', async () => {
    const metaProvider = createMockProvider('meta', {});
    const ga4Provider = createMockProvider('ga4', { configured: false });
    mockCreateAnalyticsProviders.mockReturnValue([metaProvider, ga4Provider]);

    const client = new AnalyticsClient({ meta: { pixelId: '123' } });
    await client.initialize();

    expect(metaProvider.initialize).toHaveBeenCalledTimes(1);
    expect(ga4Provider.initialize).not.toHaveBeenCalled();
  });

  it('transforms and fans out events to initialized providers', async () => {
    const metaProvider = createMockProvider('meta', { initialized: true });
    const ga4Provider = createMockProvider('ga4', { initialized: true });
    mockCreateAnalyticsProviders.mockReturnValue([metaProvider, ga4Provider]);

    const client = new AnalyticsClient({
      meta: { pixelId: '123' },
      ga4: { measurementId: 'G-123' },
    });

    await client.track({ name: 'page_view', properties: { path: '/pop' } });

    expect(metaProvider.track).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'meta', eventName: 'PageView' }),
    );
    expect(ga4Provider.track).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'ga4', eventName: 'page_view' }),
    );
  });

  it('skips bulk initialize for lazy-init providers', async () => {
    const metaProvider = createMockProvider('meta', {});
    const webengageProvider = createMockProvider('webengage', {});
    mockCreateAnalyticsProviders.mockReturnValue([metaProvider, webengageProvider]);

    const client = new AnalyticsClient({
      meta: { pixelId: '123' },
      webengage: { licenseCode: '8261894a' },
    });
    await client.initialize();

    expect(metaProvider.initialize).toHaveBeenCalledTimes(1);
    expect(webengageProvider.initialize).not.toHaveBeenCalled();
  });

  it('lazy-initializes providers on first track', async () => {
    const webengageProvider = createMockProvider('webengage', {});
    mockCreateAnalyticsProviders.mockReturnValue([webengageProvider]);

    const client = new AnalyticsClient({ webengage: { licenseCode: '8261894a' } });
    await client.track({ name: 'page_view', properties: { path: '/home' } });

    expect(webengageProvider.initialize).toHaveBeenCalledTimes(1);
    expect(webengageProvider.track).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'webengage', eventName: 'Page View' }),
    );
  });

  it('skips track when provider init fails', async () => {
    const metaProvider = createMockProvider('meta', { initSucceeds: false });
    mockCreateAnalyticsProviders.mockReturnValue([metaProvider]);

    const client = new AnalyticsClient({ meta: { pixelId: '123' } });
    await client.track({ name: 'page_view' });

    expect(metaProvider.initialize).toHaveBeenCalledTimes(2);
    expect(metaProvider.track).not.toHaveBeenCalled();
  });

  it('lists configured provider ids from constructor config', () => {
    const client = new AnalyticsClient({
      meta: { pixelId: '123' },
      clarity: { projectId: 'abc' },
    });

    expect(client.getConfiguredProviderIds()).toEqual(['meta', 'clarity']);
  });

  it('registers Mixpanel super properties on vendor clients', () => {
    const registerSuperProperties = jest.fn();
    mockCreateAnalyticsVendorClients.mockReturnValue([
      {
        id: 'mixpanel',
        isConfigured: () => true,
        isReady: () => true,
        init: jest.fn(async () => true),
        track: jest.fn(async () => undefined),
        registerSuperProperties,
      },
    ]);

    const client = new AnalyticsClient({ mixpanel: { token: 'mp' } });
    client.setSuperProperties({ platform: 'web', page_name: 'Home' });

    expect(registerSuperProperties).toHaveBeenCalledWith({
      platform: 'web',
      page_name: 'Home',
    });
  });

  it('kicks off Mixpanel initialization in the background without blocking immediate provider bootstrap', async () => {
    let mixpanelInitResolved = false;
    const metaProvider = createMockProvider('meta', {});
    const mixpanelProvider: AnalyticsProviderPort = {
      id: 'mixpanel',
      isConfigured: () => true,
      isInitialized: () => mixpanelInitResolved,
      initialize: jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        mixpanelInitResolved = true;
      }),
      track: jest.fn(async () => undefined),
    };

    mockCreateAnalyticsProviders.mockReturnValue([metaProvider, mixpanelProvider]);

    const client = new AnalyticsClient({
      meta: { pixelId: '123' },
      mixpanel: { token: 'mp' },
    });

    // initialize() should resolve immediately without waiting 2000ms for Mixpanel
    const initPromise = client.initialize();
    await expect(initPromise).resolves.toBeUndefined();

    expect(metaProvider.initialize).toHaveBeenCalledTimes(1);
    expect(mixpanelProvider.initialize).toHaveBeenCalledTimes(1);
    // Mixpanel is still running its delay in background
    expect(mixpanelInitResolved).toBe(false);
  });

  it('track() waits for Mixpanel delayed init before dispatching Mixpanel events', async () => {
    jest.useFakeTimers();
    try {
      let mixpanelInitResolved = false;
      const mixpanelProvider: AnalyticsProviderPort = {
        id: 'mixpanel',
        isConfigured: () => true,
        isInitialized: () => mixpanelInitResolved,
        initialize: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          mixpanelInitResolved = true;
        }),
        track: jest.fn(async () => undefined),
      };

      mockCreateAnalyticsProviders.mockReturnValue([mixpanelProvider]);

      const client = new AnalyticsClient({ mixpanel: { token: 'mp' } });
      await client.initialize();

      const trackPromise = client.track({ name: 'home_viewed', properties: {} });

      // Mixpanel track must not fire before the delay has elapsed
      expect(mixpanelProvider.track).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(5000);
      await trackPromise;

      expect(mixpanelProvider.track).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('identify() waits for Mixpanel delayed init before calling identify on the SDK', async () => {
    jest.useFakeTimers();
    try {
      let mixpanelInitResolved = false;
      const identifyMock = jest.fn(async () => undefined);
      mockCreateAnalyticsVendorClients.mockReturnValue([
        {
          id: 'mixpanel',
          isConfigured: () => true,
          isReady: () => mixpanelInitResolved,
          init: jest.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            mixpanelInitResolved = true;
            return true;
          }),
          track: jest.fn(async () => undefined),
          identify: identifyMock,
        },
      ]);

      const mixpanelProvider: AnalyticsProviderPort = {
        id: 'mixpanel',
        isConfigured: () => true,
        isInitialized: () => mixpanelInitResolved,
        initialize: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          mixpanelInitResolved = true;
        }),
        track: jest.fn(async () => undefined),
      };
      mockCreateAnalyticsProviders.mockReturnValue([mixpanelProvider]);

      const client = new AnalyticsClient({ mixpanel: { token: 'mp' } });
      await client.initialize();

      const identifyPromise = client.identify('user-123');

      expect(identifyMock).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(5000);
      await identifyPromise;

      expect(identifyMock).toHaveBeenCalledWith('user-123', undefined);
    } finally {
      jest.useRealTimers();
    }
  });
});

