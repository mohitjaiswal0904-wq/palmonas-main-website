'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface AccountShellNavValue {
  /** Soft-close the open account panel and return to the hub (no Next RSC nav). */
  closeToHub: () => void;
}

const AccountShellNavContext = createContext<AccountShellNavValue | null>(null);

interface AccountShellNavProviderProps {
  value: AccountShellNavValue;
  children: ReactNode;
}

/**
 * Provides soft hub navigation for in-shell account panels.
 * Mounted by {@link AccountSplitLayout}; UI reads via {@link useAccountShellNav}.
 */
export function AccountShellNavProvider({ value, children }: AccountShellNavProviderProps) {
  return (
    <AccountShellNavContext.Provider value={value}>{children}</AccountShellNavContext.Provider>
  );
}

/**
 * Soft account-shell nav, or `null` outside the account shell provider.
 */
export function useAccountShellNav(): AccountShellNavValue | null {
  return useContext(AccountShellNavContext);
}
