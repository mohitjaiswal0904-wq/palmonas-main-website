'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { POP_MY_PLAN_PATH, popPlanDetailMessages } from '@/config/pop.config';

/** Back navigation and title for the POP plan details page. */
export function PopPlanDetailHeader() {
  return (
    <div className="flex w-full items-center gap-3 py-2 sm:py-3">
      <Link
        href={POP_MY_PLAN_PATH}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-[var(--pop-border)] bg-white text-[#121212] transition-colors hover:bg-[#fafafa] sm:size-10"
        aria-label={popPlanDetailMessages.backAriaLabel}
      >
        <ArrowLeft className="size-4 sm:size-5" aria-hidden="true" />
      </Link>
      <h1 className="text-lg leading-[1.4] font-normal text-[#121212] sm:text-[clamp(1.125rem,1.042vw,1.25rem)]">
        {popPlanDetailMessages.pageTitle}
      </h1>
    </div>
  );
}
