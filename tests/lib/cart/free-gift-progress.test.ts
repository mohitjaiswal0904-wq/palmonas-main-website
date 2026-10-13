import {
  buildFreeGiftProgress,
  fillCartMessageTemplate,
  isFreeGiftOneItemAway,
} from '@/lib/cart/free-gift-progress';

describe('buildFreeGiftProgress', () => {
  it('computes progress toward the unlock threshold', () => {
    expect(buildFreeGiftProgress(1500, 2999)).toEqual({
      currentAmount: 1500,
      targetAmount: 2999,
      progressPercent: 50,
      remainingAmount: 1499,
      isUnlocked: false,
    });
  });

  it('caps progress at 100% when cart exceeds the threshold', () => {
    expect(buildFreeGiftProgress(4500, 2999)).toEqual({
      currentAmount: 4500,
      targetAmount: 2999,
      progressPercent: 100,
      remainingAmount: 0,
      isUnlocked: true,
    });
  });

  it('does not round up to 100% before the threshold is reached', () => {
    expect(buildFreeGiftProgress(2997, 2999)).toEqual({
      currentAmount: 2997,
      targetAmount: 2999,
      progressPercent: 99,
      remainingAmount: 2,
      isUnlocked: false,
    });
  });

  it('treats negative subtotals as zero progress', () => {
    expect(buildFreeGiftProgress(-100, 2999)).toEqual({
      currentAmount: 0,
      targetAmount: 2999,
      progressPercent: 0,
      remainingAmount: 2999,
      isUnlocked: false,
    });
  });
});

describe('isFreeGiftOneItemAway', () => {
  it('is true when remaining is within the one-item ceiling', () => {
    expect(isFreeGiftOneItemAway(999, 1999)).toBe(true);
    expect(isFreeGiftOneItemAway(1999, 1999)).toBe(true);
  });

  it('is false when remaining is zero, above the ceiling, or the ceiling is invalid', () => {
    expect(isFreeGiftOneItemAway(0, 1999)).toBe(false);
    expect(isFreeGiftOneItemAway(2000, 1999)).toBe(false);
    expect(isFreeGiftOneItemAway(100, 0)).toBe(false);
  });
});

describe('fillCartMessageTemplate', () => {
  it('replaces configured placeholders', () => {
    expect(
      fillCartMessageTemplate('Add ₹{amount} more to unlock {highlight}!', {
        amount: '500',
        highlight: 'Free Gift',
      }),
    ).toBe('Add ₹500 more to unlock Free Gift!');
  });
});
