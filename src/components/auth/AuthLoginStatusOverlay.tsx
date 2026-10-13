'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';

import {
  AuthModalShell,
  authModalPrimaryButtonClassName,
  authModalSecondaryButtonClassName,
} from '@/components/auth/AuthModalShell';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { authMessages, LOGIN_OVERLAY_TIMEOUT_MS } from '@/config/auth/auth.config';
import { isMockAuthEnabled } from '@/config/auth/mock-auth.config';
import { identityProvider } from '@/infrastructure/identity';
import { cn } from '@/lib/utils/cn';
import { useAuthContext } from '@/providers/auth/auth.context';
import type { LoginStatus } from '@/types/auth/auth.types';

interface AuthLoginStatusOverlayProps {
  status: LoginStatus;
  errorMessage: string | null;
  onRetry: () => void;
  onDismiss: () => void;
  onTimeout: () => void;
}

function isLoginFlowLoading(status: LoginStatus): boolean {
  return status === 'loading' || status === 'opening' || status === 'syncing';
}

/**
 * Palmonas-branded overlay for login flow (syncing, success, error).
 */
export function AuthLoginStatusOverlayView({
  status,
  errorMessage,
  onRetry,
  onDismiss,
  onTimeout,
}: AuthLoginStatusOverlayProps) {
  const isLoading = isLoginFlowLoading(status);
  const loadingMessage =
    status === 'loading'
      ? authMessages.loadingLogin
      : status === 'opening'
        ? authMessages.openingKwikpass
        : authMessages.signingIn;

  // Auto-expire stuck loading states (SDK wait, KwikPass open, backend sync).
  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const timerId = window.setTimeout(onTimeout, LOGIN_OVERLAY_TIMEOUT_MS);
    return () => window.clearTimeout(timerId);
  }, [isLoading, onTimeout, status]);

  return (
    <AuthModalShell
      open={status !== 'idle'}
      role="status"
      aria-label="Login status"
      onClose={status === 'success' ? undefined : onDismiss}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader className="border-palmonas-border border-t-palmonas-ink h-10 w-10" />
          <p className="text-palmonas-ink text-sm font-medium">{loadingMessage}</p>
        </div>
      ) : null}

      {status === 'success' ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" aria-hidden="true" />
          <p className="text-palmonas-ink text-lg font-semibold">{authMessages.success.login}</p>
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-12 w-12 text-red-600" aria-hidden="true" />
          <p className="text-palmonas-ink text-sm" role="alert">
            {errorMessage ?? authMessages.errors.login}
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className={cn(authModalPrimaryButtonClassName, 'flex-1')} onClick={onRetry}>
              {authMessages.retryLogin}
            </Button>
            <Button
              variant="secondary"
              className={cn(authModalSecondaryButtonClassName, 'flex-1')}
              onClick={onDismiss}
            >
              {authMessages.dismiss}
            </Button>
          </div>
        </div>
      ) : null}
    </AuthModalShell>
  );
}

/**
 * Login status overlay wired to auth context.
 */
export function AuthLoginStatusOverlay() {
  const { loginStatus, loginError, retryLogin, dismissLoginStatus, expireLoginFlow } =
    useAuthContext();

  // Close overlay when the user dismisses the KwikPass OTP modal.
  useEffect(() => {
    if (isMockAuthEnabled()) {
      return undefined;
    }

    return identityProvider.onAuthCancel(() => {
      dismissLoginStatus();
    });
  }, [dismissLoginStatus]);

  return (
    <AuthLoginStatusOverlayView
      status={loginStatus}
      errorMessage={loginError}
      onRetry={retryLogin}
      onDismiss={dismissLoginStatus}
      onTimeout={expireLoginFlow}
    />
  );
}
