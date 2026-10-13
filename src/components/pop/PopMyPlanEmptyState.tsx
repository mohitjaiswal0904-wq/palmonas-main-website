'use client';

import Link from 'next/link';

import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import { popActivePlanMessages } from '@/config/pop.config';

/** Empty state when the user has no POP subscriptions. */
export function PopMyPlanEmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--pop-border)] bg-[var(--pop-surface)] px-4 py-10 text-center sm:rounded-[19px] sm:px-6 sm:py-12">
      <h2 className="text-[clamp(1.25rem,1.25vw,1.5rem)] font-medium text-[var(--pop-text-primary)]">
        {popActivePlanMessages.emptyTitle}
      </h2>
      <p className="max-w-md text-[clamp(1rem,1.042vw,1.25rem)] font-normal text-[var(--pop-text-secondary)]">
        {popActivePlanMessages.emptyDescription}
      </p>
      <Link href="/pop" className="mt-2 w-full max-w-sm">
        <PopPrimaryButton ariaLabel={popActivePlanMessages.startPlanCta}>
          {popActivePlanMessages.startPlanCta}
        </PopPrimaryButton>
      </Link>
    </div>
  );
}
