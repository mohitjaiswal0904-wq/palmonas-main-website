import { POP_PAID_MONTHS, POP_TOTAL_MONTHS } from '@/config/pop.config';

export interface PopSavingsBreakdown {
  monthlyInstalment: number;
  totalInstalments: number;
  bonusAmount: number;
  redeemableAmount: number;
}

/**
 * Calculates POP savings plan amounts from a monthly instalment.
 *
 * @param monthlyInstalment - Monthly amount in INR (should be a multiple of 1000).
 * @returns Paid total, free-month bonus, and redeemable amount.
 */
export function calculatePopSavings(monthlyInstalment: number): PopSavingsBreakdown {
  const amount = Math.max(0, Math.round(monthlyInstalment));
  const totalInstalments = amount * POP_PAID_MONTHS;
  const bonusAmount = amount * (POP_TOTAL_MONTHS - POP_PAID_MONTHS);

  return {
    monthlyInstalment: amount,
    totalInstalments,
    bonusAmount,
    redeemableAmount: totalInstalments + bonusAmount,
  };
}

/**
 * Snaps a raw instalment value to the nearest ₹1,000 step within bounds.
 *
 * @param value - Raw numeric value from input or slider.
 * @param min - Minimum allowed instalment.
 * @param max - Maximum allowed instalment.
 * @param step - Increment size (default 1000).
 * @returns Clamped, stepped instalment amount.
 */
export function snapPopInstalment(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  const snapped = Math.round(value / step) * step;
  return Math.min(max, Math.max(min, snapped));
}
