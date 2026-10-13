/** @jest-environment jsdom */

jest.mock('@/lib/analytics/webengage-bootstrap', () => {
  const actual = jest.requireActual('@/lib/analytics/webengage-bootstrap') as typeof import('@/lib/analytics/webengage-bootstrap');

  return {
    ...actual,
    isWebEngageRuntimeEnabled: jest.fn(() => true),
    isWebEngageRemoteConfigAvailable: jest.fn(async () => true),
  };
});

jest.mock('@/lib/env', () => {
  const actual = jest.requireActual('@/lib/env') as typeof import('@/lib/env');

  return {
    ...actual,
    isWebEngageAnalyticsEnabled: jest.fn(actual.isWebEngageAnalyticsEnabled),
    getAnalyticsWebEngageLicenseCode: jest.fn(actual.getAnalyticsWebEngageLicenseCode),
    getAnalyticsWebEngageDataCenter: jest.fn(actual.getAnalyticsWebEngageDataCenter),
  };
});

import {
  bootstrapWebEngageIfReady,
  resetWebEngageBootstrapCacheForTests,
} from '@/lib/analytics/bootstrap-webengage';
import {
  isWebEngageRemoteConfigAvailable,
  isWebEngageRuntimeEnabled,
  webengageBootstrapScriptId,
} from '@/lib/analytics/webengage-bootstrap';
import {
  getAnalyticsWebEngageLicenseCode,
  isWebEngageAnalyticsEnabled,
} from '@/lib/env';

const mockIsWebEngageRuntimeEnabled = isWebEngageRuntimeEnabled as jest.MockedFunction<
  typeof isWebEngageRuntimeEnabled
>;
const mockIsWebEngageRemoteConfigAvailable =
  isWebEngageRemoteConfigAvailable as jest.MockedFunction<
    typeof isWebEngageRemoteConfigAvailable
  >;
const mockIsWebEngageAnalyticsEnabled = isWebEngageAnalyticsEnabled as jest.MockedFunction<
  typeof isWebEngageAnalyticsEnabled
>;
const mockGetAnalyticsWebEngageLicenseCode =
  getAnalyticsWebEngageLicenseCode as jest.MockedFunction<
    typeof getAnalyticsWebEngageLicenseCode
  >;

describe('bootstrapWebEngageIfReady', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    resetWebEngageBootstrapCacheForTests();
    jest.clearAllMocks();
    mockIsWebEngageRuntimeEnabled.mockReturnValue(true);
    mockIsWebEngageRemoteConfigAvailable.mockResolvedValue(true);
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(true);
    mockGetAnalyticsWebEngageLicenseCode.mockReturnValue('8261894a');
  });

  it('returns false when runtime host is unsupported', async () => {
    mockIsWebEngageRuntimeEnabled.mockReturnValue(false);

    await expect(bootstrapWebEngageIfReady()).resolves.toBe(false);
    expect(document.getElementById(webengageBootstrapScriptId)).toBeNull();
  });

  it('returns false when remote v4 config is empty', async () => {
    mockIsWebEngageRemoteConfigAvailable.mockResolvedValue(false);

    await expect(bootstrapWebEngageIfReady()).resolves.toBe(false);
    expect(document.getElementById(webengageBootstrapScriptId)).toBeNull();
  });

  it('injects bootstrap when remote config is available', async () => {
    await expect(bootstrapWebEngageIfReady()).resolves.toBe(true);

    const script = document.getElementById(webengageBootstrapScriptId);

    expect(script).toBeInTheDocument();
    expect(script?.textContent).toContain("webengage.init('8261894a')");
  });

  it('reuses an existing bootstrap script tag', async () => {
    document.head.innerHTML = `<script id="${webengageBootstrapScriptId}"></script>`;

    await expect(bootstrapWebEngageIfReady()).resolves.toBe(true);
    expect(mockIsWebEngageRemoteConfigAvailable).not.toHaveBeenCalled();
  });
});
