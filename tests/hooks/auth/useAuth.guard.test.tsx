import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useRequireAuth } from '@/hooks/auth/useAuth';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

function createMockContext(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
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
    guardApi: jest.fn().mockResolvedValue(undefined),
    patchSessionUser: jest.fn(),
    ...overrides,
  };
}

function wrapper(ctx: AuthContextValue) {
  return function Provider({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
  };
}

describe('useRequireAuth guards', () => {
  it('exposes guard delegates from context', () => {
    const mockContext = createMockContext();
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.guard).toBe(mockContext.guardAction);
    expect(result.current.guardNavigation).toBe(mockContext.guardNavigation);
    expect(result.current.guardModal).toBe(mockContext.guardModal);
    expect(result.current.guardApi).toBe(mockContext.guardApi);
  });

  it('delegates guard action when unauthenticated', () => {
    const guardAction = jest.fn();
    const mockContext = createMockContext({ guardAction });
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    const action = jest.fn();
    act(() => {
      result.current.guard(action, { actionId: 'reviews.write' });
    });

    expect(guardAction).toHaveBeenCalledWith(action, { actionId: 'reviews.write' });
  });

  it('delegates guardNavigation to context', () => {
    const guardNavigation = jest.fn();
    const mockContext = createMockContext({ guardNavigation });
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    act(() => {
      result.current.guardNavigation('/checkout');
    });

    expect(guardNavigation).toHaveBeenCalledWith('/checkout');
  });

  it('delegates guardModal to context', () => {
    const guardModal = jest.fn();
    const mockContext = createMockContext({ guardModal });
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    const open = jest.fn();
    act(() => {
      result.current.guardModal(open, { modalId: 'checkout.address' });
    });

    expect(guardModal).toHaveBeenCalledWith(open, { modalId: 'checkout.address' });
  });

  it('delegates guardApi to context', async () => {
    const guardApi = jest.fn().mockResolvedValue('ok');
    const mockContext = createMockContext({ guardApi });
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    const fn = jest.fn().mockResolvedValue('data');
    await act(async () => {
      await result.current.guardApi(fn, { apiId: 'cart.addItem' });
    });

    expect(guardApi).toHaveBeenCalledWith(fn, { apiId: 'cart.addItem' });
  });

  it('reports authenticated state from context', () => {
    const mockContext = createMockContext({ isAuthenticated: true, isGuest: false });
    const { result } = renderHook(() => useRequireAuth(), { wrapper: wrapper(mockContext) });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
