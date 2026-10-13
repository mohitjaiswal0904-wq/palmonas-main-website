import type { ReactNode } from 'react';

import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';

interface PopPlanStatProps {
  value: string;
  label: string;
  valueClassName?: string;
}

function PopPlanStat({
  value,
  label,
  valueClassName,
  showMobileDivider,
}: PopPlanStatProps & { showMobileDivider?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3 sm:flex-1 sm:flex-col sm:justify-center sm:gap-2 sm:py-0 sm:text-center',
        showMobileDivider && 'border-b border-[#e5e7eb] sm:border-b-0',
      )}
    >
      <p className="text-sm font-normal text-[var(--pop-text-secondary)] sm:order-2 sm:text-[clamp(0.875rem,0.729vw,0.875rem)]">
        {label}
      </p>
      <p
        className={cn(
          'text-base font-bold sm:order-1 sm:text-[clamp(1.125rem,1.042vw,1.25rem)]',
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PopPlanStatDivider() {
  return (
    <div className="hidden w-px shrink-0 self-stretch bg-[#e5e7eb] sm:block" aria-hidden="true" />
  );
}

interface PopPlanStatsRowProps {
  monthlyAmount: number;
  paidSoFar: number;
  totalValue: number;
  monthlyLabel: string;
  paidLabel: string;
  totalLabel: string;
}

/** Responsive monthly / paid / total stats row from Figma. */
export function PopPlanStatsRow({
  monthlyAmount,
  paidSoFar,
  totalValue,
  monthlyLabel,
  paidLabel,
  totalLabel,
}: PopPlanStatsRowProps) {
  return (
    <div className="p-4 sm:flex sm:items-start sm:gap-4 sm:p-5">
      <PopPlanStat
        value={formatPrice(monthlyAmount)}
        label={monthlyLabel}
        valueClassName="text-[var(--pop-brand-tint)]"
        showMobileDivider
      />
      <PopPlanStatDivider />
      <PopPlanStat
        value={formatPrice(paidSoFar)}
        label={paidLabel}
        valueClassName="text-[var(--pop-text-primary)]"
        showMobileDivider
      />
      <PopPlanStatDivider />
      <PopPlanStat
        value={formatPrice(totalValue)}
        label={totalLabel}
        valueClassName="text-[var(--pop-green)]"
      />
    </div>
  );
}

interface PopPlanStatusBadgeProps {
  children: ReactNode;
  className?: string;
}

/** Small uppercase status pill on plan cards. */
export function PopPlanStatusBadge({ children, className }: PopPlanStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--pop-green)] px-2.5 py-1 text-[0.625rem] font-medium tracking-wide text-white uppercase sm:px-[0.58rem] sm:py-[0.29rem] sm:text-[0.64rem]',
        className,
      )}
    >
      {children}
    </span>
  );
}
