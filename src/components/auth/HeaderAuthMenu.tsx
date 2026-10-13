'use client';

import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { AccountIcon } from '@/components/icons';
import { AppLink } from '@/components/ui/AppLink';
import { Loader } from '@/components/ui/Loader';
import { authMessages } from '@/config/auth/auth.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { cn } from '@/lib/utils/cn';

const iconButtonClassName = 'inline-flex h-11 w-11 items-center justify-center rounded-full';

interface HeaderAuthMenuProps {
  compact?: boolean;
}

/** Header account control — opens KwikPass login for guests, hub for signed-in users. */
export function HeaderAuthMenu({ compact = false }: HeaderAuthMenuProps) {
  const { isLoading, loginStatus, isGuest, guardNavigation } = useAuth();
  const isLoginBusy =
    loginStatus === 'loading' || loginStatus === 'opening' || loginStatus === 'syncing';

  if (isLoading) {
    return (
      <span
        className={cn(
          'inline-block animate-pulse rounded-full bg-stone-200',
          compact ? 'h-6 w-6' : 'h-9 w-9',
        )}
      />
    );
  }

  if (isLoginBusy) {
    return (
      <span
        className={cn(iconButtonClassName, 'cursor-wait opacity-80', compact && 'h-6 w-6 shrink-0')}
        aria-label={authMessages.account}
        aria-busy="true"
      >
        <Loader className="h-4 w-4 border-stone-300 border-t-stone-800" />
      </span>
    );
  }

  if (isGuest) {
    return (
      <button
        type="button"
        className={cn(iconButtonClassName, compact && 'h-6 w-6 shrink-0')}
        aria-label={authMessages.account}
        onClick={() => guardNavigation(ACCOUNT_ROUTES.hub)}
      >
        <AccountIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <AppLink
      href={ACCOUNT_ROUTES.hub}
      className={cn(iconButtonClassName, compact && 'h-6 w-6 shrink-0')}
      aria-label={authMessages.account}
    >
      <AccountIcon className="h-5 w-5" aria-hidden="true" />
    </AppLink>
  );
}
