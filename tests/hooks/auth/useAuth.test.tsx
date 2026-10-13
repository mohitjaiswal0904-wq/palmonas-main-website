import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useAuth, useRequireAuth } from '@/hooks/auth/useAuth';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

const mockContext: AuthContextValue = {
  session: null,
  isBootstrapping: false,
  isLoggingIn: false,
  isLoggingOut: false,
  loginStatus: 'idle',
  loginError: null,
  error: null,
  isAuthenticated: false,
  isGuest: true,
  startLogin: jest.fn(),
  dismissLoginStatus: jest.fn(),
  expireLoginFlow: jest.fn(),
  retryLogin: jest.fn(),
  logout: jest.fn(),
  guardAction: jest.fn(),
  guardNavigation: jest.fn(),
  guardModal: jest.fn(),
  guardApi: jest.fn(),
  patchSessionUser: jest.fn(),
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={mockContext}>{children}</AuthContext.Provider>;
}

describe('useAuth', () => {
  it('maps context fields to hook API', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isGuest).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.openLogin).toBe(mockContext.startLogin);
    expect(result.current.startLogin).toBe(mockContext.startLogin);
  });
});

describe('useRequireAuth', () => {
  it('exposes guard delegate from context', () => {
    const { result } = renderHook(() => useRequireAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.guard).toBe(mockContext.guardAction);
    expect(result.current.openLogin).toBe(mockContext.startLogin);
  });
});
