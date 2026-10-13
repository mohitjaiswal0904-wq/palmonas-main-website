'use client';

import { createContext, useContext } from 'react';

import type { AuthContextValue } from '@/types/auth/auth.types';

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Access auth session and actions from React context.
 *
 * @returns Auth context value from nearest AuthProvider.
 * @throws Error when used outside AuthProvider.
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
