'use client';

import { PopActivePlanCard } from '@/components/pop/PopActivePlanCard';
import { PopMyPlanEmptyState } from '@/components/pop/PopMyPlanEmptyState';
import { PopMyPlanHeader } from '@/components/pop/PopMyPlanHeader';
import { PopMyPlanSkeleton } from '@/components/pop/PopMyPlanSkeleton';
import { PopRedeemablePlanCard } from '@/components/pop/PopRedeemablePlanCard';
import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import { popActivePlanMessages } from '@/config/pop.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { usePopSubscriptions } from '@/hooks/pop/usePopSubscriptions';
import { useToast } from '@/hooks/useToast';
import type { PopPlanListResult } from '@/types/pop/subscription-list';

/** My active POP plans — lists subscriptions from GET /api/v2/pop/subscriptions. */
export function PopMyPlanContent({ initialData }: { initialData?: PopPlanListResult }) {
  const { isAuthenticated } = useAuth();
  const { showInfo } = useToast();
  const {
    plans: fetchedPlans,
    isLoading,
    error,
    refetch,
  } = usePopSubscriptions({ limit: 50, offset: 0 }, isAuthenticated, initialData);
  const plans = fetchedPlans.length > 0 ? fetchedPlans : (initialData?.plans ?? []);
  const showLoading = isLoading && !initialData;

  const handleRedeem = () => {
    showInfo('Redemption flow coming soon.');
  };

  return (
    <div className="pop-page bg-white pb-8 sm:pb-10">
      <div className="laptop:px-[clamp(1rem,9.792vw,11.75rem)] mx-auto flex w-full max-w-[var(--pop-content-max)] flex-col gap-4 px-4 pt-4 pb-8 sm:gap-6 sm:px-6 sm:pt-6 sm:pb-10">
        <PopMyPlanHeader />

        {showLoading ? <PopMyPlanSkeleton /> : null}

        {!showLoading && error ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--pop-border)] bg-[var(--pop-surface)] px-4 py-8 text-center sm:rounded-[19px] sm:px-6 sm:py-10">
            <p className="font-normal text-[var(--pop-text-secondary)]">
              {popActivePlanMessages.loadError}
            </p>
            <div className="w-full max-w-xs">
              <PopPrimaryButton ariaLabel={popActivePlanMessages.retry} onClick={refetch}>
                {popActivePlanMessages.retry}
              </PopPrimaryButton>
            </div>
          </div>
        ) : null}

        {!showLoading && !error && plans.length === 0 ? <PopMyPlanEmptyState /> : null}

        {!showLoading && !error && plans.length > 0 ? (
          <div className="flex flex-col gap-6">
            {plans.map((plan) =>
              plan.cardKind === 'redeemable' ? (
                <PopRedeemablePlanCard key={plan.id} plan={plan} onRedeem={handleRedeem} />
              ) : (
                <PopActivePlanCard key={plan.id} plan={plan} />
              ),
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
