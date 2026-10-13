import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import React, { useEffect } from 'react';

import { authMessages } from '@/config/auth/auth.config';
import { useAuthContext } from '@/providers/auth/auth.context';
import { AuthProvider } from '@/providers/auth/AuthProvider';
import * as repository from '@/repositories/auth/auth.repository';
import { ensureKwikpassReady, identityProvider, loginErrorForConfigProbe, probeKwikpassConfigApi } from '@/infrastructure/identity';
import type { AuthContextValue } from '@/types/auth/auth.types';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/repositories/auth/auth.repository');

jest.mock('@/repositories/cart/cart.repository', () => ({
  resolveCartIdForLoginFlow: jest.fn().mockResolvedValue(undefined),
}));

const mockBeginGuestCartMergeFromStore = jest.fn().mockResolvedValue(undefined);

jest.mock('@/services/cart/guest-cart-merge.service', () => ({
  beginGuestCartMergeFromStore: (...args: unknown[]) => mockBeginGuestCartMergeFromStore(...args),
}));

const mockResolveCartIdForLoginFlow = jest.requireMock('@/repositories/cart/cart.repository')
  .resolveCartIdForLoginFlow as jest.Mock;

import { createUseToastMock } from '@tests/test-utils/mock-use-toast';

const toastMock = createUseToastMock();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => toastMock,
}));

jest.mock('@/lib/api', () => ({
  registerSessionInvalidationHandler: jest.fn((handler: () => void) => {
    sessionInvalidationHandler = handler;
    return () => {
      if (sessionInvalidationHandler === handler) {
        sessionInvalidationHandler = undefined;
      }
    };
  }),
  registerTokenRefreshHandler: jest.fn(() => () => undefined),
}));

let sessionInvalidationHandler: (() => void) | undefined;

jest.mock('@/lib/auth/auth.client', () => ({
  ...jest.requireActual('@/lib/auth/auth.client'),
  getRefreshToken: jest.fn(),
}));

jest.mock('@/config/auth/mock-auth.config', () => ({
  ...jest.requireActual('@/config/auth/mock-auth.config'),
  isMockAuthEnabled: jest.fn(() => false),
}));

import { isMockAuthEnabled } from '@/config/auth/mock-auth.config';
import * as authClient from '@/lib/auth/auth.client';

const mockIsMockAuthEnabled = isMockAuthEnabled as jest.MockedFunction<typeof isMockAuthEnabled>;
const mockGetRefreshToken = authClient.getRefreshToken as jest.MockedFunction<
  typeof authClient.getRefreshToken
>;

let kwikPassOnLoaded: (() => void) | undefined;
let kwikPassOnLoadFailed: ((reason: string) => void) | undefined;
let autoLoadKwikPass = true;
let authSuccessHandler: ((payload: { kpToken: string }) => void | Promise<void>) | undefined;
let authErrorHandler: ((error: { message: string }) => void) | undefined;
let authCancelHandler: (() => void) | undefined;

jest.mock('@/infrastructure/identity', () => ({
  ensureKwikpassReady: jest.fn(),
  identityProvider: {
    waitForReady: jest.fn(),
    openLogin: jest.fn(),
    logout: jest.fn(),
    onAuthSuccess: jest.fn((cb: (payload: { kpToken: string }) => void) => {
      authSuccessHandler = cb;
      return () => {
        authSuccessHandler = undefined;
      };
    }),
    onAuthError: jest.fn((cb: (error: { message: string }) => void) => {
      authErrorHandler = cb;
      return () => {
        authErrorHandler = undefined;
      };
    }),
    onAuthCancel: jest.fn((cb: () => void) => {
      authCancelHandler = cb;
      return () => {
        authCancelHandler = undefined;
      };
    }),
  },
  KwikPass: ({
    onLoaded,
    onSdkReady,
    onLoadFailed,
  }: {
    onLoaded?: () => void;
    onSdkReady?: () => void;
    onLoadFailed?: (reason: string) => void;
  }) => {
    React.useEffect(() => {
      kwikPassOnLoaded = onLoaded;
      kwikPassOnLoadFailed = onLoadFailed;
      if (autoLoadKwikPass) {
        onLoaded?.();
        onSdkReady?.();
      }
    }, [onLoaded, onSdkReady, onLoadFailed]);
    return null;
  },
  getKwikpassEnvSnapshot: () => ({
    mid: 'test-mid',
    environment: 'sandbox',
    baseUrl: 'https://sandbox.pdp.gokwik.co',
    shopDomain: 'palmonas.myshopify.com',
  }),
  probeKwikpassConfigApi: jest.fn().mockResolvedValue({ result: 'error', status: 0 }),
  loginErrorForConfigProbe: jest.fn(() => authMessages.sdkNotReady),
}));

jest.mock('@/components/auth/AuthLoginStatusOverlay', () => ({
  AuthLoginStatusOverlay: () => null,
}));

const mockRepository = repository as jest.Mocked<typeof repository>;
const mockIdentity = identityProvider as jest.Mocked<typeof identityProvider>;
const mockEnsureKwikpassReady = ensureKwikpassReady as jest.MockedFunction<
  typeof ensureKwikpassReady
>;
const mockProbeKwikpassConfigApi = probeKwikpassConfigApi as jest.MockedFunction<
  typeof probeKwikpassConfigApi
>;
const mockLoginErrorForConfigProbe = loginErrorForConfigProbe as jest.MockedFunction<
  typeof loginErrorForConfigProbe
>;

const guestSession: NonNullable<AuthContextValue['session']> = {
  user: {
    id: 'guest-1',
    firstName: null,
    lastName: null,
    email: null,
    phoneNumber: null,
    profilePicture: null,
    gender: 'prefer-not-to-say',
    isGuest: true,
  },
  claims: {
    userId: 'guest-1',
    sessionId: 'sess-1',
    isGuest: true,
    shopifyCustomerId: null,
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  },
};

const authedSession: NonNullable<AuthContextValue['session']> = {
  user: { ...guestSession.user, id: 'user-1', isGuest: false, firstName: 'Jane' },
  claims: { ...guestSession.claims, userId: 'user-1', isGuest: false },
};

function asAuthResult(
  session: NonNullable<AuthContextValue['session']>,
  demotedFromAuthenticated = false,
) {
  return { session, demotedFromAuthenticated };
}

function AuthProbe({
  onReady,
}: {
  onReady: (ctx: AuthContextValue) => void;
}) {
  const ctx = useAuthContext();
  useEffect(() => {
    onReady(ctx);
  }, [ctx, onReady]);
  return (
    <div>
      <button type="button" onClick={() => ctx.startLogin()}>
        Start login
      </button>
      <button
        type="button"
        onClick={() =>
          ctx.guardAction(() => undefined, { actionId: 'cart.checkout', loginType: 'checkout' })
        }
      >
        Guard action
      </button>
      <button type="button" onClick={() => ctx.guardNavigation('/cart')}>
        Guard nav public
      </button>
      <button type="button" onClick={() => ctx.guardNavigation('/checkout')}>
        Guard nav protected
      </button>
      <button type="button" onClick={() => ctx.guardModal(() => undefined, { modalId: 'checkout.address' })}>
        Guard modal
      </button>
      <button
        type="button"
        onClick={() => {
          void ctx.guardApi(async () => 'ok', { apiId: 'cart.addItem' });
        }}
      >
        Guard api
      </button>
      <button type="button" onClick={() => ctx.guardAction(() => undefined)}>
        Guard action bare
      </button>
      <button type="button" onClick={() => ctx.guardModal(() => undefined)}>
        Guard modal bare
      </button>
      <button
        type="button"
        onClick={() => {
          void ctx.guardApi(async () => 'bare');
        }}
      >
        Guard api bare
      </button>
      <button type="button" onClick={() => void ctx.logout()}>
        Logout
      </button>
      <button type="button" onClick={() => ctx.retryLogin()}>
        Retry login
      </button>
      <button type="button" onClick={() => ctx.dismissLoginStatus()}>
        Dismiss
      </button>
      <span data-testid="login-status">{ctx.loginStatus}</span>
      <span data-testid="bootstrap">{String(ctx.isBootstrapping)}</span>
      <span data-testid="error">{ctx.error ?? ''}</span>
      <span data-testid="login-error">{ctx.loginError ?? ''}</span>
    </div>
  );
}

function TestAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

async function renderProvider(session: AuthContextValue['session'] = guestSession) {
  mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(session!));
  render(
    <TestAuthProvider>
      <AuthProbe onReady={() => undefined} />
      <div data-testid="child">child</div>
    </TestAuthProvider>,
  );
  await waitFor(() => {
    expect(screen.getByTestId('bootstrap')).toHaveTextContent('false');
  });
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    autoLoadKwikPass = true;
    mockSearchParams = new URLSearchParams();
    mockIdentity.waitForReady.mockResolvedValue(true);
    mockEnsureKwikpassReady.mockResolvedValue(true);
    mockProbeKwikpassConfigApi.mockResolvedValue({ result: 'error', status: 0 });
    mockLoginErrorForConfigProbe.mockReturnValue(authMessages.sdkNotReady);
    mockGetRefreshToken.mockReturnValue('refresh-token');
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(guestSession));
    mockRepository.completeKwikpassLogin.mockResolvedValue(authedSession);
    mockRepository.logoutAndResetSession.mockResolvedValue(guestSession);
    mockRepository.refreshAuthSession.mockResolvedValue(asAuthResult(guestSession));
    mockRepository.recoverAuthSession.mockResolvedValue(asAuthResult(guestSession));
    mockBeginGuestCartMergeFromStore.mockResolvedValue(undefined);
    mockIsMockAuthEnabled.mockReturnValue(false);
    sessionInvalidationHandler = undefined;
  });

  it('bootstraps auth session on mount', async () => {
    await renderProvider();
    expect(mockRepository.bootstrapAuthSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies bootstrap session after React Strict Mode remount', async () => {
    let latest: AuthContextValue | undefined;
    mockRepository.bootstrapAuthSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          queueMicrotask(() => resolve(asAuthResult(guestSession)));
        }),
    );

    render(
      <React.StrictMode>
        <TestAuthProvider>
          <AuthProbe
            onReady={(value) => {
              latest = value;
            }}
          />
        </TestAuthProvider>
      </React.StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('bootstrap')).toHaveTextContent('false');
    });
    expect(latest?.session?.user.id).toBe(guestSession.user.id);
    expect(latest?.isGuest).toBe(true);
  });

  it('does not re-run bootstrap when provider re-renders', async () => {
    const { rerender } = render(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );

    await waitFor(() => {
      expect(mockRepository.bootstrapAuthSession).toHaveBeenCalledTimes(1);
    });

    rerender(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );

    expect(mockRepository.bootstrapAuthSession).toHaveBeenCalledTimes(1);
  });

  it('calls recoverAuthSession on session invalidation, not refreshAuthSession', async () => {
    await renderProvider(authedSession);

    expect(sessionInvalidationHandler).toBeDefined();
    await act(async () => {
      sessionInvalidationHandler?.();
    });

    await waitFor(() => {
      expect(mockRepository.recoverAuthSession).toHaveBeenCalled();
    });
    expect(mockRepository.refreshAuthSession).not.toHaveBeenCalled();
  });

  it('sets bootstrap error when session bootstrap fails', async () => {
    mockRepository.bootstrapAuthSession.mockRejectedValue(new Error('bootstrap failed'));
    render(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Could not start your session');
    });
  });

  it('registers identity provider listeners', async () => {
    await renderProvider();
    expect(mockIdentity.onAuthSuccess).toHaveBeenCalled();
    expect(mockIdentity.onAuthError).toHaveBeenCalled();
    expect(mockIdentity.onAuthCancel).toHaveBeenCalled();
  });

  it('shows loading status when scripts are not yet loaded', async () => {
    const user = userEvent.setup();
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 50)),
    );
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    expect(screen.getByTestId('login-status')).toHaveTextContent('loading');
    await waitFor(() => expect(mockIdentity.openLogin).toHaveBeenCalled());
  });

  it('opens KwikPass when startLogin is called and SDK is ready', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => {
      expect(mockIdentity.openLogin).toHaveBeenCalled();
      expect(screen.getByTestId('login-status')).toHaveTextContent('idle');
    });
  });

  it('clears vendor login tracking when KwikPass is opened then cancelled', async () => {
    const user = userEvent.setup();
    let ctx: AuthContextValue | undefined;

    render(
      <TestAuthProvider>
        <AuthProbe
          onReady={(value) => {
            ctx = value;
          }}
        />
      </TestAuthProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => {
      expect(mockIdentity.openLogin).toHaveBeenCalled();
      expect(ctx?.isLoggingIn).toBe(true);
    });
    expect(screen.getByTestId('login-status')).toHaveTextContent('idle');

    act(() => {
      authCancelHandler?.();
    });

    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('idle');
      expect(ctx?.isLoggingIn).toBe(false);
    });
  });

  it('shows SDK timeout error when ensureKwikpassReady fails', async () => {
    const user = userEvent.setup();
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockResolvedValue(false);
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
      expect(screen.getByTestId('login-error')).toHaveTextContent('KwikPass could not initialize');
    });
  });

  it('completes login when identity reports success', async () => {
    await renderProvider();
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => {
      expect(mockResolveCartIdForLoginFlow).toHaveBeenCalledWith('jwe');
      expect(mockRepository.completeKwikpassLogin).toHaveBeenCalledWith('kp-token', 'jwe', {
        cartId: undefined,
        cartItems: undefined,
        couponCodes: undefined,
      });
      expect(screen.getByTestId('login-status')).toHaveTextContent('success');
    });
    expect(mockBeginGuestCartMergeFromStore).not.toHaveBeenCalled();
  });

  it('awaits guest cart merge before pending navigation on checkout login', async () => {
    const callOrder: string[] = [];
    let resolveMerge!: () => void;
    mockBeginGuestCartMergeFromStore.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          callOrder.push('merge-start');
          resolveMerge = () => {
            callOrder.push('merge-end');
            resolve();
          };
        }),
    );

    let ctx: AuthContextValue | null = null;
    const pendingAction = jest.fn(() => {
      callOrder.push('pending-action');
    });

    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(guestSession));
    render(
      <TestAuthProvider>
        <AuthProbe
          onReady={(value) => {
            ctx = value;
          }}
        />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    await act(async () => {
      ctx!.guardAction(pendingAction, { actionId: 'cart.checkout', loginType: 'checkout' });
    });

    let authPromise!: Promise<void>;
    await act(async () => {
      authPromise = Promise.resolve(authSuccessHandler?.({ kpToken: 'kp-token' }));
    });

    await waitFor(() => expect(callOrder).toEqual(['merge-start']));
    expect(pendingAction).not.toHaveBeenCalled();

    await act(async () => {
      resolveMerge();
      await authPromise;
    });

    await waitFor(() => {
      expect(callOrder).toEqual(['merge-start', 'merge-end', 'pending-action']);
      expect(pendingAction).toHaveBeenCalled();
    });
  });

  it('begins guest cart merge on checkout login before pending navigation', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard action' }));
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => {
      expect(mockResolveCartIdForLoginFlow).toHaveBeenCalledWith('checkout');
      expect(mockBeginGuestCartMergeFromStore).toHaveBeenCalled();
      expect(screen.getByTestId('login-status')).toHaveTextContent('success');
    });
  });

  it('shows login error when backend login fails', async () => {
    mockRepository.completeKwikpassLogin.mockRejectedValue(new Error('backend down'));
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
    });
  });

  it('handles identity auth error during login attempt', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    act(() => {
      authErrorHandler?.({ message: 'OTP failed' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
      expect(screen.getByTestId('login-error')).toHaveTextContent('OTP failed');
    });
  });

  it('dismisses login status on identity cancel', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    act(() => {
      authCancelHandler?.();
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('idle');
    });
  });

  it('runs guard action immediately for authenticated session', async () => {
    const action = jest.fn();
    let ctx: AuthContextValue | null = null;

    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));
    render(
      <TestAuthProvider>
        <AuthProbe
          onReady={(value) => {
            ctx = value;
          }}
        />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(ctx?.isAuthenticated).toBe(true));

    act(() => {
      ctx!.guardAction(action, { actionId: 'cart.checkout' });
    });
    expect(action).toHaveBeenCalled();
    expect(mockIdentity.openLogin).not.toHaveBeenCalled();
  });

  it('starts login when guest uses guard action', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard action' }));
    await waitFor(() => {
      expect(mockIdentity.openLogin).toHaveBeenCalled();
    });
  });

  it('navigates directly for public routes when guest uses guardNavigation', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard nav public' }));
    expect(mockPush).toHaveBeenCalledWith('/cart');
    expect(mockIdentity.openLogin).not.toHaveBeenCalled();
  });

  it('starts login for protected navigation when guest', async () => {
    const user = userEvent.setup();
    await renderProvider();
    mockPush.mockClear();
    await user.click(screen.getByRole('button', { name: 'Guard nav protected' }));
    expect(mockPush).not.toHaveBeenCalled();
    await waitFor(() => expect(mockIdentity.openLogin).toHaveBeenCalled());
  });

  it('opens modal immediately for authenticated user', async () => {
    const open = jest.fn();
    let ctx: AuthContextValue | null = null;
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(ctx?.isAuthenticated).toBe(true));
    act(() => {
      ctx!.guardModal(open, { modalId: 'checkout.address' });
    });
    expect(open).toHaveBeenCalled();
  });

  it('starts login when guest uses guardModal', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard modal' }));
    await waitFor(() => expect(mockIdentity.openLogin).toHaveBeenCalled());
  });

  it('runs guardApi immediately for authenticated user', async () => {
    let ctx: AuthContextValue | null = null;
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(ctx?.isAuthenticated).toBe(true));
    await expect(
      ctx!.guardApi(async () => 'payload', { apiId: 'cart.addItem' }),
    ).resolves.toBe('payload');
  });

  it('starts login when guest uses guardApi', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard api' }));
    await waitFor(() => expect(mockIdentity.openLogin).toHaveBeenCalled());
  });

  it('rejects guardApi when login overlay is dismissed', async () => {
    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    let apiPromise!: Promise<string>;
    await act(async () => {
      apiPromise = ctx!.guardApi(async () => 'cart-ok', { apiId: 'cart.addItem' });
    });
    const rejection = expect(apiPromise).rejects.toMatchObject({ name: 'LoginCancelledError' });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    await rejection;
  });

  it('rejects guardApi when mock login modal is closed', async () => {
    mockIsMockAuthEnabled.mockReturnValue(true);
    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    let apiPromise!: Promise<string>;
    await act(async () => {
      apiPromise = ctx!.guardApi(async () => 'wishlist-ok', { apiId: 'wishlist.add' });
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Login' })).toBeInTheDocument();
    });

    const rejection = expect(apiPromise).rejects.toMatchObject({ name: 'LoginCancelledError' });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await rejection;
  });

  it('rejects guardApi when KwikPass reports an auth error', async () => {
    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    let apiPromise!: Promise<string>;
    await act(async () => {
      apiPromise = ctx!.guardApi(async () => 'wishlist-ok', { apiId: 'wishlist.add' });
    });

    const rejection = expect(apiPromise).rejects.toMatchObject({ name: 'LoginCancelledError' });
    await act(async () => {
      authErrorHandler?.({ message: 'KwikPass closed' });
    });
    await rejection;
  });

  it('logs out and resets session', async () => {
    const user = userEvent.setup();
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));
    await renderProvider(authedSession);
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => {
      expect(mockRepository.logoutAndResetSession).toHaveBeenCalled();
      expect(mockIdentity.logout).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
    expect(
      mockRepository.logoutAndResetSession.mock.invocationCallOrder[0],
    ).toBeLessThan(mockIdentity.logout.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER);
  });

  it('redirects after login when redirect query param is allowlisted', async () => {
    mockSearchParams = new URLSearchParams('redirect=/cart');
    await renderProvider();
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/cart');
    });
  });

  it('shows login error when backend returns AppError', async () => {
    const { AppError } = await import('@/lib/errors');
    mockRepository.completeKwikpassLogin.mockRejectedValue(
      new AppError('VALIDATION', 'Invalid OTP'),
    );
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toHaveTextContent('Invalid OTP');
    });
  });

  it('sets logout error when logoutAndResetSession fails', async () => {
    const user = userEvent.setup();
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));
    mockRepository.logoutAndResetSession.mockRejectedValue(new Error('logout failed'));
    await renderProvider(authedSession);
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Logout failed');
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('retries ensureKwikpassReady when startLogin is called after a script failure', async () => {
    const user = userEvent.setup();
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockResolvedValue(true);
    await renderProvider();
    act(() => {
      kwikPassOnLoadFailed?.('network_error');
    });
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => {
      expect(mockEnsureKwikpassReady).toHaveBeenCalled();
      expect(mockIdentity.openLogin).toHaveBeenCalled();
    });
  });

  it('refreshes session when token is near expiry', async () => {
    const expiringSession = {
      ...guestSession,
      claims: {
        ...guestSession.claims,
        expiresAt: Math.floor(Date.now() / 1000) + 60,
      },
    };
    jest.useFakeTimers();
    await renderProvider(expiringSession);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    await waitFor(() => {
      expect(mockRepository.refreshAuthSession).toHaveBeenCalled();
    });
    jest.useRealTimers();
  });

  it('does not refresh expired session when refresh cookie is absent', async () => {
    mockGetRefreshToken.mockReturnValue(undefined);
    const expiredSession = {
      ...guestSession,
      claims: {
        ...guestSession.claims,
        expiresAt: Math.floor(Date.now() / 1000) - 10,
      },
    };
    await renderProvider(expiredSession);
    await waitFor(() => {
      expect(screen.getByTestId('bootstrap')).toHaveTextContent('false');
    });
    expect(mockRepository.refreshAuthSession).not.toHaveBeenCalled();
  });

  it('refreshes session immediately when token already expired', async () => {
    const expiredSession = {
      ...guestSession,
      claims: {
        ...guestSession.claims,
        expiresAt: Math.floor(Date.now() / 1000) - 10,
      },
    };
    await renderProvider(expiredSession);
    await waitFor(() => {
      expect(mockRepository.refreshAuthSession).toHaveBeenCalled();
    });
  });

  it('auto-opens login from login query before SDK is ready', async () => {
    mockSearchParams = new URLSearchParams('login=1');
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockResolvedValue(true);
    render(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );
    await waitFor(() => {
      expect(mockEnsureKwikpassReady).toHaveBeenCalled();
      expect(mockIdentity.openLogin).toHaveBeenCalled();
    });
  });

  it('shows script load error when KwikPass fails during login query', async () => {
    mockSearchParams = new URLSearchParams('login=1');
    render(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(kwikPassOnLoadFailed).toBeDefined());
    act(() => {
      kwikPassOnLoadFailed?.('network_error');
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
    });
  });

  it('retryLogin resets identity attempt and starts login again', async () => {
    const user = userEvent.setup();
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => expect(screen.getByTestId('login-status')).toHaveTextContent('error'));
    autoLoadKwikPass = true;
    await user.click(screen.getByRole('button', { name: 'Retry login' }));
    await waitFor(() => expect(mockIdentity.openLogin).toHaveBeenCalled());
  });

  it('navigates protected routes when user is authenticated', async () => {
    const user = userEvent.setup();
    await renderProvider(authedSession);
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));
    await user.click(screen.getByRole('button', { name: 'Guard nav protected' }));
    expect(mockPush).toHaveBeenCalledWith('/checkout');
  });

  it('ignores identity errors when login was not attempted', async () => {
    await renderProvider();
    act(() => {
      authErrorHandler?.({ message: 'Unexpected vendor error' });
    });
    expect(screen.getByTestId('login-status')).toHaveTextContent('idle');
  });

  it('auto-dismisses success status after login completes', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockRepository.completeKwikpassLogin.mockResolvedValue(authedSession);
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => expect(screen.getByTestId('login-status')).toHaveTextContent('success'));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => expect(screen.getByTestId('login-status')).toHaveTextContent('idle'));
    jest.useRealTimers();
  });

  it('resolves guardApi after guest completes login', async () => {
    mockRepository.completeKwikpassLogin.mockResolvedValue(authedSession);
    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    let apiPromise!: Promise<string>;
    await act(async () => {
      apiPromise = ctx!.guardApi(async () => 'cart-ok', { apiId: 'cart.addItem' });
    });
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await expect(apiPromise).resolves.toBe('cart-ok');
  });

  it('shows sdk timeout error when ensureKwikpassReady fails after startLogin', async () => {
    const user = userEvent.setup();
    autoLoadKwikPass = false;
    mockEnsureKwikpassReady.mockResolvedValue(false);
    mockProbeKwikpassConfigApi.mockResolvedValue({ result: 'forbidden', status: 403 });
    mockLoginErrorForConfigProbe.mockReturnValue(authMessages.domainNotAllowed);
    await renderProvider();
    act(() => {
      kwikPassOnLoadFailed?.('network_error');
    });
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    await waitFor(() => {
      expect(mockProbeKwikpassConfigApi).toHaveBeenCalledWith('test-mid');
      expect(screen.getByTestId('login-error')).toHaveTextContent('GoKwik blocked this domain');
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
    });
  });

  it('schedules proactive token refresh before expiry', async () => {
    jest.useFakeTimers();
    const nearExpirySession = {
      ...guestSession,
      claims: {
        ...guestSession.claims,
        expiresAt: Math.floor(Date.now() / 1000) + 400,
      },
    };
    mockRepository.refreshAuthSession.mockResolvedValue(asAuthResult(nearExpirySession));
    await renderProvider(nearExpirySession);
    await act(async () => {
      jest.advanceTimersByTime(101_000);
      await Promise.resolve();
    });
    await waitFor(() => expect(mockRepository.refreshAuthSession).toHaveBeenCalled());
    jest.useRealTimers();
  });

  it('ignores script load failures before login is attempted', async () => {
    await renderProvider();
    act(() => {
      kwikPassOnLoadFailed?.('network_error');
    });
    expect(screen.getByTestId('login-status')).toHaveTextContent('idle');
    expect(screen.getByTestId('login-error')).toHaveTextContent('');
  });

  it('uses fallback kwikpass error message when vendor error is empty', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Start login' }));
    act(() => {
      authErrorHandler?.({ message: '' });
    });
    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('error');
      expect(screen.getByTestId('login-error').textContent).not.toBe('');
    });
  });

  it('runs pending action after login when redirect param is absent', async () => {
    const user = userEvent.setup();
    const pendingAction = jest.fn();
    mockRepository.completeKwikpassLogin.mockResolvedValue(authedSession);

    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe
          onReady={(value) => {
            ctx = value;
          }}
        />
      </TestAuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));

    await act(async () => {
      ctx!.guardAction(pendingAction, { actionId: 'cart.checkout' });
    });
    await act(async () => {
      await authSuccessHandler?.({ kpToken: 'kp-token' });
    });
    await waitFor(() => expect(pendingAction).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('starts login from guard helpers when session is still null', async () => {
    let resolveBootstrap: ((session: typeof guestSession) => void) | undefined;
    mockRepository.bootstrapAuthSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBootstrap = (session) => resolve(asAuthResult(session));
        }),
    );

    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe onReady={(value) => { ctx = value; }} />
      </TestAuthProvider>,
    );

    await waitFor(() => expect(ctx?.isBootstrapping).toBe(true));
    await act(async () => {
      ctx!.guardAction(() => undefined);
    });
    expect(ctx?.isLoggingIn).toBe(true);

    await act(async () => {
      resolveBootstrap?.(guestSession);
      await Promise.resolve();
    });
    await waitFor(() => expect(screen.getByTestId('bootstrap')).toHaveTextContent('false'));
  });

  it('shows session expired toast when bootstrap demotes authenticated user', async () => {
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(guestSession, true));
    render(
      <TestAuthProvider>
        <AuthProbe onReady={() => undefined} />
      </TestAuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('bootstrap')).toHaveTextContent('false');
    });
    expect(toastMock.showWarning).toHaveBeenCalledWith(authMessages.errors.sessionExpired);
  });

  it('does not show session expired toast for guest bootstrap', async () => {
    await renderProvider();
    expect(toastMock.showWarning).not.toHaveBeenCalledWith(authMessages.errors.sessionExpired);
  });

  it('shows session expired toast when proactive refresh demotes user', async () => {
    mockRepository.refreshAuthSession.mockResolvedValue(asAuthResult(guestSession, true));
    const expiredSession = {
      ...authedSession,
      claims: {
        ...authedSession.claims,
        expiresAt: Math.floor(Date.now() / 1000) - 10,
      },
    };
    await renderProvider(expiredSession);
    await waitFor(() => {
      expect(mockRepository.refreshAuthSession).toHaveBeenCalled();
      expect(toastMock.showWarning).toHaveBeenCalledWith(authMessages.errors.sessionExpired);
    });
  });

  it('shows logout success toast after manual logout', async () => {
    const user = userEvent.setup();
    await renderProvider(authedSession);
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    await waitFor(() => {
      expect(toastMock.showSuccess).toHaveBeenCalledWith(authMessages.success.logout);
    });
  });

  it('supports guard helpers without registry ids', async () => {
    const user = userEvent.setup();
    await renderProvider();
    await user.click(screen.getByRole('button', { name: 'Guard action bare' }));
    await user.click(screen.getByRole('button', { name: 'Guard modal bare' }));
    await user.click(screen.getByRole('button', { name: 'Guard api bare' }));
    expect(mockIdentity.openLogin).toHaveBeenCalled();
  });

  it('patchSessionUser updates session user and persists auth snapshot', async () => {
    mockRepository.bootstrapAuthSession.mockResolvedValue(asAuthResult(authedSession));

    let ctx: AuthContextValue | undefined;
    render(
      <TestAuthProvider>
        <AuthProbe
          onReady={(value) => {
            ctx = value;
          }}
        />
      </TestAuthProvider>,
    );

    await waitFor(() => expect(ctx?.isAuthenticated).toBe(true));

    act(() => {
      ctx!.patchSessionUser({ firstName: 'Updated', lastName: 'Name' });
    });

    expect(ctx?.session?.user.firstName).toBe('Updated');
    expect(ctx?.session?.user.lastName).toBe('Name');
    expect(authClient.getStoredAuthUser()?.firstName).toBe('Updated');
    expect(authClient.getStoredAuthUser()?.lastName).toBe('Name');
  });
});
