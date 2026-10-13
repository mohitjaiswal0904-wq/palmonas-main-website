/** @jest-environment jsdom */

import {
  isWebEngageSdkInitialized,
  runWhenWebEngageReady,
  waitForWebEngageReady,
} from '@/lib/analytics/wait-for-webengage-ready';

describe('wait-for-webengage-ready', () => {
  beforeEach(() => {
    delete window.webengage;
    delete window.webengageInitialized;
  });

  it('resolves immediately when webengageInitialized is true', async () => {
    window.webengageInitialized = true;

    await expect(waitForWebEngageReady()).resolves.toBe(true);
  });

  it('waits for onReady before resolving', async () => {
    const onReady = jest.fn((callback: () => void) => {
      window.webengageInitialized = true;
      callback();
    });

    window.webengage = {
      init: jest.fn(),
      track: jest.fn(),
      onReady,
    };

    await expect(waitForWebEngageReady()).resolves.toBe(true);
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('runs callbacks immediately when SDK is initialized', () => {
    window.webengageInitialized = true;
    const callback = jest.fn();

    runWhenWebEngageReady(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(isWebEngageSdkInitialized()).toBe(true);
  });
});
