import { withRelatedProductRatings } from '@/lib/product/related-product-ratings';
import type { Product, ProductOffer } from '@/types/product';

/**
 * Builds a minimal product offer for enrichment assertions.
 *
 * @param key - Offer key / code.
 * @returns Typed product offer.
 */
function makeOffer(key: string): ProductOffer {
  return {
    key,
    name: `${key} offer`,
    description: '',
    code: key,
    type: 'DISCOUNT',
    discountValue: 10,
    placeholder: [],
  };
}

/**
 * Builds a minimal product for catalog-enrichment assertions.
 *
 * @param id - Product id, also used as the handle prefix.
 * @param extras - Optional rating, offers, or catalog handle.
 * @returns Typed product with required fields filled.
 */
function makeProduct(
  id: string,
  extras?: {
    avgRating?: number;
    reviewCount?: number;
    offers?: ProductOffer[];
    handle?: string;
  },
): Product {
  return {
    id,
    handle: extras?.handle ?? `${id}-handle`,
    name: `Product ${id}`,
    description: '',
    price: 1000,
    image: '',
    images: [],
    category: 'rings',
    productCategory: 'demifine',
    offers: extras?.offers ?? [],
    variants: [],
    avgRating: extras?.avgRating,
    reviewCount: extras?.reviewCount,
  };
}

describe('withRelatedProductRatings', () => {
  it('fills ratings from the product-by-id lookup', async () => {
    const getProductById = jest.fn(async () =>
      makeProduct('9002103275777', { avgRating: 4.7, reviewCount: 370 }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('9002103275777')],
      getProductById,
    );

    expect(result[0]?.avgRating).toBe(4.7);
    expect(result[0]?.reviewCount).toBe(370);
    expect(getProductById).toHaveBeenCalledWith('9002103275777');
  });

  it('fills offers from the product-by-id lookup', async () => {
    const offer = makeOffer('SAVE10');
    const getProductById = jest.fn(async () => makeProduct('p1', { offers: [offer] }));

    const result = await withRelatedProductRatings([makeProduct('p1')], getProductById);

    expect(result[0]?.offers).toEqual([offer]);
    expect(getProductById).toHaveBeenCalledWith('p1');
  });

  it('keeps enrichment when catalog id format differs from the wishlist id', async () => {
    const offer = makeOffer('B1G1');
    const getProductById = jest.fn(async () =>
      makeProduct('gid://shopify/Product/9002103275777', {
        avgRating: 4.5,
        reviewCount: 12,
        offers: [offer],
      }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('9002103275777')],
      getProductById,
    );

    expect(result[0]?.avgRating).toBe(4.5);
    expect(result[0]?.offers).toEqual([offer]);
  });

  it('looks up numeric Shopify ids from product GIDs', async () => {
    const getProductById = jest.fn(async () =>
      makeProduct('9002103275777', { avgRating: 4.1, reviewCount: 8 }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('gid://shopify/Product/9002103275777')],
      getProductById,
    );

    expect(getProductById).toHaveBeenCalledWith('9002103275777');
    expect(result[0]?.avgRating).toBe(4.1);
  });

  it('replaces a numeric handle with the catalog handle so PDP links work', async () => {
    const getProductById = jest.fn(async () =>
      makeProduct('9002103275777', {
        handle: 'rope-chain-6-mm',
        avgRating: 4.4,
        reviewCount: 20,
      }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('9002103275777', { handle: '9002103275777' })],
      getProductById,
    );

    expect(result[0]?.handle).toBe('rope-chain-6-mm');
  });

  it('skips lookups when every product already has rating and offers', async () => {
    const getProductById = jest.fn(async () => makeProduct('p1'));
    const complete = [
      makeProduct('p1', {
        avgRating: 4.2,
        reviewCount: 10,
        offers: [makeOffer('SAVE10')],
      }),
    ];

    const result = await withRelatedProductRatings(complete, getProductById);

    expect(result).toBe(complete);
    expect(getProductById).not.toHaveBeenCalled();
  });

  it('looks up products that have ratings but still lack offers', async () => {
    const offer = makeOffer('FLAT20');
    const getProductById = jest.fn(async () =>
      makeProduct('p1', { avgRating: 4.2, reviewCount: 10, offers: [offer] }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('p1', { avgRating: 4.2, reviewCount: 10 })],
      getProductById,
    );

    expect(getProductById).toHaveBeenCalledTimes(1);
    expect(result[0]?.offers).toEqual([offer]);
  });

  it('leaves products unchanged when the lookup rejects', async () => {
    const getProductById = jest.fn(async () => {
      throw new Error('product lookup failed');
    });
    const products = [makeProduct('p1')];

    const result = await withRelatedProductRatings(products, getProductById);

    expect(result).toBe(products);
    expect(result[0]?.avgRating).toBeUndefined();
    expect(result[0]?.offers).toEqual([]);
  });

  it('enriches only the products missing catalog fields', async () => {
    const getProductById = jest.fn(async (id: string) =>
      makeProduct(id, {
        avgRating: 4.9,
        reviewCount: 30,
        offers: [makeOffer('P2')],
      }),
    );

    const result = await withRelatedProductRatings(
      [
        makeProduct('p1', {
          avgRating: 4.1,
          reviewCount: 5,
          offers: [makeOffer('P1')],
        }),
        makeProduct('p2'),
      ],
      getProductById,
    );

    expect(getProductById).toHaveBeenCalledTimes(1);
    expect(getProductById).toHaveBeenCalledWith('p2');
    expect(result[0]?.offers[0]?.key).toBe('P1');
    expect(result[1]?.avgRating).toBe(4.9);
    expect(result[1]?.offers[0]?.key).toBe('P2');
  });

  it('preserves existing offers when the lookup has none', async () => {
    const existing = [makeOffer('KEEP')];
    const getProductById = jest.fn(async () =>
      makeProduct('p1', { avgRating: 4.0, reviewCount: 2 }),
    );

    const result = await withRelatedProductRatings(
      [makeProduct('p1', { offers: existing })],
      getProductById,
    );

    expect(result[0]?.offers).toEqual(existing);
    expect(result[0]?.avgRating).toBe(4.0);
  });
});
