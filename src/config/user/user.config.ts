import rawConfig from '@/config/user/user.config.json';

export type UserConfig = typeof rawConfig;

export const userConfig = rawConfig as UserConfig;

/** Localization-ready user-facing copy for wallet and account flows. */
export const userMessages = userConfig.messages;

export const USER_WALLET_CACHE_MS = userConfig.walletCacheMs;
