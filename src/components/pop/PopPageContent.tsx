'use client';

import { ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { PopActivePlanBanner } from '@/components/pop/PopActivePlanBanner';
import { PopHeroSection, PopPlanSummaryCard } from '@/components/pop/PopHeroSection';
import {
  PopBenefitsSection,
  PopFaqSection,
  PopHowItWorksSection,
} from '@/components/pop/PopMarketingSections';
import {
  PopPersonalDetailsForm,
  type PopPersonalDetails,
} from '@/components/pop/PopPersonalDetailsForm';
import { PopSavingsCalculator } from '@/components/pop/PopSavingsCalculator';
import { PopSectionHeading, PopSectionShell } from '@/components/pop/PopSectionShell';
import { POP_DEFAULT_INSTALMENT, popLoginRequiredMessage, type PopStep } from '@/config/pop.config';
import { siteConfig } from '@/config/site.config';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useCreatePopSubscription } from '@/hooks/pop/useCreatePopSubscription';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/lib/format-price';
import type { PopPlanListResult } from '@/types/pop/subscription-list';

function PopStepHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[var(--pop-content-max)] items-center gap-[clamp(0.65rem,0.729vw,0.875rem)] py-[clamp(0.65rem,0.729vw,0.875rem)]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-[clamp(2.25rem,2.083vw,2.5rem)] items-center justify-center rounded-[clamp(0.3rem,0.313vw,0.375rem)] border border-[var(--pop-border)] bg-white text-[#121212] transition-colors hover:bg-[#fafafa]"
        aria-label={`Go back from ${title}`}
      >
        <ArrowLeft className="size-[50%]" aria-hidden="true" />
      </button>
      <h1 className="text-[clamp(1rem,1.042vw,1.25rem)] leading-[1.4] font-normal text-[#121212]">
        {title}
      </h1>
    </div>
  );
}

interface PopPageContentProps {
  initialSubscriptions?: PopPlanListResult;
}

export function PopPageContent({ initialSubscriptions }: PopPageContentProps) {
  const { showSuccess, showWarning } = useToast();
  const { isAuthenticated, guard, guardApi } = useRequireAuth();
  const {
    createSubscription,
    isSubmitting,
    error: subscriptionError,
    reset,
  } = useCreatePopSubscription();
  const [step, setStep] = useState<PopStep>('overview');
  const [monthlyInstalment, setMonthlyInstalment] = useState(POP_DEFAULT_INSTALMENT);
  const topRef = useRef<HTMLDivElement | null>(null);
  const visibleStep: PopStep = !isAuthenticated && step !== 'overview' ? 'overview' : step;

  /** Prompts guests to log in, then runs the POP flow action after successful auth. */
  const requireAuthToStartPop = useCallback(
    (action: () => void, actionId: 'pop.start' | 'pop.enroll' = 'pop.start') => {
      if (!isAuthenticated) {
        showWarning(popLoginRequiredMessage);
      }
      guard(action, { actionId });
    },
    [guard, isAuthenticated, showWarning],
  );

  // Keep each step's heading in view when the multi-step flow advances.
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [visibleStep]);

  const goToSavings = useCallback(() => {
    setStep('savings');
  }, []);

  const handleCalculate = useCallback((amount: number) => {
    setMonthlyInstalment(amount);
  }, []);

  const handleStartSaving = useCallback((amount: number) => {
    setMonthlyInstalment(amount);
    setStep('details');
  }, []);

  const handlePersonalDetailsSubmit = useCallback(
    async (details: PopPersonalDetails) => {
      reset();

      await guardApi(
        async () => {
          const result = await createSubscription({
            amount: monthlyInstalment,
            details,
            callbackUrl: `${siteConfig.url}/pop`,
          });

          if (result.paymentUrl) {
            window.location.assign(result.paymentUrl);
            return;
          }

          showSuccess(
            `Thanks ${details.name.split(' ')[0] ?? 'there'}! Your POP plan for ${formatPrice(monthlyInstalment)}/mo is set up.`,
          );
        },
        { apiId: 'pop.subscriptions.create' },
      );
    },
    [createSubscription, guardApi, monthlyInstalment, reset, showSuccess],
  );

  return (
    <div ref={topRef} className="pop-page bg-white pb-[clamp(1.5rem,2.083vw,2.5rem)]">
      {visibleStep === 'overview' ? (
        <div className="flex flex-col gap-[clamp(2rem,2.604vw,3.125rem)]">
          {isAuthenticated || (initialSubscriptions?.plans.length ?? 0) > 0 ? (
            <PopActivePlanBanner />
          ) : null}
          <PopHeroSection />
          <PopHowItWorksSection />
          <PopPlanSummaryCard
            onStartSaving={() => {
              requireAuthToStartPop(goToSavings);
            }}
          />
          <section className="w-full bg-[var(--pop-surface)] px-4 py-[clamp(2rem,2.083vw,2.5rem)] lg:px-[clamp(1rem,9.792vw,11.75rem)]">
            <div className="mx-auto w-full max-w-[var(--pop-content-wide)]">
              <PopSectionHeading
                title="Calculate Your Savings"
                subtitle="See how much you'll save with our 5+1 offer-save"
                className="mb-[clamp(2rem,2.5vw,3rem)]"
              />
              <PopSavingsCalculator
                initialAmount={monthlyInstalment}
                primaryLabel="Calculate"
                onPrimaryAction={(amount) => {
                  requireAuthToStartPop(() => {
                    handleCalculate(amount);
                    setStep('savings');
                  });
                }}
              />
            </div>
          </section>
          <PopBenefitsSection />
          <PopFaqSection />
        </div>
      ) : null}

      {visibleStep === 'savings' ? (
        <div className="mx-auto flex w-full max-w-[var(--pop-content-wide)] flex-col gap-[clamp(2rem,2.604vw,3.125rem)] px-4 pb-[clamp(1.5rem,2.083vw,2.5rem)] lg:px-0">
          <PopStepHeader title="POP" onBack={() => setStep('overview')} />
          <PopSectionShell
            className="px-0"
            innerClassName="flex flex-col gap-[clamp(2rem,2.5vw,3rem)] px-0 pb-[clamp(1.5rem,2.083vw,2.5rem)]"
          >
            <PopSectionHeading title="Start saving" subtitle="Start your savings plan today" />
            <PopSavingsCalculator
              initialAmount={monthlyInstalment}
              primaryLabel="Start Investing"
              onPrimaryAction={(amount) => {
                requireAuthToStartPop(() => {
                  handleStartSaving(amount);
                });
              }}
            />
          </PopSectionShell>
        </div>
      ) : null}

      {visibleStep === 'details' ? (
        <div className="mx-auto flex w-full max-w-[var(--pop-content-wide)] flex-col gap-[clamp(2rem,2.604vw,3.125rem)] pb-[clamp(1.5rem,2.083vw,2.5rem)]">
          <PopStepHeader title="Personal details" onBack={() => setStep('savings')} />
          <PopSectionShell innerClassName="pb-[clamp(1.5rem,2.083vw,2.5rem)]">
            <PopPersonalDetailsForm
              monthlyInstalment={monthlyInstalment}
              onSubmit={handlePersonalDetailsSubmit}
              isSubmitting={isSubmitting}
              submitError={subscriptionError?.message ?? null}
            />
          </PopSectionShell>
        </div>
      ) : null}
    </div>
  );
}
