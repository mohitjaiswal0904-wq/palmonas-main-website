import {
  collectStoreOfferCodes,
  intersectLineOffersWithDiscountList,
} from '@/lib/cart/intersect-line-offers';
import type { CartDiscountOffer, CartItemApplicableDiscount } from '@/types/cart';

const lineOffers: CartItemApplicableDiscount[] = [
  { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
  { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
  { key: 'BDAY3', label: 'Buy 3 At ₹2999', code: 'BDAY3' },
];

const listOffers: CartDiscountOffer[] = [
  {
    offerType: 'store_offer',
    discountCode: 'b1g1',
    discountDetail: 'Buy 1 Get 1 Free',
  },
  {
    offerType: 'store_offer',
    discountCode: 'monsoon4',
    discountDetail: 'Buy 4 at 2999',
  },
  {
    offerType: 'payment_offer',
    discountCode: 'NAVIUPI',
    discountDetail: 'UPI cashback',
  },
];

describe('collectStoreOfferCodes', () => {
  it('collects only store offer codes uppercased', () => {
    expect(collectStoreOfferCodes(listOffers)).toEqual(new Set(['B1G1', 'MONSOON4']));
  });

  it('returns empty set for empty or missing lists', () => {
    expect(collectStoreOfferCodes([])).toEqual(new Set());
    expect(collectStoreOfferCodes(null)).toEqual(new Set());
    expect(collectStoreOfferCodes(undefined)).toEqual(new Set());
  });
});

describe('intersectLineOffersWithDiscountList', () => {
  it('returns only line offers present in the discount list', () => {
    expect(intersectLineOffersWithDiscountList(lineOffers, listOffers)).toEqual([
      { key: 'MONSOON4', label: 'Buy 4 At ₹2999', code: 'MONSOON4' },
      { key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' },
    ]);
  });

  it('includes only available store offers from the list API', () => {
    expect(
      intersectLineOffersWithDiscountList(lineOffers, [
        {
          offerType: 'store_offer',
          discountCode: 'B1G1',
          discountDetail: 'Buy 1 Get 1 Free',
        },
      ]),
    ).toEqual([{ key: 'B1G1', label: 'Buy 1 Get 1', code: 'B1G1' }]);
  });

  it('returns empty when list has no matching store offers', () => {
    expect(
      intersectLineOffersWithDiscountList(lineOffers, [
        {
          offerType: 'payment_offer',
          discountCode: 'NAVIUPI',
          discountDetail: 'cashback',
        },
      ]),
    ).toEqual([]);
  });

  it('returns empty when line has no applicable discounts', () => {
    expect(intersectLineOffersWithDiscountList([], listOffers)).toEqual([]);
    expect(intersectLineOffersWithDiscountList(undefined, listOffers)).toEqual([]);
  });

  it('matches when line key differs from code but either hits the list', () => {
    expect(
      intersectLineOffersWithDiscountList(
        [{ key: 'promo-b1g1', label: 'Buy 1 Get 1', code: 'B1G1' }],
        listOffers,
      ),
    ).toEqual([{ key: 'promo-b1g1', label: 'Buy 1 Get 1', code: 'B1G1' }]);
  });
});
