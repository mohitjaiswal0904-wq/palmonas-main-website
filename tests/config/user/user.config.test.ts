import { USER_WALLET_CACHE_MS, userConfig, userMessages } from '@/config/user/user.config';

describe('user.config', () => {
  it('exposes wallet cache timing', () => {
    expect(USER_WALLET_CACHE_MS).toBe(30_000);
    expect(userConfig.walletCacheMs).toBe(30_000);
  });

  it('exposes wallet messages for localization', () => {
    expect(userMessages.walletLabel).toBe('Palmonas Wallet');
    expect(userMessages.errors.fetchWallet).toBe('Failed to fetch wallet balance');
  });
});
