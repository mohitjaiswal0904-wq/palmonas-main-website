/** @jest-environment node */

import { initializeKwikpassDom, kwikpassAdapter, waitForKwikpassSdk } from '@/infrastructure/gokwik/identity';

describe('gokwik identity (SSR)', () => {
  it('waitForKwikpassSdk resolves false without window', async () => {
    await expect(waitForKwikpassSdk()).resolves.toBe(false);
  });

  it('isReady returns false without window', () => {
    expect(kwikpassAdapter.isReady()).toBe(false);
  });

  it('initializeKwikpassDom is a no-op without window', () => {
    expect(() => initializeKwikpassDom()).not.toThrow();
  });

  it('openLogin is a no-op without window', () => {
    expect(() => kwikpassAdapter.openLogin()).not.toThrow();
  });
});
