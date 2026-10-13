'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from 'react';

import { AuthLoginStatusOverlay } from '@/components/auth/AuthLoginStatusOverlay';
import { MockLoginModal } from '@/components/auth/mock-auth';
import {
  authMessages,
  LOGIN_OVERLAY_TIMEOUT_MS,
  sanitizeAuthRedirect,
  TOKEN_REFRESH_THRESHOLD_SECONDS,
} from '@/config/auth/auth.config';
import { isMockAuthEnabled } from '@/config/auth/mock-auth.config';
import { useToast } from '@/hooks/useToast';
import {
  ensureKwikpassReady,
  getKwikpassEnvSnapshot,
  identityProvider,
  KwikPass,
  loginErrorForConfigProbe,
  probeKwikpassConfigApi,
} from '@/infrastructure/identity';
import type { KwikpassConfigProbeResponse } from '@/infrastructure/identity';
import { registerSessionInvalidationHandler, registerTokenRefreshHandler } from '@/lib/api';
import {
  getRefreshToken,
  isAuthLogoutInFlight,
  isProtectedRoute,
  logKwikpassAuth,
  persistAuthUser,
  warnUnregisteredGuardId,
} from '@/lib/auth/auth.client';
import { LoginCancelledError } from '@/lib/auth/login-cancelled';
import {
  buildCartLoginItemsFromCart,
  resolveCartLoginCouponCodes,
} from '@/lib/cart/cart-login-items';
import { readGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import { isAppError } from '@/lib/errors';
import { AuthContext } from '@/providers/auth/auth.context';
import {
  bootstrapAuthSession,
  completeKwikpassLogin,
  logoutAndResetSession,
  recoverAuthSession,
  refreshAuthSession,
  syncSessionFromStorage,
} from '@/repositories/auth/auth.repository';
import { resolveCartIdForLoginFlow } from '@/repositories/cart/cart.repository';
import { beginGuestCartMergeFromStore } from '@/services/cart/guest-cart-merge.service';
import { useCartStore } from '@/store/cart/cart.store';
import type {
  AuthContextValue,
  AuthSession,
  AuthSessionResult,
  AuthUser,
  LoginStatus,
  LoginType,
} from '@/types/auth/auth.types';
import { isCartLoginType } from '@/types/auth/auth.types';

const LOGIN_SUCCESS_DISMISS_MS = 2000;

/**
 * Maps KwikPass script load failure reason to user-facing overlay copy.
 *
 * @param reason - Failure code from script loader or SDK wait timeout.
 * @returns Localised error message for login overlay.
 */
function loginErrorForScriptFailure(reason: string): string {
  if (reason === 'sdk_timeout') return authMessages.sdkNotReady;
  return authMessages.kwikpassLoadFailed;
}

interface AuthSearchParamsEffectsProps {
  redirectRef: MutableRefObject<string | null>;
  loginQueryOpenRef: MutableRefObject<boolean>;
  loginQueryHandledRef: MutableRefObject<boolean>;
  startLogin: () => void;
}

/**
 * Syncs login deep-link query params after hydration without blocking static routes.
 */
function AuthSearchParamsEffects({
  redirectRef,
  loginQueryOpenRef,
  loginQueryHandledRef,
  startLogin,
}: AuthSearchParamsEffectsProps) {
  const searchParams = useSearchParams();
  const loginQueryOpen = searchParams.get('login') === '1';

  useEffect(() => {
    redirectRef.current = sanitizeAuthRedirect(searchParams.get('redirect'));
    loginQueryOpenRef.current = loginQueryOpen;
  }, [loginQueryOpen, redirectRef, loginQueryOpenRef, searchParams]);

  // Auto-opens login when landing with `?login=1` deep-link.
  useEffect(() => {
    if (!loginQueryOpen || loginQueryHandledRef.current) {
      return undefined;
    }

    loginQueryHandledRef.current = true;
    queueMicrotask(() => {
      startLogin();
    });

    return undefined;
  }, [loginQueryOpen, loginQueryHandledRef, startLogin]);

  return null;
}

/**
 * Provides auth session, KwikPass plugin integration, and login status overlay.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const mockAuthEnabled = isMockAuthEnabled();
  const router = useRouter();
  const { showSuccess, showWarning } = useToast();
  const queryClient = useQueryClient();
  const redirectRef = useRef<string | null>(null);
  const loginQueryOpenRef = useRef(false);
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle');
  const [isVendorLoginActive, setIsVendorLoginActive] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [identityScriptsLoaded, setIdentityScriptsLoaded] = useState(false);
  const [mockLoginOpen, setMockLoginOpen] = useState(false);
  const [mockLoginType, setMockLoginType] = useState<LoginType>('normal');
  const [scriptAttempt, setScriptAttempt] = useState(0);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const pendingGuardRejectRef = useRef<((reason: LoginCancelledError) => void) | null>(null);
  const pendingLoginTypeRef = useRef<LoginType>('jwe');
  const loginQueryHandledRef = useRef(false);
  const loginAttemptedRef = useRef(false);
  const identityLoadFailedRef = useRef<string | null>(null);
  const successDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyAuthSessionRef = useRef<(result: AuthSessionResult) => void>(() => undefined);

  /**
   * Applies repository session result to React context and notifies on auth demotion.
   *
   * @param result - Session from bootstrap, refresh, recovery, or login.
   */
  const applyAuthSession = useCallback(
    (result: AuthSessionResult) => {
      setSession(result.session);
      if (result.demotedFromAuthenticated) {
        showWarning(authMessages.errors.sessionExpired);
      }
    },
    [showWarning],
  );

  useEffect(() => {
    applyAuthSessionRef.current = applyAuthSession;
  }, [applyAuthSession]);

  /** Rejects and clears any guard-backed promise waiting on login. */
  const rejectPendingGuard = useCallback(() => {
    pendingGuardRejectRef.current?.(new LoginCancelledError());
    pendingActionRef.current = null;
    pendingGuardRejectRef.current = null;
  }, []);

  /** Resets login overlay state and clears the auto-dismiss success timer. */
  const dismissLoginStatus = useCallback(() => {
    if (successDismissTimerRef.current) {
      clearTimeout(successDismissTimerRef.current);
      successDismissTimerRef.current = null;
    }
    setLoginStatus('idle');
    setLoginError(null);
    setIsVendorLoginActive(false);
    loginAttemptedRef.current = false;
    rejectPendingGuard();
  }, [rejectPendingGuard]);

  /** Surfaces a timeout error when login loading exceeds the configured limit. */
  const expireLoginFlow = useCallback(() => {
    if (successDismissTimerRef.current) {
      clearTimeout(successDismissTimerRef.current);
      successDismissTimerRef.current = null;
    }
    setLoginError(authMessages.errors.loginTimedOut);
    setLoginStatus('error');
    setIsVendorLoginActive(false);
    loginAttemptedRef.current = false;
    rejectPendingGuard();
  }, [rejectPendingGuard]);

  /** Remounts KwikPass script loader after a prior load or SDK failure. */
  const resetIdentityAttempt = useCallback(() => {
    logKwikpassAuth('retry.reset', 'Resetting KwikPass plugin attempt');
    identityLoadFailedRef.current = null;
    setIdentityScriptsLoaded(false);
    setScriptAttempt((attempt) => attempt + 1);
  }, []);

  /** Runs the deferred callback stored by a guard helper after successful login. */
  const runPendingAction = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    pendingGuardRejectRef.current = null;
    action?.();
  }, []);

  /**
   * Navigates after login: honour `redirect` query or run pending guard action.
   */
  const handlePostLoginNavigation = useCallback(() => {
    const redirect = redirectRef.current;

    if (redirect) {
      router.push(redirect);
      return;
    }
    runPendingAction();
  }, [router, runPendingAction]);

  /**
   * Records KwikPass script failure and surfaces overlay error when login was attempted.
   *
   * @param reason - Script stage that failed (merchant_info, core_script, sdk_timeout, …).
   */
  const handleIdentityLoadFailed = useCallback(
    (reason: string) => {
      identityLoadFailedRef.current = reason;
      logKwikpassAuth('script.load', `KwikPass load failed: ${reason}`, reason);
      if (loginAttemptedRef.current || loginQueryOpenRef.current) {
        setLoginError(loginErrorForScriptFailure(reason));
        setLoginStatus('error');
        rejectPendingGuard();
      }
    },
    [rejectPendingGuard],
  );

  /** Opens login UI — mock modal when enabled, otherwise KwikPass after SDK readiness. */
  const startLogin = useCallback(() => {
    loginAttemptedRef.current = true;
    setLoginError(null);

    if (mockAuthEnabled) {
      setMockLoginType(pendingLoginTypeRef.current);
      setMockLoginOpen(true);
      return;
    }

    setLoginStatus(identityScriptsLoaded ? 'opening' : 'loading');
    logKwikpassAuth('login.open.start', 'Starting KwikPass plugin login');

    identityLoadFailedRef.current = null;

    void (async () => {
      logKwikpassAuth('sdk.wait.start', 'Waiting for SDK before openLogin');
      const ready = await ensureKwikpassReady(10_000);
      if (!ready) {
        identityLoadFailedRef.current = 'sdk_timeout';
        logKwikpassAuth('login.open.fail', 'SDK not ready for openLogin');
        const probe = await probeKwikpassConfigApi(getKwikpassEnvSnapshot().mid);
        logKwikpassAuth('config.probe', 'KwikPass config API probe after SDK timeout', probe);
        setLoginError(loginErrorForConfigProbe(probe));
        setLoginStatus('error');
        rejectPendingGuard();
        return;
      }

      logKwikpassAuth('login.open.ready', 'SDK ready, opening KwikPass modal');
      setLoginStatus('opening');
      identityProvider.openLogin();
      // Hide Palmonas overlay while KwikPass owns the login UI.
      setIsVendorLoginActive(true);
      setLoginStatus('idle');
    })();
  }, [identityScriptsLoaded, mockAuthEnabled, rejectPendingGuard]);

  /** Closes mock login modal, resets attempt tracking, and aborts pending guards. */
  const dismissMockLogin = useCallback(() => {
    setMockLoginOpen(false);
    loginAttemptedRef.current = false;
    rejectPendingGuard();
  }, [rejectPendingGuard]);

  /** Applies session after mock login success and runs post-login navigation. */
  const handleMockLoginComplete = useCallback(
    async (next: AuthSession) => {
      if (mockLoginType === 'checkout') {
        await beginGuestCartMergeFromStore(queryClient);
      }
      setSession(next);
      loginAttemptedRef.current = false;
      handlePostLoginNavigation();
    },
    [handlePostLoginNavigation, mockLoginType, queryClient],
  );

  /** Dismisses overlay, remounts scripts, and retries login. */
  const retryLogin = useCallback(() => {
    if (mockAuthEnabled) {
      dismissMockLogin();
      startLogin();
      return;
    }
    dismissLoginStatus();
    resetIdentityAttempt();
    startLogin();
  }, [dismissLoginStatus, dismissMockLogin, resetIdentityAttempt, startLogin, mockAuthEnabled]);

  /** Logs KwikPass env snapshot once on provider mount (dev diagnostics). */
  useEffect(() => {
    const snapshot = getKwikpassEnvSnapshot();
    logKwikpassAuth('bootstrap.config', 'Auth provider KwikPass config', {
      ...snapshot,
    });

    if (mockAuthEnabled || process.env.NODE_ENV !== 'development') return;

    void probeKwikpassConfigApi(snapshot.mid).then((probe: KwikpassConfigProbeResponse) => {
      logKwikpassAuth('config.probe.startup', 'KwikPass config API probe on mount', probe);
    });
  }, [mockAuthEnabled]);

  /** Bootstraps auth on mount. Strict Mode remount must re-apply — a startedRef plus cancel drops session forever. */
  useEffect(() => {
    let cancelled = false;
    logKwikpassAuth('bootstrap.start', 'Bootstrapping auth session');
    void (async () => {
      try {
        const result = await bootstrapAuthSession();
        if (!cancelled) {
          applyAuthSessionRef.current(result);
          logKwikpassAuth('bootstrap.ok', 'Auth session ready', {
            isGuest: result.session.user.isGuest,
            demoted: result.demotedFromAuthenticated,
          });
        }
      } catch (err) {
        logKwikpassAuth('bootstrap.fail', 'Auth bootstrap failed', err);
        if (!cancelled) setError(authMessages.errors.bootstrap);
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Wires 401 invalidation → recoverAuthSession and post-refresh React state sync. */
  useEffect(() => {
    const unsubInvalidation = registerSessionInvalidationHandler(() => {
      if (isAuthLogoutInFlight()) {
        return;
      }
      void recoverAuthSession().then(applyAuthSessionRef.current);
    });
    const unsubTokenRefresh = registerTokenRefreshHandler(() => {
      void syncSessionFromStorage().then((next) => {
        if (next) {
          setSession(next);
        }
      });
    });
    return () => {
      unsubInvalidation();
      unsubTokenRefresh();
    };
  }, []);

  /** Proactive token refresh before expiry; skips during logout and without refresh cookie. */
  useEffect(() => {
    if (isBootstrapping || isLoggingOut || isAuthLogoutInFlight() || !session?.claims.expiresAt) {
      return;
    }

    const msUntilRefresh =
      session.claims.expiresAt * 1000 - Date.now() - TOKEN_REFRESH_THRESHOLD_SECONDS * 1000;

    if (msUntilRefresh <= 0) {
      if (!getRefreshToken()) return;
      void refreshAuthSession().then(applyAuthSession);
      return;
    }

    const timer = window.setTimeout(() => {
      if (!getRefreshToken()) return;
      void refreshAuthSession().then(applyAuthSession);
    }, msUntilRefresh);
    return () => window.clearTimeout(timer);
  }, [isBootstrapping, isLoggingOut, session?.claims.expiresAt, applyAuthSession]);

  /** Subscribes to KwikPass OTP success, error, and cancel events for backend login flow. */
  useEffect(() => {
    if (mockAuthEnabled) return;

    const unsubSuccess = identityProvider.onAuthSuccess(async ({ kpToken }) => {
      setIsVendorLoginActive(false);
      setLoginStatus('syncing');
      setLoginError(null);
      logKwikpassAuth('backend.login.start', 'Completing login with Palmonas backend');
      try {
        const loginType = pendingLoginTypeRef.current;
        const cartLogin = isCartLoginType(loginType);
        const storeCart = useCartStore.getState().cart ?? readGuestCartSnapshot();
        const cartItems = cartLogin ? buildCartLoginItemsFromCart(storeCart) : undefined;
        const couponCodes = cartLogin
          ? resolveCartLoginCouponCodes(queryClient, storeCart?.id)
          : undefined;
        const cartId = cartLogin ? undefined : await resolveCartIdForLoginFlow(loginType);
        const next = await completeKwikpassLogin(kpToken, loginType, {
          cartId,
          cartItems,
          couponCodes,
        });
        if (loginType === 'checkout') {
          await beginGuestCartMergeFromStore(queryClient);
        }
        setSession(next);
        setLoginStatus('success');
        loginAttemptedRef.current = false;
        logKwikpassAuth('backend.login.ok', 'Palmonas login succeeded');
        handlePostLoginNavigation();
        successDismissTimerRef.current = setTimeout(() => {
          dismissLoginStatus();
        }, LOGIN_SUCCESS_DISMISS_MS);
      } catch (err) {
        logKwikpassAuth('backend.login.fail', 'Palmonas login failed', err);
        setLoginError(isAppError(err) ? err.message : authMessages.errors.login);
        setLoginStatus('error');
        rejectPendingGuard();
      }
    });

    const unsubError = identityProvider.onAuthError((err) => {
      if (!loginAttemptedRef.current) return;
      setIsVendorLoginActive(false);
      setLoginError(err.message || authMessages.errors.kwikpass);
      setLoginStatus('error');
      // Abort waiting CTAs (wishlist/cart) — error overlay may sit under confirm modals.
      rejectPendingGuard();
    });

    const unsubCancel = identityProvider.onAuthCancel(() => {
      if (!loginAttemptedRef.current) return;
      dismissLoginStatus();
    });

    return () => {
      unsubSuccess();
      unsubError();
      unsubCancel();
    };
  }, [
    dismissLoginStatus,
    handlePostLoginNavigation,
    mockAuthEnabled,
    queryClient,
    rejectPendingGuard,
  ]);

  /** Clears login success auto-dismiss timer on provider unmount. */
  useEffect(
    () => () => {
      if (successDismissTimerRef.current) {
        clearTimeout(successDismissTimerRef.current);
      }
    },
    [],
  );

  /** Resets vendor login tracking when KwikPass never reports a terminal outcome. */
  useEffect(() => {
    if (!isVendorLoginActive) {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      if (loginAttemptedRef.current) {
        dismissLoginStatus();
      }
    }, LOGIN_OVERLAY_TIMEOUT_MS);

    return () => window.clearTimeout(timerId);
  }, [dismissLoginStatus, isVendorLoginActive]);

  /**
   * Merges profile fields into React session state and localStorage auth user snapshot.
   *
   * @param updates - Partial user profile fields to persist.
   */
  const patchSessionUser = useCallback(
    (updates: Partial<Pick<AuthUser, 'firstName' | 'lastName' | 'phoneNumber'>>) => {
      setSession((current) => {
        if (!current) {
          return current;
        }

        const nextUser: AuthUser = { ...current.user, ...updates };
        persistAuthUser(nextUser);
        return { ...current, user: nextUser };
      });
    },
    [],
  );

  /** Clears local auth state first, then vendor session — avoids reload before cookies are cleared. */
  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      const next = await logoutAndResetSession();
      setSession(next);
      identityProvider.logout();
      showSuccess(authMessages.success.logout);
      router.replace('/');
    } catch {
      setError(authMessages.errors.logout);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, showSuccess]);

  /**
   * Runs a protected action immediately when authenticated; otherwise defers until login.
   *
   * @param action - Callback to run after successful login.
   * @param options - Optional login type and registry action id for dev warnings.
   */
  const guardAction = useCallback(
    (action: () => void, options?: { loginType?: LoginType; actionId?: string }) => {
      if (options?.actionId) {
        warnUnregisteredGuardId('action', options.actionId);
      }
      if (session && !session.user.isGuest) {
        action();
        return;
      }
      pendingActionRef.current = action;
      pendingLoginTypeRef.current = options?.loginType ?? 'jwe';
      startLogin();
    },
    [session, startLogin],
  );

  /**
   * Navigates to path when allowed; opens login for protected routes when guest.
   *
   * @param path - Destination pathname.
   */
  const guardNavigation = useCallback(
    (path: string) => {
      if (!isProtectedRoute(path) || (session && !session.user.isGuest)) {
        router.push(path);
        return;
      }
      pendingActionRef.current = () => router.push(path);
      pendingLoginTypeRef.current = 'jwe';
      startLogin();
    },
    [router, session, startLogin],
  );

  /**
   * Opens a modal when authenticated; otherwise defers until login.
   *
   * @param open - Modal open callback.
   * @param options - Optional modal registry id and login type.
   */
  const guardModal = useCallback(
    (open: () => void, options?: { modalId?: string; loginType?: LoginType }) => {
      if (options?.modalId) {
        warnUnregisteredGuardId('modal', options.modalId);
      }
      if (session && !session.user.isGuest) {
        open();
        return;
      }
      pendingActionRef.current = open;
      pendingLoginTypeRef.current = options?.loginType ?? 'jwe';
      startLogin();
    },
    [session, startLogin],
  );

  /**
   * Runs an async API call when authenticated; otherwise defers until login completes.
   *
   * @param fn - Authenticated API call to execute.
   * @param options - Optional API registry id and login type.
   * @returns Promise resolving to fn result after login when needed.
   */
  const guardApi = useCallback<AuthContextValue['guardApi']>(
    async (fn, options) => {
      if (options?.apiId) {
        warnUnregisteredGuardId('api', options.apiId);
      }
      if (session && !session.user.isGuest) {
        return fn();
      }
      return new Promise((resolve, reject) => {
        // Drop any prior waiter so a re-opened login cannot orphan a spinning CTA.
        pendingGuardRejectRef.current?.(new LoginCancelledError());
        pendingActionRef.current = () => {
          pendingGuardRejectRef.current = null;
          void fn().then(resolve).catch(reject);
        };
        pendingGuardRejectRef.current = reject;
        pendingLoginTypeRef.current = options?.loginType ?? 'jwe';
        startLogin();
      });
    },
    [session, startLogin],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isBootstrapping,
      isLoggingIn:
        loginStatus === 'loading' ||
        loginStatus === 'opening' ||
        loginStatus === 'syncing' ||
        isVendorLoginActive ||
        mockLoginOpen,
      isLoggingOut,
      loginStatus,
      loginError,
      error,
      isAuthenticated: Boolean(session && !session.user.isGuest),
      isGuest: Boolean(session?.user.isGuest),
      startLogin,
      dismissLoginStatus,
      expireLoginFlow,
      retryLogin,
      logout,
      guardAction,
      guardNavigation,
      guardModal,
      guardApi,
      patchSessionUser,
    }),
    [
      session,
      isBootstrapping,
      loginStatus,
      loginError,
      isVendorLoginActive,
      isLoggingOut,
      error,
      mockLoginOpen,
      startLogin,
      dismissLoginStatus,
      expireLoginFlow,
      retryLogin,
      logout,
      guardAction,
      guardNavigation,
      guardModal,
      guardApi,
      patchSessionUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      <Suspense fallback={null}>
        <AuthSearchParamsEffects
          redirectRef={redirectRef}
          loginQueryOpenRef={loginQueryOpenRef}
          loginQueryHandledRef={loginQueryHandledRef}
          startLogin={startLogin}
        />
      </Suspense>
      {!mockAuthEnabled ? (
        <KwikPass
          key={scriptAttempt}
          onLoaded={() => {
            setIdentityScriptsLoaded(true);
          }}
          onSdkReady={() => {
            setIdentityScriptsLoaded(true);
          }}
          onLoadFailed={handleIdentityLoadFailed}
        />
      ) : null}
      {mockAuthEnabled && mockLoginOpen ? (
        <MockLoginModal
          open
          loginType={mockLoginType}
          onClose={dismissMockLogin}
          onComplete={handleMockLoginComplete}
        />
      ) : null}
      {children}
      {/* After children so login error/dismiss stays above cart/wishlist confirm modals. */}
      <AuthLoginStatusOverlay />
    </AuthContext.Provider>
  );
}
