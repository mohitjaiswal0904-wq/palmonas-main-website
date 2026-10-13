import {
  getOfferCodeLabel,
  getOfferDescription,
  getOfferPrice,
  getProductCardOfferEffectivePrice,
  getProductCardOfferPromo,
  getShopByOfferTabs,
  isNewArrivalProduct,
  isNewArrivalsCollectionHandle,
  productMatchesCollectionOffer,
  shouldShowNewArrivalsFallback,
} from '@/lib/utils/offer';
import type { Product, ProductOffer } from '@/types/product';

const discountOffer: ProductOffer = {
  key: 'offer-1',
  name: 'Extra 10% off',
  description: 'Use at checkout.',
  code: 'EXTRA10',
  type: 'DISCOUNT',
  discountValue: 10,
  placeholder: [{ text: 'Limited Time Offer', style: 'normal' }],
};

const freebieOffer: ProductOffer = {
  key: 'offer-2',
  name: 'Buy 1 Get 1 Free',
  description: 'Add two items.',
  code: 'B1G1',
  type: 'FREEBIE',
  discountValue: 3266,
  placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
};

describe('getOfferPrice', () => {
  it('prefers a bundled price embedded in the offer name', () => {
    expect(
      getOfferPrice(
        { ...discountOffer, name: 'Get it for ₹1,499 with SAVE10' },
        5000,
      ),
    ).toBe(1499);
  });

  it('falls back to discount value then product price', () => {
    expect(getOfferPrice(discountOffer, 5000)).toBe(10);
    expect(getOfferPrice({ ...discountOffer, discountValue: null }, 5000)).toBe(5000);
  });
});

describe('getOfferDescription', () => {
  it('combines placeholder headline and description when both exist', () => {
    expect(getOfferDescription(discountOffer)).toBe('Limited Time Offer! Use at checkout.');
  });

  it('falls back to offer name when description is empty', () => {
    expect(getOfferDescription({ ...discountOffer, description: '' })).toBe('Extra 10% off');
  });
});

describe('getOfferCodeLabel', () => {
  it('collapses freebie offers to B1G1', () => {
    expect(getOfferCodeLabel(freebieOffer)).toBe('B1G1');
  });

  it('returns the coupon code for discount offers', () => {
    expect(getOfferCodeLabel(discountOffer)).toBe('EXTRA10');
  });
});

describe('getProductCardOfferPromo', () => {
  it('returns null when there are no offers', () => {
    expect(getProductCardOfferPromo([])).toBeNull();
  });

  it('uses the first offer name and counts remaining offers', () => {
    expect(getProductCardOfferPromo([discountOffer, freebieOffer])).toEqual({
      primaryText: 'Extra 10% off',
      additionalCount: 1,
    });
  });

  it('falls back to placeholder headline when offer name is blank', () => {
    expect(
      getProductCardOfferPromo([{ ...discountOffer, name: '' }]),
    ).toEqual({
      primaryText: 'Limited Time Offer',
      additionalCount: 0,
    });
  });

  it('falls back to description when name and placeholder are blank', () => {
    expect(
      getProductCardOfferPromo([
        { ...discountOffer, name: '', description: 'Use at checkout.', placeholder: [] },
      ]),
    ).toEqual({
      primaryText: 'Use at checkout.',
      additionalCount: 0,
    });
  });

  it('returns null when the first offer has no display text', () => {
    expect(
      getProductCardOfferPromo([
        { ...discountOffer, name: '', description: '', placeholder: [] },
      ]),
    ).toBeNull();
  });
});

describe('getProductCardOfferEffectivePrice', () => {
  it('uses the first discount payable price instead of the selling price or bundle total', () => {
    expect(
      getProductCardOfferEffectivePrice(
        [
          {
            ...discountOffer,
            name: 'Buy 6 At ₹4999',
            discountValue: 4999,
            payablePrice: 833,
          },
        ],
        999,
      ),
    ).toBe(833);
  });

  it('reads a cheaper rupee amount from discount offer copy', () => {
    expect(
      getProductCardOfferEffectivePrice(
        [discountOffer, { ...discountOffer, key: 'offer-price', name: 'Get it for ₹1,111 with offers' }],
        1700,
      ),
    ).toBe(1111);
  });

  it('reads a cheaper rupee amount from the offer description', () => {
    expect(
      getProductCardOfferEffectivePrice(
        [{ ...discountOffer, description: 'Pay just ₹2,499 at checkout.' }],
        5000,
      ),
    ).toBe(2499);
  });

  it('reads a cheaper rupee amount from split placeholder copy', () => {
    expect(
      getProductCardOfferEffectivePrice(
        [
          {
            ...discountOffer,
            placeholder: [
              { text: 'Get it at', style: 'normal' },
              { text: '₹1,111', style: 'bold' },
            ],
          },
        ],
        1700,
      ),
    ).toBe(1111);
  });

  it('falls back to the selling price when copy has no cheaper rupee amount', () => {
    expect(getProductCardOfferEffectivePrice([discountOffer, freebieOffer], 1700)).toBe(1700);
  });

  it('ignores freebie worth amounts', () => {
    expect(
      getProductCardOfferEffectivePrice(
        [discountOffer, { ...freebieOffer, name: 'Freebie worth ₹9,200' }],
        1700,
      ),
    ).toBe(1700);
  });

  it('returns null for an empty offer list', () => {
    expect(getProductCardOfferEffectivePrice([], 1700)).toBeNull();
  });
});

const baseProduct: Pick<Product, 'badgeLabel' | 'filterAttributes' | 'productTags'> = {
  badgeLabel: undefined,
  filterAttributes: undefined,
  productTags: undefined,
};

describe('isNewArrivalsCollectionHandle', () => {
  it('matches the canonical new-arrivals handle', () => {
    expect(isNewArrivalsCollectionHandle('new-arrivals')).toBe(true);
    expect(isNewArrivalsCollectionHandle('New Arrivals')).toBe(true);
  });

  it('rejects unrelated handles', () => {
    expect(isNewArrivalsCollectionHandle('best-sellers')).toBe(false);
    expect(isNewArrivalsCollectionHandle(undefined)).toBe(false);
  });
});

describe('isNewArrivalProduct', () => {
  it('detects New Arrivals from product tags', () => {
    expect(
      isNewArrivalProduct({
        ...baseProduct,
        filterAttributes: { tags: ['new-arrivals'] },
      }),
    ).toBe(true);
  });

  it('detects New Arrivals from badge label', () => {
    expect(isNewArrivalProduct({ ...baseProduct, badgeLabel: 'New Arrival' })).toBe(true);
  });

  it('returns false when the product has no New Arrivals markers', () => {
    expect(
      isNewArrivalProduct({
        ...baseProduct,
        filterAttributes: { tags: ['bestseller'] },
      }),
    ).toBe(false);
  });
});

describe('shouldShowNewArrivalsFallback', () => {
  it('is true when the listing collection is new-arrivals', () => {
    expect(shouldShowNewArrivalsFallback(baseProduct, 'new-arrivals')).toBe(true);
  });

  it('is true when the product itself is tagged as new arrivals', () => {
    expect(
      shouldShowNewArrivalsFallback({
        ...baseProduct,
        productTags: [{ name: 'collection', value: 'New Arrivals' }],
      }),
    ).toBe(true);
  });

  it('is false when neither collection nor product indicates new arrivals', () => {
    expect(shouldShowNewArrivalsFallback(baseProduct, 'rings')).toBe(false);
  });
});

describe('getShopByOfferTabs', () => {
  it('keeps discounts that include a collection handle', () => {
    expect(
      getShopByOfferTabs([
        {
          ...discountOffer,
          key: 'BDAY6',
          name: 'Buy 6 At ₹4999',
          code: 'BDAY6',
          collections: [
            {
              id: 'gid://shopify/Collection/479178326273',
              title: 'MONSOON SALE POS',
              handle: 'monsoon-sale-pos',
              image: null,
            },
          ],
        },
        {
          ...discountOffer,
          key: 'MONSOON4',
          name: 'Buy 4 At ₹2999',
          code: 'MONSOON4',
          collections: [{ id: null, title: null, handle: 'monsoon-sale', image: null }],
        },
      ]),
    ).toEqual([
      { key: 'BDAY6', name: 'Buy 6 At ₹4999', handle: 'monsoon-sale-pos' },
      { key: 'MONSOON4', name: 'Buy 4 At ₹2999', handle: 'monsoon-sale' },
    ]);
  });

  it('uses the first collection handle when an offer lists several', () => {
    expect(
      getShopByOfferTabs([
        {
          ...discountOffer,
          collections: [
            { id: null, title: null, handle: '  ', image: null },
            { id: null, title: null, handle: 'first-valid', image: null },
            { id: null, title: null, handle: 'second-valid', image: null },
          ],
        },
      ]),
    ).toEqual([{ key: 'offer-1', name: 'Extra 10% off', handle: 'first-valid' }]);
  });

  it('skips offers with an empty collections list', () => {
    expect(getShopByOfferTabs([freebieOffer, { ...discountOffer, collections: [] }])).toEqual([]);
  });

  it('skips duplicate keys, blank names, and collections without a handle', () => {
    expect(
      getShopByOfferTabs([
        {
          ...discountOffer,
          collections: [{ id: null, title: null, handle: '   ', image: null }],
        },
        { ...discountOffer, name: '   ', collections: [{ id: null, title: null, handle: 'x', image: null }] },
        {
          ...discountOffer,
          collections: [{ id: null, title: null, handle: 'kept', image: null }],
        },
        {
          ...discountOffer,
          name: 'Duplicate key',
          collections: [{ id: null, title: null, handle: 'other', image: null }],
        },
      ]),
    ).toEqual([{ key: 'offer-1', name: 'Extra 10% off', handle: 'kept' }]);
  });
});

describe('productMatchesCollectionOffer', () => {
  it('matches when the chip label appears in the offer name', () => {
    expect(
      productMatchesCollectionOffer({ offers: [freebieOffer] }, 'Buy 1 Get 1 Free'),
    ).toBe(true);
  });

  it('matches on offer code', () => {
    expect(productMatchesCollectionOffer({ offers: [discountOffer] }, 'EXTRA10')).toBe(true);
  });

  it('returns false when no offer matches the chip', () => {
    expect(productMatchesCollectionOffer({ offers: [discountOffer] }, 'Buy 1 Get 1')).toBe(
      false,
    );
  });

  it('treats a blank chip as a match-all', () => {
    expect(productMatchesCollectionOffer({ offers: [] }, '  ')).toBe(true);
  });
});
