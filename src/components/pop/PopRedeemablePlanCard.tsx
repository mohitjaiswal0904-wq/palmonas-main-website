'use client';

import { Gift } from 'lucide-react';
import Link from 'next/link';

import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import {
  buildPopPlanDetailPath,
  popPlanCardMessages,
  popPlanDetailMessages,
  popPlanGradients,
} from '@/config/pop.config';
import { formatPrice } from '@/lib/format-price';
import type { PopPlan } from '@/types/pop/subscription-list';

interface PopRedeemablePlanCardProps {
  plan: PopPlan;
  onRedeem?: (planId: string) => void;
}

/** Completed POP plan card with redeem CTA from Figma. */
export function PopRedeemablePlanCard({ plan, onRedeem }: PopRedeemablePlanCardProps) {
  const bonusLabel = popPlanCardMessages.includingBonus.replace(
    '{amount}',
    formatPrice(plan.bonusAmount),
  );
  const detailHref = plan.razorpaySubscriptionId
    ? buildPopPlanDetailPath(plan.razorpaySubscriptionId)
    : null;
  const openLabel = popPlanDetailMessages.openPlanAriaLabel.replace('{planName}', plan.planName);

  const headerContent = (
    <>
      <div
        className="relative flex flex-col gap-3 overflow-hidden p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
        style={{
          backgroundImage: [
            popPlanGradients.redeemHeader,
            'linear-gradient(90deg, rgba(223,223,223,0.2), rgba(223,223,223,0.2))',
          ].join(', '),
        }}
      >
        <div
          className="pointer-events-none absolute -top-10 right-0 hidden size-24 rounded-full bg-[rgba(255,146,146,0.1)] sm:left-[250px] sm:block"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium text-[var(--pop-text-primary)] sm:text-[clamp(1.125rem,1.042vw,1.25rem)]">
            {popPlanCardMessages.congratulations}
          </p>
          <p className="mt-1.5 text-sm font-normal text-[var(--pop-text-secondary)] sm:mt-2 sm:text-base">
            {popPlanCardMessages.allInstalmentsCompleted}
          </p>
        </div>
        <Gift className="size-7 shrink-0 self-start text-[#f97316] sm:size-8" aria-hidden="true" />
      </div>

      <div className="px-4 pt-3 sm:px-4 sm:pt-4">
        <p className="text-sm font-normal text-[#151515] sm:text-[clamp(1rem,0.9375vw,1.125rem)]">
          {popPlanCardMessages.readyToRedeem}
        </p>
        <p className="mt-1.5 text-xl font-bold text-[#151515] sm:mt-2 sm:text-[clamp(1.375rem,1.146vw,1.375rem)]">
          {formatPrice(plan.redeemableAmount)}
        </p>
        <p className="mt-1.5 text-sm font-normal text-[#a8a8a8] sm:mt-2 sm:text-base">
          {bonusLabel}
        </p>
      </div>
    </>
  );

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-[#ffebb4] bg-white sm:rounded-[19px]">
      {detailHref ? (
        <Link
          href={detailHref}
          className="block transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pop-purple)]"
          aria-label={openLabel}
        >
          {headerContent}
        </Link>
      ) : (
        <div>{headerContent}</div>
      )}

      <div className="p-4 sm:p-5">
        <PopPrimaryButton
          ariaLabel={popPlanCardMessages.redeemAriaLabel}
          onClick={() => onRedeem?.(plan.id)}
        >
          {popPlanCardMessages.redeem}
        </PopPrimaryButton>
      </div>
    </article>
  );
}
