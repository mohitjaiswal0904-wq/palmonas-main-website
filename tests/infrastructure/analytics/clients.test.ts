/** @jest-environment jsdom */

jest.mock('mixpanel-browser', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    track: jest.fn(),
    identify: jest.fn(),
    opt_in_tracking: jest.fn(),
    has_opted_out_tracking: jest.fn(() => false),
    register: jest.fn(),
    reset: jest.fn(),
    get_distinct_id: jest.fn(() => 'device-distinct-1'),
  },
}));

jest.mock('@microsoft/clarity', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    event: jest.fn(),
    setTag: jest.fn(),
  },
}));

import mixpanel from 'mixpanel-browser';

import { createClarityClient } from '@/infrastructure/analytics/clients/clarity.client';
import { createGa4Client } from '@/infrastructure/analytics/clients/ga4.client';
import { createMixpanelClient } from '@/infrastructure/analytics/clients/mixpanel.client';
import { createAnalyticsVendorClients } from '@/infrastructure/analytics/clients';

describe('createMixpanelClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie.split(';').forEach((entry) => {
      const name = entry.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
    jest.clearAllMocks();
  });

  it('initializes the mixpanel-browser SDK and tracks events', async () => {
    const client = createMixpanelClient('token-1', {
      apiHost: 'https://api-in.mixpanel.com',
      debug: true,
    });

    expect(client.isConfigured()).toBe(true);
    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith('token-1', {
      track_pageview: false,
      persistence: 'localStorage',
      batch_requests: true,
      batch_size: 10,
      batch_flush_interval_ms: 5000,
      api_routes: { track: 'track' },
      debug: false,
      api_host: 'https://api-in.mixpanel.com',
    });
    expect(mixpanel.opt_in_tracking).not.toHaveBeenCalled();
    expect(mixpanel.register).toHaveBeenCalledWith({ platform: 'web' });

    await client.track('Add To Cart', { product_id: 'sku-1' });
    expect(mixpanel.track).toHaveBeenCalledWith('Add To Cart', { product_id: 'sku-1' });

    await client.identify?.('cGhvbmU=');
    expect(mixpanel.identify).toHaveBeenCalledWith('cGhvbmU=');
    expect(window.localStorage.getItem('mp_palmonas_distinct_id')).toBe('cGhvbmU=');
    expect(document.cookie).toContain('mp_palmonas_distinct_id=cGhvbmU=');

    await client.resetIdentity?.();
    expect(mixpanel.reset).not.toHaveBeenCalled();
    expect(mixpanel.identify).toHaveBeenCalledWith('cGhvbmU=');
    expect(window.localStorage.getItem('mp_palmonas_distinct_id')).toBe('cGhvbmU=');
    expect(document.cookie).toContain('mp_palmonas_distinct_id=cGhvbmU=');
  });

  it('restores a stored distinct id on init so Mixpanel does not mint a new user', async () => {
    window.localStorage.setItem('mp_palmonas_distinct_id', 'stored-user-1');

    const client = createMixpanelClient('token-1');
    await client.init();

    expect(mixpanel.identify).toHaveBeenCalledWith('stored-user-1');
    expect(window.localStorage.getItem('mp_palmonas_distinct_id')).toBe('stored-user-1');
  });

  it('persists the SDK distinct id when none is stored yet', async () => {
    const client = createMixpanelClient('token-1');
    await client.init();

    expect(window.localStorage.getItem('mp_palmonas_distinct_id')).toBe('device-distinct-1');
  });

  it('enables Session Replay sampling and heatmap capture on init', async () => {
    const client = createMixpanelClient('token-1', {
      recordSessionsPercent: 100,
      recordHeatmapData: true,
    });

    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({
        record_sessions_percent: 100,
        record_heatmap_data: true,
      }),
    );
  });

  it('clamps Session Replay sampling above 100', async () => {
    const client = createMixpanelClient('token-1', {
      recordSessionsPercent: 150,
      recordHeatmapData: true,
    });

    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({
        record_sessions_percent: 100,
        record_heatmap_data: true,
      }),
    );
  });

  it('does not send xhr_headers on Mixpanel ingest', async () => {
    const client = createMixpanelClient('token-1', { apiHost: 'https://proxy.example/v1/i/TEST1' });

    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({
        api_host: 'https://proxy.example/v1/i/TEST1',
        api_routes: { track: 'track' },
      }),
    );
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.not.objectContaining({
        xhr_headers: expect.anything(),
        api_transport: expect.anything(),
      }),
    );
  });

  it('opts out of Mixpanel ingest so local batches do not retry', async () => {
    const client = createMixpanelClient('token-1', { optOutTracking: true });

    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({
        opt_out_tracking_by_default: true,
      }),
    );
    expect(mixpanel.opt_in_tracking).not.toHaveBeenCalled();
  });

  it('opts in only when reversing a persisted Mixpanel opt-out', async () => {
    (mixpanel.has_opted_out_tracking as jest.Mock).mockReturnValueOnce(true);

    const client = createMixpanelClient('token-1');
    expect(await client.init()).toBe(true);

    expect(mixpanel.opt_in_tracking).toHaveBeenCalledTimes(1);
  });

  it('registers super properties after init', async () => {
    const client = createMixpanelClient('token-1');
    await client.init();

    client.registerSuperProperties?.({ page_name: 'Cart' });

    expect(mixpanel.register).toHaveBeenCalledWith({
      platform: 'web',
      page_name: 'Cart',
    });
  });

  it('applies queued super properties on init', async () => {
    const client = createMixpanelClient('token-1');
    client.registerSuperProperties?.({ page_name: 'Home' });

    expect(mixpanel.register).not.toHaveBeenCalled();

    await client.init();

    expect(mixpanel.register).toHaveBeenCalledWith({
      platform: 'web',
      page_name: 'Home',
    });
  });

  it('does not enable heatmap when Session Replay sampling is disabled', async () => {
    const client = createMixpanelClient('token-1', {
      recordSessionsPercent: Number.NaN,
      recordHeatmapData: true,
    });

    expect(await client.init()).toBe(true);
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({
        record_sessions_percent: 0,
      }),
    );
    expect(mixpanel.init).toHaveBeenCalledWith(
      'token-1',
      expect.not.objectContaining({
        record_heatmap_data: true,
      }),
    );
  });

  it('delays SDK initialization by the configured initDelayMs', async () => {
    jest.useFakeTimers();
    try {
      const client = createMixpanelClient('token-1', { initDelayMs: 2000 });
      const initPromise = client.init();

      expect(client.isReady()).toBe(false);
      expect(mixpanel.init).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1000);
      expect(client.isReady()).toBe(false);
      expect(mixpanel.init).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(1000);
      const result = await initPromise;

      expect(result).toBe(true);
      expect(client.isReady()).toBe(true);
      expect(mixpanel.init).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('queues track calls during the initial delay and flushes them once initialized', async () => {
    jest.useFakeTimers();
    try {
      const client = createMixpanelClient('token-1', { initDelayMs: 2000 });
      const trackPromise = client.track('Item Added to Cart', { sku: 'ring-1' });

      expect(mixpanel.track).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(2000);
      await trackPromise;

      expect(mixpanel.track).toHaveBeenCalledWith('Item Added to Cart', { sku: 'ring-1' });

      // Subsequent track calls after initialization proceed immediately without delay
      await client.track('Checkout Clicked', { sku: 'ring-1' });
      expect(mixpanel.track).toHaveBeenCalledWith('Checkout Clicked', { sku: 'ring-1' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('persists distinct id immediately during delay and identifies once SDK is ready', async () => {
    jest.useFakeTimers();
    try {
      const client = createMixpanelClient('token-1', { initDelayMs: 2000 });
      const identifyPromise = client.identify?.('user-delayed-123');

      expect(window.localStorage.getItem('mp_palmonas_distinct_id')).toBe('user-delayed-123');
      expect(mixpanel.identify).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(2000);
      await identifyPromise;

      expect(mixpanel.identify).toHaveBeenCalledWith('user-delayed-123');
    } finally {
      jest.useRealTimers();
    }
  });

  it('coalesces concurrent init calls during delay into a single initialization', async () => {
    jest.useFakeTimers();
    try {
      const client = createMixpanelClient('token-1', { initDelayMs: 2000 });
      const p1 = client.init();
      const p2 = client.init();

      await jest.advanceTimersByTimeAsync(2000);
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toBe(true);
      expect(r2).toBe(true);
      expect(mixpanel.init).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('createClarityClient', () => {
  it('initializes clarity and sends custom events', async () => {
    jest.doMock('@microsoft/clarity', () => ({
      __esModule: true,
      default: {
        init: jest.fn(),
        event: jest.fn(),
        setTag: jest.fn(),
      },
    }));

    const clarityModule = await import('@microsoft/clarity');
    const client = createClarityClient('project-1');

    expect(await client.init()).toBe(true);
    expect(clarityModule.default.init).toHaveBeenCalledWith('project-1');

    await client.track('page_view', { path: '/pop' });
    expect(clarityModule.default.event).toHaveBeenCalledWith('page_view');
    expect(clarityModule.default.setTag).toHaveBeenCalledWith('path', '/pop');
  });
});

describe('createGa4Client', () => {
  it('tracks via gtag when gtag is available', async () => {
    const gtag = jest.fn();
    window.gtag = gtag;
    window.dataLayer = [];
    const client = createGa4Client('G-TEST123');

    expect(await client.init()).toBe(true);
    await client.track('page_view', { path: '/pop' });

    expect(gtag).toHaveBeenCalledWith('event', 'page_view', { path: '/pop' });
    expect(window.dataLayer).toEqual([{ event: 'page_view', path: '/pop' }]);
  });
});

describe('createAnalyticsVendorClients', () => {
  it('creates one client per configured provider', () => {
    const clients = createAnalyticsVendorClients({
      meta: { pixelId: '123' },
      ga4: { measurementId: 'G-123' },
      googleAds: { conversionId: 'AW-123' },
      simprosys: { gtmContainerId: 'GTM-123' },
      pinterest: { tagId: '2612345678901' },
      spotify: { pixelId: 'sp-1' },
      admitad: { campaignCode: 'ad-1' },
      mixpanel: { token: 'mp' },
      clarity: { projectId: 'cl' },
      webengage: { licenseCode: 'we' },
    });

    expect(clients.map((client) => client.id)).toEqual([
      'meta',
      'ga4',
      'googleAds',
      'simprosys',
      'pinterest',
      'spotify',
      'admitad',
      'mixpanel',
      'clarity',
      'webengage',
    ]);
  });
});
