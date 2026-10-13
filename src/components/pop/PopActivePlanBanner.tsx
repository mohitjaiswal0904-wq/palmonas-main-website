'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { CalenderIcon } from '@/components/icons/CalenderIcon';
import { POP_MY_PLAN_PATH, popActivePlanMessages } from '@/config/pop.config';

/** Logged-in entry point to the POP active plan dashboard. */
export function PopActivePlanBanner() {
  return (
    <div className="laptop:px-[clamp(1rem,9.792vw,11.75rem)] sticky top-0 z-40 w-full border-b border-[var(--pop-border)] bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-[clamp(0.75rem,0.833vw,1rem)]">
      <Link
        href={POP_MY_PLAN_PATH}
        className="mx-auto flex w-full max-w-[var(--pop-content-wide)] items-center justify-between gap-3 rounded-xl border border-[var(--pop-border)] bg-[linear-gradient(94.84deg,rgba(113,255,234,0.1)_3.91%,rgba(255,120,199,0.1)_99.39%),linear-gradient(#fff,#fff)] px-4 py-3 transition-opacity hover:opacity-90 sm:gap-4 sm:rounded-[clamp(0.65rem,0.696vw,0.835rem)] sm:px-[clamp(1rem,1.042vw,1.25rem)] sm:py-[clamp(0.85rem,0.87vw,1.04rem)]"
        aria-label={popActivePlanMessages.linkAriaLabel}
      >
        <div className="flex min-w-0 items-center gap-3">
          <CalenderIcon />
          <div className="min-w-0">
            <p className="text-sm tracking-[-0.011em] text-[#151515]">
              {popActivePlanMessages.title}
            </p>
            <p className="text-xs text-[var(--pop-text-secondary)]">
              {popActivePlanMessages.subtitle}
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-[var(--pop-purple)]" aria-hidden="true" />
      </Link>
    </div>
  );
}
