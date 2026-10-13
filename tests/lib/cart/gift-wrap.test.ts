import {
  findGiftWrapLineId,
  findGiftWrapQuantity,
  isGiftWrapLine,
  sumCartQuantityExcludingGiftWrap,
} from '@/lib/cart/gift-wrap';

const WRAP_ID = '9132590334209';

/**
 * Builds a minimal cart line for gift-wrap helper tests.
 *
 * @param id - Line id.
 * @param variantId - Product variant id.
 * @param quantity - Line quantity.
 */
function line(id: string, variantId: string, quantity: number) {
  return { id, quantity, product: { variantId } };
}

describe('gift-wrap helpers', () => {
  it('matches gift wrap by numeric variant id', () => {
    expect(
      isGiftWrapLine(line('1', `gid://shopify/ProductVariant/${WRAP_ID}`, 1), WRAP_ID),
    ).toBe(true);
  });

  it('rejects non-wrap lines', () => {
    expect(isGiftWrapLine(line('1', '111', 2), WRAP_ID)).toBe(false);
  });

  it('sums quantities excluding gift wrap', () => {
    const items = [
      line('a', '111', 2),
      line('b', WRAP_ID, 5),
      line('c', '222', 1),
    ];
    expect(sumCartQuantityExcludingGiftWrap(items, WRAP_ID)).toBe(3);
  });

  it('returns 0 for empty cart sum', () => {
    expect(sumCartQuantityExcludingGiftWrap([], WRAP_ID)).toBe(0);
  });

  it('finds gift wrap line id', () => {
    const items = [line('a', '111', 1), line('wrap', WRAP_ID, 2)];
    expect(findGiftWrapLineId(items, WRAP_ID)).toBe('wrap');
  });

  it('returns null when gift wrap is missing', () => {
    expect(findGiftWrapLineId([line('a', '111', 1)], WRAP_ID)).toBeNull();
  });

  it('reads gift wrap quantity', () => {
    expect(findGiftWrapQuantity([line('wrap', WRAP_ID, 4)], WRAP_ID)).toBe(4);
  });

  it('returns 0 gift wrap quantity when absent', () => {
    expect(findGiftWrapQuantity([line('a', '111', 1)], WRAP_ID)).toBe(0);
  });
});
