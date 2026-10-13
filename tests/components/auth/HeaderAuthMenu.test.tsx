/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { HeaderAuthMenu } from '@/components/auth/HeaderAuthMenu';
import { AuthContext } from '@/providers/auth/auth.context';
import type { AuthContextValue } from '@/types/auth/auth.types';

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

function renderWithAuth(value: Partial<AuthContextValue>, compact = false) {
  const guardNavigation = jest.fn();
  const defaults: AuthContextValue = {
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
    logout: jest.fn().mockResolvedValue(undefined),
    guardAction: jest.fn(),
    guardNavigation,
    guardModal: jest.fn(),
    guardApi: jest.fn(),
    patchSessionUser: jest.fn(),
  };

  const contextValue = { ...defaults, ...value };

  const view = render(
    <AuthContext.Provider value={contextValue}>
      <HeaderAuthMenu compact={compact} />
    </AuthContext.Provider>,
  );

  return { ...view, guardNavigation: contextValue.guardNavigation };
}

describe('HeaderAuthMenu', () => {
  it('opens KwikPass login for guests instead of linking to account', async () => {
    const user = userEvent.setup();
    const { guardNavigation } = renderWithAuth({});

    const button = screen.getByRole('button', { name: 'Account' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument();

    await user.click(button);

    expect(guardNavigation).toHaveBeenCalledWith('/account');
  });

  it('uses the compact icon width inside the mobile utility bar', () => {
    renderWithAuth({}, true);

    expect(screen.getByRole('button', { name: 'Account' })).toHaveClass('h-6', 'w-6', 'shrink-0');
  });

  it('shows bootstrapping skeleton while session loads', () => {
    renderWithAuth({ isBootstrapping: true });

    const skeleton = document.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('rounded-full');
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument();
  });

  it('links authenticated users to the account hub without a dropdown', () => {
    renderWithAuth({
      session: {
        user: {
          id: 'user-1',
          isGuest: false,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phoneNumber: null,
          profilePicture: null,
          gender: '',
        },
        claims: {
          userId: 'user-1',
          sessionId: 'sess-1',
          isGuest: false,
          shopifyCustomerId: null,
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
      isGuest: false,
      isAuthenticated: true,
    });

    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/account');
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
  });

  it('shows spinner instead of the account control when login is syncing', () => {
    renderWithAuth({
      loginStatus: 'syncing',
      isLoggingIn: true,
    });

    const busy = screen.getByLabelText('Account');
    expect(busy).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
  });
});
