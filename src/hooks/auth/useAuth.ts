'use client';

import { useAuthContext } from '@/providers/auth/auth.context';

export type { AuthSession, SessionClaims, AuthUser } from '@/types/auth/auth.types';

/**
 * Auth hook — session, claims, and auth actions.
 *
 * @returns Mapped auth state and actions from AuthProvider context.
 */
export function useAuth() {
  const ctx = useAuthContext();
  return {
    session: ctx.session,
    user: ctx.session?.user ?? null,
    claims: ctx.session?.claims ?? null,
    isLoading: ctx.isBootstrapping,
    isAuthenticated: ctx.isAuthenticated,
    isGuest: ctx.isGuest,
    isLoggingIn: ctx.isLoggingIn,
    isLoggingOut: ctx.isLoggingOut,
    loginStatus: ctx.loginStatus,
    loginError: ctx.loginError,
    error: ctx.error,
    startLogin: ctx.startLogin,
    openLogin: ctx.startLogin,
    dismissLoginStatus: ctx.dismissLoginStatus,
    retryLogin: ctx.retryLogin,
    logout: ctx.logout,
    guardAction: ctx.guardAction,
    guardNavigation: ctx.guardNavigation,
    guardModal: ctx.guardModal,
    guardApi: ctx.guardApi,
    patchSessionUser: ctx.patchSessionUser,
  };
}

/**
 * Returns guard helpers for protected UI actions, navigation, modals, and APIs.
 *
 * @returns isAuthenticated flag, openLogin, and guard delegates.
 */
export function useRequireAuth() {
  const { guardAction, guardNavigation, guardModal, guardApi, startLogin, isAuthenticated } =
    useAuth();
  return {
    isAuthenticated,
    openLogin: startLogin,
    guard: guardAction,
    guardNavigation,
    guardModal,
    guardApi,
  };
}
