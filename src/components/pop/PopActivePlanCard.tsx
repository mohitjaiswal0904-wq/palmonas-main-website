'use client';

import Link from 'next/link';

import { PopPlanStatsRow, PopPlanStatusBadge } from '@/components/pop/PopPlanStatsRow';
import {
  popPlanCardMessages,
  popPlanGradients,
  buildPopPlanDetailPath,
  popPlanDetailMessages,
} from '@/config/pop.config';
import { cn } from '@/lib/utils/cn';
import type { PopPlan } from '@/types/pop/subscription-list';

interface PopActivePlanCardProps {
  plan: PopPlan;
}

function PopActivePlanCardBody({ plan, isCreated }: { plan: PopPlan; isCreated: boolean }) {
  return (
    <article className="w-full overflow-hidden rounded-2xl border border-[var(--pop-border)] bg-white sm:rounded-[19px]">
      <div
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-3"
        style={{
          backgroundImage: `${popPlanGradients.activeHeader}, linear-gradient(90deg, #fff, #fff)`,
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-normal text-[var(--pop-text-secondary)] sm:text-[clamp(1rem,0.9375vw,1.125rem)]">
            {popPlanCardMessages.planSummary}
          </p>
          <p className="mt-1.5 text-base font-medium text-[var(--pop-text-primary)] sm:mt-2 sm:text-[clamp(1.125rem,1.042vw,1.25rem)]">
            {plan.planName}
          </p>
        </div>
        <PopPlanStatusBadge
          className={cn(
            'self-start',
            isCreated ? 'bg-[var(--pop-text-secondary)]' : 'bg-[var(--pop-green)]',
          )}
        >
          {plan.statusLabel}
        </PopPlanStatusBadge>
      </div>
      <PopPlanStatsRow
        monthlyAmount={plan.monthlyAmount}
        paidSoFar={plan.paidSoFar}
        totalValue={plan.totalValue}
        monthlyLabel={popPlanCardMessages.monthly}
        paidLabel={popPlanCardMessages.paidSoFar}
        totalLabel={popPlanCardMessages.totalValue}
      />
    </article>
  );
}

/** In-progress POP plan summary card from Figma. */
export function PopActivePlanCard({ plan }: PopActivePlanCardProps) {
  const isCreated = plan.apiStatus === 'created' || plan.apiStatus === 'pending';
  const openLabel = popPlanDetailMessages.openPlanAriaLabel.replace('{planName}', plan.planName);

  if (!plan.razorpaySubscriptionId) {
    return <PopActivePlanCardBody plan={plan} isCreated={isCreated} />;
  }

  return (
    <Link
      href={buildPopPlanDetailPath(plan.razorpaySubscriptionId)}
      className="block w-full rounded-2xl transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pop-purple)] sm:rounded-[19px]"
      aria-label={openLabel}
    >
      <PopActivePlanCardBody plan={plan} isCreated={isCreated} />
    </Link>
  );
}
