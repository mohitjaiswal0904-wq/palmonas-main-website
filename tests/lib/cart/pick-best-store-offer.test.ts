import { pickBestStoreOffer } from '@/lib/cart/pick-best-store-offer';
import type { CartStoreDiscount } from '@/types/cart';

function offer(partial: Partial<CartStoreDiscount> & Pick<CartStoreDiscount, 'discountCode'>): CartStoreDiscount {
  return {
    offerType: 'store_offer',
    discountDetail: '',
    ...partial,
  };
}

describe('pickBestStoreOffer', () => {
  it('returns null when there are no offers', () => {
    expect(pickBestStoreOffer([])).toBeNull();
  });

  it('prefers the highest amount saved', () => {
    expect(
      pickBestStoreOffer([
        offer({ discountCode: 'SAVE10', amountSaved: 100 }),
        offer({ discountCode: 'STACK40', amountSaved: 400 }),
      ])?.discountCode,
    ).toBe('STACK40');
  });

  it('prefers a highlighted offer over a larger save', () => {
    expect(
      pickBestStoreOffer([
        offer({ discountCode: 'STACK40', amountSaved: 400 }),
        offer({ discountCode: 'HERO', amountSaved: 50, highlighted: true }),
      ])?.discountCode,
    ).toBe('HERO');
  });
});
