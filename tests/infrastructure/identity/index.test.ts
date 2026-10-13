import {
  identityProvider,
  kwikpassAdapter,
  waitForKwikpassSdk,
} from '@/infrastructure/identity';

describe('infrastructure/identity barrel', () => {
  it('exports kwikpass adapter as active identity provider', () => {
    expect(identityProvider).toBe(kwikpassAdapter);
  });

  it('re-exports waitForKwikpassSdk', async () => {
    window.__KP_LOGIN_SDK_INSTANCE__ = { handleKpLogin: jest.fn() };
    await expect(waitForKwikpassSdk(500)).resolves.toBe(true);
  });
});
