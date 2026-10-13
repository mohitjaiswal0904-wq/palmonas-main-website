import { pickStoreOfferSwap } from '@/lib/cart/pick-store-offer-swap';
import type { CartStoreDiscount } from '@/types/cart';

function offer(
  partial: Partial<CartStoreDiscount> & Pick<CartStoreDiscount, 'discountCode'>,
): CartStoreDiscount {
  return {
    offerType: 'store_offer',
    discountDetail: '',
    ...partial,
  };
}

describe('pickStoreOfferSwap', () => {
  it('returns STACK3 when it saves more than applied STACK2', () => {
    const result = pickStoreOfferSwap('STACK2', 99, [
      offer({ discountCode: 'STACK2', amountSaved: 99 }),
      offer({ discountCode: 'STACK3', amountSaved: 299 }),
    ]);

    expect(result?.better.discountCode).toBe('STACK3');
    expect(result?.extraSaved).toBe(200);
  });

  it('prefers a highlighted offer even if another saves more', () => {
    const result = pickStoreOfferSwap('STACK2', 50, [
      offer({ discountCode: 'STACK2', amountSaved: 50 }),
      offer({ discountCode: 'STACK3', amountSaved: 400 }),
      offer({ discountCode: 'HERO', amountSaved: 80, highlighted: true }),
    ]);

    expect(result?.better.discountCode).toBe('HERO');
    expect(result?.extraSaved).toBe(30);
  });

  it('returns null when the best alternative saves the same', () => {
    expect(
      pickStoreOfferSwap('STACK2', 99, [
        offer({ discountCode: 'STACK2', amountSaved: 99 }),
        offer({ discountCode: 'STACK3', amountSaved: 99 }),
      ]),
    ).toBeNull();
  });

  it('returns null when only the applied offer is available', () => {
    expect(
      pickStoreOfferSwap('STACK2', 99, [offer({ discountCode: 'STACK2', amountSaved: 99 })]),
    ).toBeNull();
  });
});
