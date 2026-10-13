import { cartMessages } from '@/config/cart/cart.config';

/**
 * Whether an apply-failure string is item-count unlock copy (misleading on manual apply).
 *
 * @param message - Raw API or fallback apply error.
 * @returns True when the message tells the shopper to add more products to unlock/avail an offer.
 */
export function isItemCountUnlockApplyMessage(message: string): boolean {
  const text = message.trim().toLowerCase();
  if (!text) return false;
  const mentionsAddProducts = /\badd\b/.test(text) && /\bproducts?\b/.test(text);
  const mentionsOfferUnlock = /\b(avail|unlock|offer)\b/.test(text);
  return mentionsAddProducts && mentionsOfferUnlock;
}

/**
 * Maps a coupon apply failure to user-facing copy for the cart text-field Apply action.
 *
 * @param apiMessage - Trimmed `error_message` from applyFailures, or null.
 * @returns Config copy when the coupon is not applicable to cart products; otherwise the API message.
 */
export function resolveManualCouponApplyError(apiMessage: string | null): string | null {
  if (!apiMessage) return null;
  if (isItemCountUnlockApplyMessage(apiMessage)) {
    return cartMessages.errors.couponNotApplicable;
  }
  return apiMessage;
}
