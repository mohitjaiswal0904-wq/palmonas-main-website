import { formatPrice } from '@/lib/format-price';
import {
  calculatePopSavings,
  snapPopInstalment,
} from '@/lib/utils/pop-savings';

describe('calculatePopSavings', () => {
  it('computes 5 paid months and 1 free month bonus', () => {
    expect(calculatePopSavings(3000)).toEqual({
      monthlyInstalment: 3000,
      totalInstalments: 15_000,
      bonusAmount: 3000,
      redeemableAmount: 18_000,
    });
  });

  it('returns zeros for non-positive amounts', () => {
    expect(calculatePopSavings(0).redeemableAmount).toBe(0);
    expect(calculatePopSavings(-1000).redeemableAmount).toBe(0);
  });
});

describe('snapPopInstalment', () => {
  it('snaps to the nearest thousand within bounds', () => {
    expect(snapPopInstalment(2450, 1000, 50_000, 1000)).toBe(2000);
    expect(snapPopInstalment(2600, 1000, 50_000, 1000)).toBe(3000);
  });

  it('clamps below min and above max', () => {
    expect(snapPopInstalment(100, 1000, 50_000, 1000)).toBe(1000);
    expect(snapPopInstalment(99_000, 1000, 50_000, 1000)).toBe(50_000);
  });
});

describe('formatPrice for pop UI', () => {
  it('formats INR without decimals', () => {
    expect(formatPrice(18_000)).toBe('₹18,000');
  });
});
