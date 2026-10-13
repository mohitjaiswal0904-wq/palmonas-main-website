import { Button } from '@/components/ui/Button';
import { POP_PLAN_FEATURES, POP_TOTAL_MONTHS } from '@/config/pop/pop.config';
import { formatPopCurrency } from '@/lib/pop/pop-format';
import { calculatePopSavings } from '@/types/pop';

interface PopPlanCardProps {
  monthlyAmount: number;
  isSubmitting: boolean;
  onStartSaving: () => void;
}

export function PopPlanCard({ monthlyAmount, isSubmitting, onStartSaving }: PopPlanCardProps) {
  const savings = calculatePopSavings(monthlyAmount);

  return (
    <section
      className="mt-8 rounded-2xl border border-[#EFEFEF] bg-white p-5 shadow-sm"
      aria-label="Plan details"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-normal text-[#757575]">Starting from</p>
          <p className="text-xl font-bold text-[#151515]">
            {formatPopCurrency(monthlyAmount)}{' '}
            <span className="text-sm font-normal text-[#757575]">per month</span>
          </p>
        </div>
        <span className="rounded-full bg-[#F8F0FA] px-3 py-1 text-xs font-medium text-[#7D3C98]">
          1 Month FREE
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-[#E8F5E9] p-4">
        <p className="text-sm font-normal text-[#2E7D32]">
          Total Value After {POP_TOTAL_MONTHS} Months
        </p>
        <p className="mt-1 text-2xl font-bold text-[#151515]">
          {formatPopCurrency(savings.redeemableAmount)}
        </p>
        <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-[#2E7D32]">
          Pay only {formatPopCurrency(savings.totalInstallments)}
        </span>
      </div>

      <ul className="mt-4 space-y-2" aria-label="Plan benefits">
        {POP_PLAN_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-[#151515]">
            <span className="text-[#2E7D32]" aria-hidden="true">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        className="mt-5 h-11 w-full rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
        isLoading={isSubmitting}
        aria-label="Start saving now"
        onClick={onStartSaving}
      >
        Start Saving Now
      </Button>
    </section>
  );
}
