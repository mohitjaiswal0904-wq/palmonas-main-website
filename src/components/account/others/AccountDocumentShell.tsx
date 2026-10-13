import type { ReactNode } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_WIDE_CLASS } from '@/components/account/common/account-layout';
import { cn } from '@/lib/utils/cn';

interface AccountDocumentShellProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wide account document shell: live policy/FAQ layout adapted to theme tokens.
 */
export function AccountDocumentShell({ title, children, className }: AccountDocumentShellProps) {
  return (
    <article
      className={cn(
        ACCOUNT_DETAIL_PAGE_WIDE_CLASS,
        'rounded-palmonas-lg border-border-subtle bg-surface-elevated shadow-palmonas-soft border px-4 py-5 sm:px-6 sm:py-6',
        className,
      )}
      aria-label={title}
    >
      <AccountBackHeader
        title={title}
        className="[&_h1]:text-brand-navy [&_h1]:text-lg [&_h1]:font-bold sm:[&_h1]:text-xl"
      />
      <div className="mt-6 space-y-6 text-sm leading-6 text-[var(--color-text-muted)] sm:text-[15px] sm:leading-7">
        {children}
      </div>
    </article>
  );
}
