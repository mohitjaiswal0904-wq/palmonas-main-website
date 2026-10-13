export interface FreeGiftProgress {
  currentAmount: number;
  targetAmount: number;
  progressPercent: number;
  remainingAmount: number;
  isUnlocked: boolean;
}

/**
 * Computes free-gift unlock progress from cart subtotal and threshold.
 *
 * @param cartTotal - Current cart total in rupees (after discounts, before wallet).
 * @param targetAmount - Unlock threshold in rupees.
 * @returns Progress snapshot capped at 100%.
 */
export function buildFreeGiftProgress(cartTotal: number, targetAmount: number): FreeGiftProgress {
  const currentAmount = Math.max(0, cartTotal);
  const safeTarget = Math.max(0, targetAmount);
  const isUnlocked = safeTarget > 0 && currentAmount >= safeTarget;
  const progressPercent =
    safeTarget > 0 ? (isUnlocked ? 100 : Math.floor((currentAmount / safeTarget) * 100)) : 0;
  const remainingAmount = Math.max(0, safeTarget - currentAmount);

  return {
    currentAmount,
    targetAmount: safeTarget,
    progressPercent,
    remainingAmount,
    isUnlocked,
  };
}

/**
 * Whether remaining spend is close enough that one typical item unlocks the gift.
 *
 * @param remainingAmount - Rupees still needed to unlock.
 * @param oneItemMaxRemaining - Ceiling treated as “one item away”.
 */
export function isFreeGiftOneItemAway(
  remainingAmount: number,
  oneItemMaxRemaining: number,
): boolean {
  return remainingAmount > 0 && remainingAmount <= Math.max(0, oneItemMaxRemaining);
}

/**
 * Replaces `{token}` placeholders in configured cart copy.
 *
 * @param template - Message template containing optional placeholders.
 * @param values - Token values to inject.
 * @returns Interpolated copy string.
 */
export function fillCartMessageTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (message, [token, value]) => message.replaceAll(`{${token}}`, String(value)),
    template,
  );
}
