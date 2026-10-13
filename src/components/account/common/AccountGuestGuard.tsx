'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { buildLoginRedirectUrl } from '@/config/auth/auth.config';
import { useAuth } from '@/hooks/auth/useAuth';

interface AccountGuestGuardProps {
  children: ReactNode;
}

/**
 * Redirects guests to login without dropping the account page from the tree.
 * Returning null here blanks `/account` (Cache Components instant-unrendered-segment).
 */
export function AccountGuestGuard({ children }: AccountGuestGuardProps) {
  const { isGuest, isLoading } = useAuth();
  const router = useRouter();

  // Guests must not see account workspace — send them to login deep-link.
  useEffect(() => {
    if (isLoading || !isGuest || typeof window === 'undefined') {
      return;
    }

    const loginUrl = buildLoginRedirectUrl(ACCOUNT_ROUTES.hub, window.location.origin);
    router.replace(`${loginUrl.pathname}${loginUrl.search}`);
  }, [isGuest, isLoading, router]);

  if (isLoading || isGuest) {
    return (
      <>
        <AccountPanelSkeleton />
        <div hidden>{children}</div>
      </>
    );
  }

  return children;
}
