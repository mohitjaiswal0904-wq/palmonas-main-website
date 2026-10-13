'use client';

import { useRouter } from 'next/navigation';

import { ACCOUNT_ROUTES } from '@/components/account/common/account-routes';
import { AccountBackIcon } from '@/components/account/common/icons/AccountBackIcon';
import { useAccountShellNav } from '@/hooks/account/useAccountShellNav';
import { cn } from '@/lib/utils/cn';

interface AccountBackHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

const backControlClassName = 'inline-flex size-10 shrink-0 items-center justify-center';

export function AccountBackHeader({
  title,
  backHref = ACCOUNT_ROUTES.hub,
  backLabel = 'Back to account',
  className,
}: AccountBackHeaderProps) {
  const router = useRouter();
  const shellNav = useAccountShellNav();
  const softCloseToHub = shellNav != null && backHref === ACCOUNT_ROUTES.hub;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        className={backControlClassName}
        aria-label={backLabel}
        onClick={() => {
          if (softCloseToHub) {
            shellNav.closeToHub();
            return;
          }
          router.replace(backHref);
        }}
      >
        <AccountBackIcon />
      </button>
      <h1 className="text-lg font-medium text-[#151515]">{title}</h1>
    </div>
  );
}
