'use client';

import { useState } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { ACCOUNT_DETAIL_PAGE_XL_CLASS } from '@/components/account/common/account-layout';
import { PopBenefitsSection } from '@/components/account/plan-of-purchase/PopBenefitsSection';
import { PopCalculatorSection } from '@/components/account/plan-of-purchase/PopCalculatorSection';
import { PopFaqSection } from '@/components/account/plan-of-purchase/PopFaqSection';
import { PopHeroSection } from '@/components/account/plan-of-purchase/PopHeroSection';
import { PopHowItWorksSection } from '@/components/account/plan-of-purchase/PopHowItWorksSection';
import { PopPlanCard } from '@/components/account/plan-of-purchase/PopPlanCard';
import { PopSubscriptionsSection } from '@/components/account/plan-of-purchase/PopSubscriptionsSection';
import { POP_DEFAULT_MONTHLY_AMOUNT } from '@/config/pop/pop.config';
import { useCreatePopSubscription } from '@/hooks/pop';
import { useToast } from '@/hooks/useToast';

export function PlanOfPurchaseView() {
  const [monthlyAmount, setMonthlyAmount] = useState(POP_DEFAULT_MONTHLY_AMOUNT);
  const { createSubscription, isPending } = useCreatePopSubscription();
  const { showSuccess, showError } = useToast();

  const handleStartSaving = async () => {
    try {
      const result = await createSubscription({ amount: monthlyAmount });

      if (result.paymentUrl) {
        window.location.assign(result.paymentUrl);
        return;
      }

      showSuccess('Your saving plan has been created successfully.');
    } catch {
      showError('Could not start plan. Please try again.');
    }
  };

  return (
    <div className={ACCOUNT_DETAIL_PAGE_XL_CLASS}>
      <AccountBackHeader title="Plan of Purchase" />

      <PopSubscriptionsSection />

      <div className="mt-6">
        <PopHeroSection />
        <PopHowItWorksSection />
        <PopPlanCard
          monthlyAmount={monthlyAmount}
          isSubmitting={isPending}
          onStartSaving={() => void handleStartSaving()}
        />
        <PopCalculatorSection
          monthlyAmount={monthlyAmount}
          onMonthlyAmountChange={setMonthlyAmount}
        />
        <PopBenefitsSection />
        <PopFaqSection />
      </div>
    </div>
  );
}
