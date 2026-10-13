import { hydrateListingOffers } from '@/services/hydrate-listing-offers';
import { transformProductList } from '@/services/product-transform';
import type { Product } from '@/types/product';

const monsoonOffers: Product['offers'] = [
  {
    key: 'MONSOON3',
    name: 'Get any 3 for ₹2699',
    description: '',
    code: 'MONSOON3',
    type: 'DISCOUNT',
    discountValue: null,
    placeholder: [],
  },
  {
    key: 'MONSOON2',
    name: 'Get any 2 for ₹1899',
    description: '',
    code: 'MONSOON2',
    type: 'DISCOUNT',
    discountValue: null,
    placeholder: [],
  },
];

describe('hydrateListingOffers', () => {
  it('loads demifine PDP offers when the collection list sent none', async () => {
    const list = transformProductList({
      products: [
        {
          id: 'gid://shopify/Product/7759111586049',
          name: 'Hearts All Over Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [],
        },
      ],
    });
    const fetchProduct = jest.fn(async (id: string): Promise<Product> => {
      expect(id).toBe('7759111586049');
      return { ...list.items[0]!, offers: monsoonOffers };
    });

    const hydrated = await hydrateListingOffers(list, fetchProduct);

    expect(fetchProduct).toHaveBeenCalledTimes(1);
    expect(hydrated.items[0]?.offers.map((offer) => offer.name)).toEqual([
      'Get any 3 for ₹2699',
      'Get any 2 for ₹1899',
    ]);
  });

  it('skips the detail fetch when listing cards already have discounts', async () => {
    const list = transformProductList({
      products: [
        {
          id: '1',
          name: 'Gold Mangalsutra',
          product_category: 'gold',
          price: 12911,
          discounts: [
            {
              key: 'MANGALSUTRA251',
              name: 'Flat 15% off on MRP',
              code: 'MANGALSUTRA251',
              type: 'PERCENTAGE',
            },
          ],
        },
      ],
    });
    const fetchProduct = jest.fn();

    const hydrated = await hydrateListingOffers(list, fetchProduct);

    expect(fetchProduct).not.toHaveBeenCalled();
    expect(hydrated.items[0]?.offers[0]?.name).toBe('Flat 15% off on MRP');
  });

  it('keeps the listing when the product detail request fails', async () => {
    const list = transformProductList({
      products: [
        {
          id: '1',
          name: 'Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [],
        },
      ],
    });

    const hydrated = await hydrateListingOffers(list, async () => {
      throw new Error('detail down');
    });

    expect(hydrated.items[0]?.offers).toEqual([]);
  });

  it('does not fetch when the listing has no products', async () => {
    const list = transformProductList({ products: [] });
    const fetchProduct = jest.fn();

    const hydrated = await hydrateListingOffers(list, fetchProduct);

    expect(fetchProduct).not.toHaveBeenCalled();
    expect(hydrated.items).toEqual([]);
  });
});
