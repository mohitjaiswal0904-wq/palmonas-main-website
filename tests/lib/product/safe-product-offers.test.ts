import { toSafeProductOffers } from '@/lib/product/safe-product-offers';
import type { ProductOffer } from '@/types/product';

const mockOffer: ProductOffer = {
  key: 'api-offer-1',
  name: 'Buy 1 Get 1 Free',
  description: 'Note: You need to add minimum 2 products to avail this discount.',
  code: 'B1G1',
  type: 'FREEBIE',
  discountValue: 3266,
  placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
};

describe('toSafeProductOffers', () => {
  it('prefers coupon code over key and keeps display fields', () => {
    const [offer] = toSafeProductOffers([mockOffer]);

    expect(offer).toMatchObject({
      key: 'api-offer-1',
      name: 'Buy 1 Get 1 Free',
      description: 'Note: You need to add minimum 2 products to avail this discount.',
      code: 'B1G1',
      type: 'FREEBIE',
    });
  });

  it('fills description from placeholder when description is missing', () => {
    const [offer] = toSafeProductOffers([
      {
        key: mockOffer.key,
        name: mockOffer.name,
        code: mockOffer.code,
        type: mockOffer.type,
        discountValue: mockOffer.discountValue,
        placeholder: [{ text: 'Limited Time Offer', style: 'normal' }],
      } as ProductOffer,
    ]);

    expect(offer?.description).toBe('Limited Time Offer');
    expect(offer?.code).toBe('B1G1');
  });

  it('returns an empty list when offers are missing or empty', () => {
    expect(toSafeProductOffers(undefined)).toEqual([]);
    expect(toSafeProductOffers(null)).toEqual([]);
    expect(toSafeProductOffers([])).toEqual([]);
  });

  it('keeps payablePrice from listing discounts', () => {
    expect(toSafeProductOffers([{ ...mockOffer, payablePrice: 833 }])[0]).toMatchObject({
      payablePrice: 833,
    });
  });

  it('keeps collection handles used by Shop By Offers', () => {
    expect(
      toSafeProductOffers([
        {
          ...mockOffer,
          collections: [{ id: null, title: null, handle: 'monsoon-sale', image: null }],
        },
      ])[0],
    ).toMatchObject({
      collections: [{ id: null, title: null, handle: 'monsoon-sale', image: null }],
    });
  });

  it('drops offers that have no coupon, name, description, or freebie', () => {
    expect(
      toSafeProductOffers([
        {
          key: '',
          name: '',
          description: '',
          code: '',
          type: 'DISCOUNT',
          placeholder: [],
        },
      ]),
    ).toEqual([]);
  });
});
