'use client';

import { PopInstalmentTimeline } from '@/components/pop/PopInstalmentTimeline';
import { PopFaqSection } from '@/components/pop/PopMarketingSections';
import { PopMyPlanSkeleton } from '@/components/pop/PopMyPlanSkeleton';
import { PopPlanDetailHeader } from '@/components/pop/PopPlanDetailHeader';
import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import { popPlanDetailMessages } from '@/config/pop.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePopSubscriptionDetail } from '@/hooks/pop/usePopSubscriptionDetail';

interface PopPlanDetailContentProps {
  subscriptionId: string;
}

/** POP plan instalment details — timeline from GET /api/v2/pop/subscriptions/{sub_id}. */
export function PopPlanDetailContent({ subscriptionId }: PopPlanDetailContentProps) {
  const { isAuthenticated } = useAuth();
  const { detail, isLoading, error, refetch } = usePopSubscriptionDetail(
    subscriptionId,
    { count: 6, skip: 0 },
    isAuthenticated,
  );
  const showLoading = isLoading;

  return (
    <div className="pop-page bg-white pb-8 sm:pb-10">
      <div className="laptop:px-[clamp(1rem,9.792vw,11.75rem)] mx-auto flex w-full max-w-[var(--pop-content-max)] flex-col gap-6 px-4 pt-4 pb-8 sm:gap-8 sm:px-6 sm:pt-6 sm:pb-10">
        <PopPlanDetailHeader />

        {showLoading ? <PopMyPlanSkeleton /> : null}

        {!showLoading && error ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--pop-border)] bg-[var(--pop-surface)] px-4 py-8 text-center sm:rounded-[19px] sm:px-6 sm:py-10">
            <p className="font-normal text-[var(--pop-text-secondary)]">
              {popPlanDetailMessages.loadError}
            </p>
            <div className="w-full max-w-xs">
              <PopPrimaryButton ariaLabel={popPlanDetailMessages.retry} onClick={refetch}>
                {popPlanDetailMessages.retry}
              </PopPrimaryButton>
            </div>
          </div>
        ) : null}

        {!showLoading && !error && detail ? (
          <>
            <PopInstalmentTimeline instalments={detail.instalments} />
            <PopFaqSection />
          </>
        ) : null}
      </div>
    </div>
  );
}
