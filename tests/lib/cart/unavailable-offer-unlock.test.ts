import {
  resolveUnavailableItemCountMissing,
  resolveUnavailableOfferHref,
  resolveUnavailableOfferUnlock,
} from '@/lib/cart/unavailable-offer-unlock';
import type { CartStoreDiscount } from '@/types/cart';

const baseOffer: CartStoreDiscount = {
  offerType: 'store_offer',
  discountCode: 'mangalsutra25',
  discountDetail: '25% off MANGALSUTRA',
  entitledCollectionHandles: ['mangalsutra'],
  failure_data: {
    reason: 'prerequisite_items_not_added',
    itemCountMissing: 1,
    missingEntitledDetails: {
      collectionIds: [394892443905],
      itemCountMissing: 1,
    },
  },
  collections: [
    {
      id: 'gid://shopify/Collection/394892443905',
      title: 'MANGALSUTRA',
      handle: 'mangalsutra',
      image: null,
    },
  ],
};

describe('resolveUnavailableItemCountMissing', () => {
  it('prefers missingEntitledDetails.itemCountMissing', () => {
    expect(
      resolveUnavailableItemCountMissing({
        ...baseOffer,
        failure_data: {
          itemCountMissing: 5,
          missingEntitledDetails: { itemCountMissing: 2 },
        },
      }),
    ).toBe(2);
  });

  it('falls back to failure itemCountMissing', () => {
    expect(
      resolveUnavailableItemCountMissing({
        ...baseOffer,
        failure_data: { itemCountMissing: 3 },
      }),
    ).toBe(3);
  });

  it('defaults to 1 when missing counts are absent', () => {
    expect(
      resolveUnavailableItemCountMissing({
        ...baseOffer,
        failure_data: { reason: 'prerequisite_items_not_added' },
      }),
    ).toBe(1);
  });

  it('ignores non-positive counts', () => {
    expect(
      resolveUnavailableItemCountMissing({
        ...baseOffer,
        failure_data: { itemCountMissing: 0 },
      }),
    ).toBe(1);
  });
});

describe('resolveUnavailableOfferHref', () => {
  it('uses collections[0].handle when present', () => {
    expect(resolveUnavailableOfferHref(baseOffer)).toBe('/collections/mangalsutra');
  });

  it('falls back to entitledCollectionHandles', () => {
    expect(
      resolveUnavailableOfferHref({
        ...baseOffer,
        collections: [],
        entitledCollectionHandles: ['monsoon-sale'],
      }),
    ).toBe('/collections/monsoon-sale');
  });

  it('returns null when no handle exists', () => {
    expect(
      resolveUnavailableOfferHref({
        ...baseOffer,
        collections: [],
        entitledCollectionHandles: [],
      }),
    ).toBeNull();
  });
});

describe('resolveUnavailableOfferUnlock', () => {
  it('returns count and href together', () => {
    expect(resolveUnavailableOfferUnlock(baseOffer)).toEqual({
      itemCountMissing: 1,
      href: '/collections/mangalsutra',
    });
  });
});
