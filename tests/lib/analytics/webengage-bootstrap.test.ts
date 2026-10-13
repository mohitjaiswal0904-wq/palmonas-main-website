/** @jest-environment jsdom */

import {
  buildWebEngageBootstrapScript,
  getWebEngageSdkOrigin,
  getWebEngageV4ConfigUrl,
  isWebEngageRemoteConfigAvailable,
  isWebEngageRuntimeEnabled,
  isWebEngageSupportedHost,
  sanitizeWebEngageLicenseCode,
  webengageBootstrapScriptId,
} from '@/lib/analytics/webengage-bootstrap';

describe('sanitizeWebEngageLicenseCode', () => {
  it('trims and removes unsafe characters while keeping tilde', () => {
    expect(sanitizeWebEngageLicenseCode(' ~8261894a ')).toBe('~8261894a');
    expect(sanitizeWebEngageLicenseCode("826';alert(1)//")).toBe('826alert1');
  });
});

describe('getWebEngageSdkOrigin', () => {
  it('returns the HTTPS origin for each supported data center', () => {
    expect(getWebEngageSdkOrigin('in')).toBe('https://widgets.in.webengage.com');
    expect(getWebEngageSdkOrigin('us')).toBe('https://ssl.widgets.webengage.com');
    expect(getWebEngageSdkOrigin('ksa')).toBe('https://widgets.ksa.webengage.com');
    expect(getWebEngageSdkOrigin('eug')).toBe('https://widgets.eug.webengage.com');
  });
});

describe('getWebEngageV4ConfigUrl', () => {
  it('builds the India CDN config URL for a license code', () => {
    expect(getWebEngageV4ConfigUrl('8261894a', 'in')).toBe(
      'https://wsdk-files.in.webengage.com/webengage/8261894a/v4.js',
    );
  });
});

describe('isWebEngageSupportedHost', () => {
  it('returns false on localhost hostnames', () => {
    expect(isWebEngageSupportedHost('localhost')).toBe(false);
    expect(isWebEngageSupportedHost('127.0.0.1')).toBe(false);
  });

  it('returns true on production hostnames', () => {
    expect(isWebEngageSupportedHost('www.palmonas.com')).toBe(true);
  });
});

describe('isWebEngageRuntimeEnabled', () => {
  it('returns false on localhost in the browser', () => {
    expect(isWebEngageRuntimeEnabled()).toBe(false);
  });
});

describe('isWebEngageRemoteConfigAvailable', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
      return;
    }

    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  it('returns false when v4.js responds with zero content length', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => (name === 'content-length' ? '0' : null),
      },
      text: async () => '',
    }) as unknown as typeof fetch;

    await expect(isWebEngageRemoteConfigAvailable('8261894a', 'in')).resolves.toBe(false);
  });

  it('returns true when v4.js has non-zero content length', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (name: string) => (name === 'content-length' ? '128' : null),
      },
      text: async () => '',
    }) as unknown as typeof fetch;

    await expect(isWebEngageRemoteConfigAvailable('8261894a', 'in')).resolves.toBe(true);
  });

  it('falls back to GET body inspection when content-length is missing', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => null,
        },
        text: async () => '',
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => null,
        },
        text: async () => 'var webengage_fs_configurationMap = {};',
      }) as unknown as typeof fetch;

    await expect(isWebEngageRemoteConfigAvailable('8261894a', 'in')).resolves.toBe(true);
  });
});

describe('buildWebEngageBootstrapScript', () => {
  it('builds the official v6 India SPA bootstrap with a single guarded init call', () => {
    const script = buildWebEngageBootstrapScript('8261894a', 'in');

    expect(script).toContain('webengage-min-v-6.0.js');
    expect(script).toContain("webengage.init('8261894a')");
    expect(script).toContain('__palmonasWebEngageInit');
    expect(script).toContain('is_spa:1');
    expect(script).toContain('webPersonalization');
    expect(script).toContain('notificationInbox');
    expect(script).toContain('https://widgets.in.webengage.com/js/webengage-min-v-6.0.js');
    expect(script).not.toContain('ssl.widgets.webengage.com');
    expect(script).toContain(webengageBootstrapScriptId);
  });

  it('uses the US SDK origin when data center is us', () => {
    const script = buildWebEngageBootstrapScript('~8261894a', 'us');

    expect(script).toContain('https://ssl.widgets.webengage.com/js/webengage-min-v-6.0.js');
    expect(script).not.toContain('http://cdn.widgets.webengage.com');
    expect(script).toContain("webengage.init('~8261894a')");
  });

  it('returns empty string when license code is invalid', () => {
    expect(buildWebEngageBootstrapScript('   ')).toBe('');
  });
});
