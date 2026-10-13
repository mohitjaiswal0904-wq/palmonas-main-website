'use client';

/**
 * Account shell nav hook — re-exports the provider-backed hook so UI
 * imports stay on the `hooks/` layer (UI → hooks → providers).
 */
export {
  AccountShellNavProvider,
  useAccountShellNav,
  type AccountShellNavValue,
} from '@/providers/account/AccountShellNavProvider';
