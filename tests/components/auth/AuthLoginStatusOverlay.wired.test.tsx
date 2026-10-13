import { render, screen } from '@testing-library/react';

import { AuthLoginStatusOverlay } from '@/components/auth/AuthLoginStatusOverlay';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

let authCancelHandler: (() => void) | undefined;

const mockOnAuthCancel = jest.fn((callback: () => void) => {
  authCancelHandler = callback;
  return jest.fn();
});

jest.mock('@/config/auth/mock-auth.config', () => ({
  isMockAuthEnabled: jest.fn(() => false),
}));

jest.mock('@/infrastructure/identity', () => ({
  identityProvider: {
    onAuthCancel: (callback: () => void) => mockOnAuthCancel(callback),
  },
}));

function renderOverlay(ctx: Partial<AuthContextValue>) {
  const value: AuthContextValue = {
    session: null,
    isBootstrapping: false,
    isLoggingIn: true,
    isLoggingOut: false,
    loginStatus: 'opening',
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
    ...ctx,
  };

  return render(
    <AuthContext.Provider value={value}>
      <AuthLoginStatusOverlay />
    </AuthContext.Provider>,
  );
}

describe('AuthLoginStatusOverlay', () => {
  beforeEach(() => {
    authCancelHandler = undefined;
    mockOnAuthCancel.mockClear();
  });

  it('wires context login status to the view', () => {
    renderOverlay({ loginStatus: 'opening' });
    expect(screen.getByText('Opening secure login…')).toBeInTheDocument();
  });

  it('wires retry and dismiss handlers from context', () => {
    const retryLogin = jest.fn();
    const dismissLoginStatus = jest.fn();

    renderOverlay({
      loginStatus: 'error',
      loginError: 'OTP failed',
      retryLogin,
      dismissLoginStatus,
    });

    screen.getByRole('button', { name: 'Try again' }).click();
    screen.getByRole('button', { name: 'Dismiss' }).click();

    expect(retryLogin).toHaveBeenCalled();
    expect(dismissLoginStatus).toHaveBeenCalled();
  });

  it('subscribes to KwikPass cancel and dismisses login status', () => {
    const dismissLoginStatus = jest.fn();

    renderOverlay({ dismissLoginStatus });

    expect(mockOnAuthCancel).toHaveBeenCalledTimes(1);
    authCancelHandler?.();

    expect(dismissLoginStatus).toHaveBeenCalledTimes(1);
  });
});
