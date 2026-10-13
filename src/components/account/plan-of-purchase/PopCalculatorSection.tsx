'use client';

import { Button } from '@/components/ui/Button';
import {
  POP_AMOUNT_STEP,
  POP_MAX_MONTHLY_AMOUNT,
  POP_MIN_MONTHLY_AMOUNT,
  POP_PAID_MONTHS,
} from '@/config/pop/pop.config';
import { formatPopCurrency } from '@/lib/pop/pop-format';
import { calculatePopSavings } from '@/types/pop';

interface PopCalculatorSectionProps {
  monthlyAmount: number;
  onMonthlyAmountChange: (amount: number) => void;
}

export function PopCalculatorSection({
  monthlyAmount,
  onMonthlyAmountChange,
}: PopCalculatorSectionProps) {
  const savings = calculatePopSavings(monthlyAmount);

  return (
    <section className="mt-8" aria-labelledby="pop-calculator-heading">
      <h2 id="pop-calculator-heading" className="text-base font-bold text-[#151515]">
        Calculate Your Savings
      </h2>

      <div className="mt-4 rounded-2xl border border-[#EFEFEF] bg-white p-5">
        <label htmlFor="pop-monthly-amount" className="text-sm font-normal text-[#757575]">
          Monthly Instalment
        </label>
        <p className="mt-1 text-xs font-normal text-[#757575]">
          Multiples of {formatPopCurrency(POP_MIN_MONTHLY_AMOUNT)}
        </p>

        <input
          id="pop-monthly-amount"
          type="range"
          min={POP_MIN_MONTHLY_AMOUNT}
          max={POP_MAX_MONTHLY_AMOUNT}
          step={POP_AMOUNT_STEP}
          value={monthlyAmount}
          aria-label="Monthly instalment amount"
          className="mt-4 w-full accent-[#7D3C98]"
          onChange={(event) => onMonthlyAmountChange(Number(event.target.value))}
        />

        <p className="mt-2 text-center text-2xl font-bold text-[#151515]">
          {formatPopCurrency(monthlyAmount)}
        </p>

        <dl className="mt-5 space-y-3 border-t border-[#EFEFEF] pt-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-normal text-[#757575]">
              Your Total Instalments ({POP_PAID_MONTHS} Months)
            </dt>
            <dd className="font-medium text-[#151515]">
              {formatPopCurrency(savings.totalInstallments)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-normal text-[#757575]">Palmonas Bonus (6th Month)</dt>
            <dd className="font-medium text-[#2E7D32]">{formatPopCurrency(savings.bonusAmount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-bold text-[#151515]">Total Redeemable Amount</dt>
            <dd className="font-bold text-[#151515]">
              {formatPopCurrency(savings.redeemableAmount)}
            </dd>
          </div>
        </dl>

        <Button
          type="button"
          variant="primary"
          className="mt-5 h-11 w-full rounded-md bg-[#151515] text-sm font-normal text-white hover:bg-[#151515]"
          aria-label="Calculate savings"
          onClick={() => onMonthlyAmountChange(monthlyAmount)}
        >
          Calculate
        </Button>
      </div>
    </section>
  );
}
