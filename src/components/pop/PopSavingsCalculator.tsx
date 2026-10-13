'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { PopPrimaryButton } from '@/components/pop/PopSectionShell';
import {
  POP_DEFAULT_INSTALMENT,
  POP_INSTALMENT_STEP,
  POP_MAX_INSTALMENT,
  POP_MIN_INSTALMENT,
} from '@/config/pop.config';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';
import { calculatePopSavings, snapPopInstalment } from '@/lib/utils/pop-savings';

interface PopSavingsCalculatorProps {
  initialAmount?: number;
  primaryLabel: string;
  onPrimaryAction: (monthlyInstalment: number) => void;
  className?: string;
}

/**
 * Parses manual instalment input digits into a snapped monthly amount.
 *
 * @param digits - Raw digit-only string from the amount field.
 */
function parseInstalmentInput(digits: string): number {
  if (!digits) {
    return POP_MIN_INSTALMENT;
  }

  return snapPopInstalment(
    Number.parseInt(digits, 10),
    POP_MIN_INSTALMENT,
    POP_MAX_INSTALMENT,
    POP_INSTALMENT_STEP,
  );
}

export function PopSavingsCalculator({
  initialAmount = POP_DEFAULT_INSTALMENT,
  primaryLabel,
  onPrimaryAction,
  className,
}: PopSavingsCalculatorProps) {
  const initialInstalment = snapPopInstalment(
    initialAmount,
    POP_MIN_INSTALMENT,
    POP_MAX_INSTALMENT,
    POP_INSTALMENT_STEP,
  );
  const [monthlyInstalment, setMonthlyInstalment] = useState(initialInstalment);
  const [amountInput, setAmountInput] = useState(String(initialInstalment));
  const [isAmountInputFocused, setIsAmountInputFocused] = useState(false);

  const previewInstalment = useMemo(() => {
    if (!isAmountInputFocused) {
      return monthlyInstalment;
    }

    return parseInstalmentInput(amountInput.replace(/[^\d]/g, ''));
  }, [amountInput, isAmountInputFocused, monthlyInstalment]);

  const breakdown = useMemo(() => calculatePopSavings(previewInstalment), [previewInstalment]);

  const progressPercent =
    ((previewInstalment - POP_MIN_INSTALMENT) / (POP_MAX_INSTALMENT - POP_MIN_INSTALMENT)) * 100;

  const commitAmountInput = (): void => {
    const snapped = parseInstalmentInput(amountInput.replace(/[^\d]/g, ''));
    setMonthlyInstalment(snapped);
    setAmountInput(String(snapped));
    setIsAmountInputFocused(false);
  };

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-col gap-[clamp(1.5rem,1.667vw,2rem)] rounded-[clamp(0.75rem,0.729vw,0.875rem)] bg-white p-[clamp(1.5rem,1.667vw,2rem)] shadow-[0_0.052vw_0.078vw_rgba(0,0,0,0.1),0_0.052vw_0.052vw_rgba(0,0,0,0.1)] lg:max-w-[min(44.583vw,53.5rem)]',
        className,
      )}
    >
      <div className="flex flex-col gap-[clamp(1.5rem,1.667vw,2rem)]">
        <label
          htmlFor="pop-instalment-amount"
          className="text-[clamp(1rem,0.9375vw,1.125rem)] font-normal text-[var(--pop-text-body)] [&_strong]:font-medium [&_strong]:text-[var(--pop-text-primary)]"
        >
          Monthly Instalment <strong>(Multiples of ₹1,000 only)</strong>
        </label>

        <div className="flex h-[clamp(2.75rem,3.021vw,3.625rem)] items-center justify-between gap-2 rounded-[clamp(0.75rem,0.729vw,0.875rem)] border border-[var(--pop-icon-base)] bg-white px-[clamp(0.85rem,0.885vw,1.0625rem)]">
          <input
            id="pop-instalment-amount"
            type="text"
            inputMode="numeric"
            aria-label="Monthly instalment amount"
            value={isAmountInputFocused ? amountInput : formatPrice(monthlyInstalment)}
            onFocus={() => {
              setIsAmountInputFocused(true);
              setAmountInput(String(monthlyInstalment));
            }}
            onBlur={commitAmountInput}
            onChange={(event) => {
              setAmountInput(event.target.value.replace(/[^\d]/g, ''));
            }}
            className="min-w-0 flex-1 border-none bg-transparent text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[var(--pop-text-primary)] outline-none"
          />
          {/* Desktop-only adornment; mobile Figma uses amount-only row (CTA is the primary button). */}
          <span
            aria-hidden="true"
            className="hidden shrink-0 text-[clamp(0.875rem,0.833vw,1rem)] font-medium text-[var(--pop-brand-tint)] lg:inline"
          >
            Start Investing
          </span>
        </div>
      </div>

      <div className="relative h-[clamp(1.25rem,1.25vw,1.5rem)] w-full">
        <input
          type="range"
          min={POP_MIN_INSTALMENT}
          max={POP_MAX_INSTALMENT}
          step={POP_INSTALMENT_STEP}
          value={previewInstalment}
          aria-label="Adjust monthly instalment"
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            setMonthlyInstalment(next);
            setAmountInput(String(next));
          }}
          className="pop-range absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent"
          style={
            {
              '--pop-range-progress': `${progressPercent}%`,
            } as CSSProperties
          }
        />
        <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-[0.3125vw] max-h-[6px] min-h-[4px] -translate-y-1/2 rounded-full bg-[#d9d9d9]">
          <div
            className="h-full rounded-full bg-[var(--pop-slider)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[clamp(1rem,1.25vw,1.5rem)]">
        <div className="flex flex-col gap-[clamp(0.65rem,0.625vw,0.75rem)]">
          <div className="flex items-center justify-between gap-2 text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[var(--pop-text-body)] sm:gap-4">
            <p className="min-w-0">Your Total Instalments (5 Months)</p>
            <p className="shrink-0 text-[var(--pop-text-primary)]">
              {formatPrice(breakdown.totalInstalments)}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[var(--pop-text-body)] sm:gap-4">
            <p className="min-w-0">Palmonas Bonus (6th Month)</p>
            <p className="shrink-0 font-bold text-[var(--pop-text-primary)]">
              {formatPrice(breakdown.bonusAmount)}
            </p>
          </div>
        </div>

        <div className="border-t border-[#ebebeb] pt-[clamp(1.25rem,1.302vw,1.5625rem)]">
          <div className="flex items-center justify-between gap-2 text-[clamp(0.875rem,0.833vw,1rem)] font-normal text-[var(--pop-text-body)] sm:gap-4">
            <p className="min-w-0 font-medium text-[var(--pop-text-primary)]">
              Total Redeemable Amount
            </p>
            <p className="shrink-0 text-[clamp(1.125rem,1.042vw,1.25rem)] font-bold text-[var(--pop-text-primary)]">
              {formatPrice(breakdown.redeemableAmount)}
            </p>
          </div>
        </div>

        <PopPrimaryButton
          onClick={() => onPrimaryAction(previewInstalment)}
          ariaLabel={primaryLabel}
        >
          {primaryLabel}
        </PopPrimaryButton>
      </div>
    </div>
  );
}
