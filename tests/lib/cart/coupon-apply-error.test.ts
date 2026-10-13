import { cartMessages } from '@/config/cart/cart.config';
import {
  isItemCountUnlockApplyMessage,
  resolveManualCouponApplyError,
} from '@/lib/cart/coupon-apply-error';

describe('isItemCountUnlockApplyMessage', () => {
  it('matches add-more-products avail copy from the apply API', () => {
    expect(isItemCountUnlockApplyMessage('Add 2 more products to avail this offer')).toBe(true);
  });

  it('matches add-one-product unlock copy', () => {
    expect(isItemCountUnlockApplyMessage('Add one more product to unlock')).toBe(true);
  });

  it('rejects empty or unrelated apply errors', () => {
    expect(isItemCountUnlockApplyMessage('')).toBe(false);
    expect(
      isItemCountUnlockApplyMessage('The discount code entered is invalid. Please enter a valid code.'),
    ).toBe(false);
  });
});

describe('resolveManualCouponApplyError', () => {
  it('replaces item-count unlock copy with the cart-products message', () => {
    expect(resolveManualCouponApplyError('Add 2 more products to avail this offer')).toBe(
      cartMessages.errors.couponNotApplicable,
    );
  });

  it('passes through invalid-code errors', () => {
    const apiMessage = 'The discount code entered is invalid. Please enter a valid code.';
    expect(resolveManualCouponApplyError(apiMessage)).toBe(apiMessage);
  });

  it('returns null when the API sent no message', () => {
    expect(resolveManualCouponApplyError(null)).toBeNull();
  });
});
