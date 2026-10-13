import type { ReactNode } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_CLASS } from '@/components/account/common/account-layout';

interface AccountInfoLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Shared shell for account “Others” info panels. */
export function AccountInfoLayout({ title, subtitle, children }: AccountInfoLayoutProps) {
  return (
    <div className={ACCOUNT_DETAIL_PAGE_CLASS}>
      <AccountBackHeader title={title} />
      {subtitle && subtitle.trim() ? (
        <p className="mt-4 text-sm leading-6 font-normal text-[#757575]">{subtitle}</p>
      ) : null}
      {children}
    </div>
  );
}
