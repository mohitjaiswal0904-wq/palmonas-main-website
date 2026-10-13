import { transformProductBundles } from '@/services/product-transform';
import { PRODUCT_BUNDLE_KEYS } from '@/types/product/bundles';

describe('transformProductBundles', () => {
  it('maps non-empty rails and keeps API order', () => {
    const result = transformProductBundles({
      product_id: 'gid://shopify/Product/7759111586049',
      handle: 'hearts-all-over-bracelet-18k-gold-plated-88883',
      bundles: [
        {
          key: PRODUCT_BUNDLE_KEYS.COMPLETE_LOOK,
          title: 'Complete Look',
          count: 1,
          products: [{ id: 'p1', handle: 'look-1', name: 'Look Ring', price: 999 }],
        },
        {
          key: PRODUCT_BUNDLE_KEYS.SHOP_THE_LOOK,
          title: 'Shop the Look',
          count: 1,
          products: [{ id: 'p2', handle: 'look-2', name: 'Look Earrings', price: 1299 }],
        },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.key).toBe(PRODUCT_BUNDLE_KEYS.COMPLETE_LOOK);
    expect(result[0]?.title).toBe('Complete Look');
    expect(result[0]?.products[0]?.name).toBe('Look Ring');
    expect(result[1]?.title).toBe('Shop the Look');
  });

  it('unwraps an enveloped payload', () => {
    const result = transformProductBundles({
      data: {
        handle: 'gold-ring',
        bundles: [
          {
            key: PRODUCT_BUNDLE_KEYS.SAVE_WITH_THE_SET,
            title: 'Save with the Set',
            products: [{ id: 'p3', handle: 'set-1', name: 'Set Pendant', price: 1999 }],
          },
        ],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.products[0]?.handle).toBe('set-1');
  });

  it('drops rails with an empty products list', () => {
    const result = transformProductBundles({
      bundles: [
        {
          key: PRODUCT_BUNDLE_KEYS.COMPLETE_LOOK,
          title: 'Complete Look',
          count: 13,
          products: [],
        },
        {
          key: PRODUCT_BUNDLE_KEYS.SHOP_THE_LOOK,
          title: 'Shop the Look',
          count: 0,
        },
      ],
    });

    expect(result).toEqual([]);
  });

  it('uses config fallback when the API title is blank', () => {
    const result = transformProductBundles({
      bundles: [
        {
          key: PRODUCT_BUNDLE_KEYS.COMPLETE_LOOK,
          title: '   ',
          products: [{ id: 'p4', handle: 'look-4', name: 'Fallback Ring', price: 500 }],
        },
      ],
    });

    expect(result[0]?.title).toBe('Complete Look');
  });
});
