import {
  applyListingOfferFallback,
  transformProduct,
  transformProductList,
} from '@/services/product-transform';
import { PRODUCT_USP_IDS, ProductUspIdSchema } from '@/types/product';

describe('ProductUspIdSchema', () => {
  it('accepts every known demifine USP key', () => {
    expect(PRODUCT_USP_IDS).toEqual([
      'anti_tarnish',
      'skin_safe_jewellery',
      'platinum_plated',
      'gold_plated_14k',
      'sterling_silver_925',
      'gold_tone_plated',
      'adjustable_rings',
    ]);
    expect(ProductUspIdSchema.parse('gold_plated_14k')).toBe('gold_plated_14k');
  });

  it('rejects unknown USP keys', () => {
    expect(ProductUspIdSchema.safeParse('free_delivery').success).toBe(false);
    expect(ProductUspIdSchema.safeParse('').success).toBe(false);
  });
});

describe('transformProduct ratings', () => {
  it('maps rating and reviews from the API response', () => {
    const product = transformProduct({
      id: '9043668861185',
      name: 'Textured Disc Open Ring',
      price: 2379,
      rating: 3,
      reviews: {
        avg_rating: 3,
        review_count: 2,
      },
    });

    expect(product.avgRating).toBe(3);
    expect(product.reviewCount).toBe(2);
  });

  it('prefers reviews.avg_rating over top-level rating when both are present', () => {
    const product = transformProduct({
      id: '9043668238593',
      name: 'Spiral Ribbed Hoop Earrings',
      price: 2029,
      rating: 4,
      reviews: {
        avg_rating: 5,
        review_count: 3,
      },
    });

    expect(product.avgRating).toBe(5);
    expect(product.reviewCount).toBe(3);
  });

  it('omits rating fields when review count is zero', () => {
    const product = transformProduct({
      id: '123',
      name: 'No Reviews Yet',
      price: 1000,
      rating: 4.5,
      reviews: {
        avg_rating: 4.5,
        review_count: 0,
      },
    });

    expect(product.avgRating).toBeUndefined();
    expect(product.reviewCount).toBeUndefined();
  });

  it('maps known usps from the API response', () => {
    const product = transformProduct({
      id: '8588033491201',
      name: 'Zircon Heart & Bow Drop Earrings',
      price: 3055,
      usps: ['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated', 'unknown_usp'],
    });

    expect(product.usps).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated']);
  });

  it('omits usps when the API sends an empty list', () => {
    expect(
      transformProduct({
        id: '123',
        name: 'Ring',
        price: 1000,
        usps: [],
      }).usps,
    ).toBeUndefined();
  });

  it('derives usps from tags when the API omits the list', () => {
    expect(
      transformProduct({
        id: '123',
        name: 'Ring',
        price: 1000,
        tags: ['Platinum_Plated_Silver', 'Adjustable_Rings'],
      }).usps,
    ).toEqual(['anti_tarnish', 'skin_safe_jewellery', 'platinum_plated', 'adjustable_rings']);
  });

  it('maps quantity_ordered_30_days from the API response', () => {
    const product = transformProduct({
      id: '8588033491201',
      name: 'Zircon Heart & Bow Drop Earrings',
      price: 3055,
      quantity_ordered_30_days: 135,
    });

    expect(product.quantityOrdered30Days).toBe(135);
  });

  it('omits quantityOrdered30Days when API value is zero or missing', () => {
    expect(
      transformProduct({
        id: '123',
        name: 'Ring',
        price: 1000,
        quantity_ordered_30_days: 0,
      }).quantityOrdered30Days,
    ).toBeUndefined();

    expect(
      transformProduct({
        id: '123',
        name: 'Ring',
        price: 1000,
      }).quantityOrdered30Days,
    ).toBeUndefined();
  });

  it('maps available colors from the API response', () => {
    const product = transformProduct({
      id: '123',
      name: 'Gold Ring',
      price: 1000,
      color: ['Gold', 'Rose Gold'],
    });

    expect(product.colors).toEqual(['Gold', 'Rose Gold']);
  });

  it('collects unique colors from color variants', () => {
    const product = transformProduct({
      id: '123',
      name: 'Dual Tone Ring',
      price: 1000,
      variants: [
        {
          color: ['Gold'],
          selectedOptions: [{ name: 'Color', value: 'Gold' }],
        },
        {
          color: ['Silver'],
          selectedOptions: [{ name: 'Color', value: 'Silver' }],
        },
      ],
    });

    expect(product.colors).toEqual(['Gold', 'Silver']);
  });

  it('collects unique colors from variant names when color arrays are empty', () => {
    const product = transformProduct({
      id: '123',
      name: 'Tri Tone Ring',
      price: 1000,
      variants: [
        {
          name: 'Gold',
          title: 'Gold',
          color: [],
        },
        {
          name: 'Rose Gold',
          title: 'Rose Gold',
          color: [],
        },
        {
          name: 'Silver',
          title: 'Silver',
          color: [],
        },
      ],
    });

    expect(product.colors).toEqual(['Gold', 'Rose Gold', 'Silver']);
  });

  it('ignores size-only variants when collecting colors', () => {
    const product = transformProduct({
      id: '123',
      name: 'Sized Ring',
      price: 1000,
      color: ['Gold'],
      variants: [
        {
          name: '6',
          title: '6',
          color: [],
        },
        {
          name: '7',
          title: '7',
          color: [],
        },
      ],
    });

    expect(product.colors).toEqual(['Gold']);
  });

  it('maps product-level colors array from the API response', () => {
    const product = transformProduct({
      id: '123',
      name: 'Multi Metal Ring',
      price: 1000,
      colors: ['Gold', 'Silver', 'Rose Gold'],
    });

    expect(product.colors).toEqual(['Gold', 'Silver', 'Rose Gold']);
  });

  it('collects 9KT variant option values as product colors', () => {
    const product = transformProduct({
      id: '123',
      name: 'Fine Gold Ring',
      price: 1000,
      variants: [
        {
          selectedOptions: [{ name: 'Color', value: '9KT Yellow Gold' }],
        },
        {
          selectedOptions: [{ name: 'Color', value: '9KT White Gold' }],
        },
        {
          selectedOptions: [{ name: 'Color', value: '9KT Rose Gold' }],
        },
      ],
    });

    expect(product.colors).toEqual(['9KT Yellow Gold', '9KT White Gold', '9KT Rose Gold']);
  });

  it('maps banner text from the API response to badgeLabel', () => {
    const product = transformProduct({
      id: '7759111586049',
      name: 'Hearts All Over Bracelet',
      price: 999,
      banner: {
        text: 'Bestseller',
        backgroundColor: '#F4A261',
        textColor: '#FFFFFF',
        position: 'top-left',
      },
    });

    expect(product.badgeLabel).toBe('Bestseller');
  });
});

describe('transformProductList offers', () => {
  it('maps list-level and product discount offers from the API response', () => {
    const response = transformProductList({
      offers: ['Buy 1 Get 1 Free'],
      products: [
        {
          id: '1',
          name: 'Ring',
          price: 999,
          discounts: ['Free Gift'],
        },
      ],
    });

    expect(response.offers).toEqual(['Buy 1 Get 1 Free', 'Free Gift']);
  });

  it('maps recommendation discounts onto similar-product cards', () => {
    const response = transformProductList({
      recommendations: [
        {
          id: '1',
          name: 'Related Ring',
          price: 999,
          discounts: [
            {
              key: 'B1G1',
              name: 'Buy 1 Get 1',
              code: 'B1G1',
              type: 'FREEBIE',
            },
          ],
        },
      ],
    });

    expect(response.items[0]?.offers[0]).toMatchObject({
      key: 'B1G1',
      name: 'Buy 1 Get 1',
      code: 'B1G1',
    });
  });

  it('maps gold list discounts onto product cards and collection pills', () => {
    const response = transformProductList({
      products: [
        {
          id: 'gid://shopify/Product/1',
          name: 'Bondwave Glow 9KT Gold Mangalsutra',
          product_category: 'GOLD',
          price: 12911,
          originalPrice: 15494,
          discounts: [
            {
              key: 'MANGALSUTRA251',
              name: 'Flat 15% off on MRP',
              description: 'Flat 15% off on orders below Rs 20k/-',
              code: 'MANGALSUTRA251',
              type: 'PERCENTAGE',
              discount_value: 0,
              placeholder: [
                { text: 'Get it at', style: 'normal' },
                { text: '₹12,911.67', style: 'bold' },
              ],
              discount_category: 'display',
            },
          ],
        },
      ],
    });

    expect(response.items[0]?.offers[0]).toMatchObject({
      key: 'MANGALSUTRA251',
      name: 'Flat 15% off on MRP',
      code: 'MANGALSUTRA251',
      type: 'DISCOUNT',
      discountCategory: 'display',
    });
    expect(response.offers).toEqual(['Flat 15% off on MRP']);
  });

  it('maps listing discount payable_price onto product card offers', () => {
    const response = transformProductList({
      products: [
        {
          id: '1',
          name: 'Hearts All Over Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [
            {
              key: 'BDAY6',
              name: 'Buy 6 At ₹4999',
              description: 'Note: You need to add minimum 6 products',
              code: 'BDAY6',
              type: 'BUNDLE',
              discount_value: 4999,
              placeholder: [],
              payable_price: 833,
              discount_category: 'applicable',
              collections: [
                {
                  id: 'gid://shopify/Collection/479178326273',
                  title: 'MONSOON SALE POS',
                  handle: 'monsoon-sale-pos',
                  image: null,
                },
              ],
            },
          ],
        },
      ],
    });

    expect(response.items[0]?.offers[0]).toMatchObject({
      key: 'BDAY6',
      name: 'Buy 6 At ₹4999',
      discountValue: 4999,
      payablePrice: 833,
      collections: [
        {
          id: 'gid://shopify/Collection/479178326273',
          title: 'MONSOON SALE POS',
          handle: 'monsoon-sale-pos',
          image: null,
        },
      ],
    });
  });

  it('drops offer collections that have no handle', () => {
    const response = transformProductList({
      products: [
        {
          id: '1',
          name: 'Hearts All Over Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [
            {
              key: 'B1G1',
              name: 'Buy 1 Get 1',
              code: 'B1G1',
              type: 'FREEBIE',
              collections: [
                { id: null, title: null, handle: '  ', image: null },
                { id: null, title: null, handle: 'monsoon-sale', image: null },
              ],
            },
            {
              key: 'EMPTY',
              name: 'No collection',
              code: 'EMPTY',
              type: 'DISCOUNT',
              collections: [],
            },
          ],
        },
      ],
    });

    expect(response.items[0]?.offers[0]?.collections).toEqual([
      { id: null, title: null, handle: 'monsoon-sale', image: null },
    ]);
    expect(response.items[0]?.offers[1]?.collections).toBeUndefined();
  });

  it('maps product offers and discount_info when list discounts are empty', () => {
    const response = transformProductList({
      products: [
        {
          id: '1',
          name: 'Hearts All Over Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [],
          offers: [
            {
              key: 'MONSOON3',
              name: 'Get any 3 for ₹2699',
              code: 'MONSOON3',
              type: 'DISCOUNT',
            },
          ],
          discount_info: [
            {
              key: 'MONSOON2',
              name: 'Get any 2 for ₹1899',
              code: 'MONSOON2',
              type: 'DISCOUNT',
            },
          ],
        },
      ],
    });

    expect(response.items[0]?.offers.map((offer) => offer.code)).toEqual(['MONSOON3', 'MONSOON2']);
    expect(response.offers).toEqual(['Get any 3 for ₹2699', 'Get any 2 for ₹1899']);
  });

  it('maps freebie image and route from discount offers', () => {
    const product = transformProduct({
      id: '1',
      name: 'Mangalsutra',
      price: 25000,
      offers: [
        {
          key: 'MANGALSUTRA252',
          name: 'Freebie worth ₹9200',
          description: 'Free gold pendant worth Rs 9200/- for orders above 20k',
          code: 'MANGALSUTRA252',
          type: 'FREEBIE',
          discount_value: 25,
          discount_category: 'display',
          placeholder: [],
          freebie_image_url:
            'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/08/Frame-2613392-1-cbfc584c.png',
          freebie_route: '/products/8943146729729',
        },
      ],
    });

    expect(product.offers[0]).toMatchObject({
      type: 'FREEBIE',
      freebieImageUrl:
        'https://d2ppgkj0vs05g5.cloudfront.net/cms/media/2026/08/Frame-2613392-1-cbfc584c.png',
      freebieRoute: '/products/8943146729729',
      discountCategory: 'display',
    });
  });

  it('maps camelCase freebie image and route fields', () => {
    const product = transformProduct({
      id: '3',
      name: 'Earrings',
      price: 25000,
      offers: [
        {
          key: 'MANGALSUTRA252',
          name: 'Freebie worth ₹9200',
          description: '',
          code: 'MANGALSUTRA252',
          type: 'FREEBIE',
          freebieImageUrl: 'https://cdn.example.com/freebie-camel.png',
          freebieRoute: '/products/freebie-camel',
        },
      ],
    });

    expect(product.offers[0]?.freebieImageUrl).toBe('https://cdn.example.com/freebie-camel.png');
    expect(product.offers[0]?.freebieRoute).toBe('/products/freebie-camel');
  });

  it('merges product discounts with offers and discount_info on detail payloads', () => {
    const product = transformProduct({
      product: {
        id: '1',
        name: 'Cross-Over Stones Lined Twist Ring',
        price: 3266,
        product_category: 'demifine',
        offers: [
          {
            key: 'MONSOON3',
            name: 'Get any 3',
            description: '',
            code: 'MONSOON3',
            type: 'DISCOUNT',
          },
        ],
        discounts: [
          {
            key: 'B1G1',
            name: 'Buy 1 Get 1 Free',
            description: '',
            code: 'B1G1',
            type: 'FREEBIE',
          },
        ],
      },
      discount_info: [
        {
          key: 'EXTRA10',
          name: 'Extra 10% Off',
          description: '',
          code: 'EXTRA10',
          type: 'DISCOUNT',
        },
      ],
    });

    expect(product.offers.map((offer) => offer.code)).toEqual(['MONSOON3', 'B1G1', 'EXTRA10']);
  });

  it('keeps discounts when product.offers is empty on a detail payload', () => {
    const product = transformProduct({
      product: {
        id: '1',
        name: 'Ring',
        price: 999,
        discounts: [
          {
            key: 'SAVE10',
            name: '10% off',
            description: 'Use at checkout.',
            code: 'SAVE10',
            type: 'DISCOUNT',
          },
        ],
      },
    });

    expect(product.offers).toHaveLength(1);
    expect(product.offers[0]).toMatchObject({ code: 'SAVE10', name: '10% off' });
  });

  it('returns no offers when all detail discount sources are empty', () => {
    const product = transformProduct({
      product: {
        id: '1',
        name: 'Ring',
        price: 999,
        offers: [],
        discounts: [],
      },
      discount_info: [],
    });

    expect(product.offers).toEqual([]);
  });

  it('skips duplicate offer keys across discounts and discount_info', () => {
    const product = transformProduct({
      product: {
        id: '1',
        name: 'Ring',
        price: 999,
        discounts: [
          {
            key: 'SAVE10',
            name: 'from discounts',
            description: '',
            code: 'SAVE10',
            type: 'DISCOUNT',
          },
        ],
      },
      discount_info: [
        {
          key: 'SAVE10',
          name: 'from discount_info',
          description: '',
          code: 'SAVE10',
          type: 'DISCOUNT',
        },
      ],
    });

    expect(product.offers).toHaveLength(1);
    expect(product.offers[0]?.name).toBe('from discounts');
  });

  it('omits empty freebie image and route fields', () => {
    const product = transformProduct({
      id: '2',
      name: 'Ring',
      price: 999,
      discounts: [
        {
          key: 'SAVE10',
          name: '10% off',
          description: '',
          code: 'SAVE10',
          type: 'DISCOUNT',
          freebie_image_url: '  ',
          freebie_route: null,
        },
      ],
    });

    expect(product.offers[0]?.freebieImageUrl).toBeUndefined();
    expect(product.offers[0]?.freebieRoute).toBeUndefined();
    expect(product.offers[0] && 'freebieImageUrl' in product.offers[0]).toBe(false);
    expect(product.offers[0] && 'freebieRoute' in product.offers[0]).toBe(false);
  });

  it('omits null variant skus so listing payloads stay Flight-serializable', () => {
    const product = transformProduct({
      id: 'gid://shopify/Product/1',
      name: '9KT Gold Mangalsutra',
      product_category: 'GOLD',
      price: 12911,
      variants: [
        {
          id: 'gid://shopify/ProductVariant/1',
          sku: null,
          title: '9KT Yellow Gold',
          price: 12911,
        },
      ],
    });

    expect(product.variants[0]?.sku).toBeUndefined();
    expect(product.variants[0] && 'sku' in product.variants[0]).toBe(false);
  });

  it('maps platinum product_category onto listing cards', () => {
    const product = transformProduct({
      id: 'gid://shopify/Product/1',
      name: 'Lunar Flow Heart Earrings',
      product_category: 'Platinum',
      price: 1700,
    });

    expect(product.productCategory).toBe('platinum');
  });

  it('maps platinum plated silver category as platinum', () => {
    const product = transformProduct({
      id: 'gid://shopify/Product/2',
      name: 'Platinum Studs',
      product_category: 'platinum plated silver',
      price: 1700,
    });

    expect(product.productCategory).toBe('platinum');
  });

  it('keeps unknown categories as demifine', () => {
    const product = transformProduct({
      id: 'gid://shopify/Product/3',
      name: 'Everyday Ring',
      product_category: 'fashion',
      price: 999,
    });

    expect(product.productCategory).toBe('demifine');
  });

  it('preserves collection pagination metadata for infinite scroll', () => {
    const response = transformProductList({
      page: 1,
      total: 40,
      page_size: 20,
      has_next: true,
      next_cursor: 'cursor-2',
      products: [
        {
          id: '1',
          name: 'Ring',
          price: 999,
        },
      ],
    });

    expect(response.page).toBe(1);
    expect(response.totalPages).toBe(2);
    expect(response.hasNext).toBe(true);
    expect(response.nextCursor).toBe('cursor-2');
  });

  it('uses list total for the catalog size instead of page count', () => {
    const response = transformProductList({
      count: 20,
      total: 1000,
      page_size: 20,
      has_next: true,
      products: Array.from({ length: 20 }, (_, index) => ({
        id: String(index + 1),
        name: `Ring ${index + 1}`,
        price: 999,
      })),
    });

    expect(response.total).toBe(1000);
    expect(response.items).toHaveLength(20);
  });

  it('reads total from the envelope when data only has page count', () => {
    const response = transformProductList({
      message: 'ok',
      total: 1000,
      data: {
        count: 20,
        has_next: true,
        products: [{ id: '1', name: 'Ring', price: 999 }],
      },
    });

    expect(response.total).toBe(1000);
  });

  it('reads total from nested pagination when the page count is also present', () => {
    const response = transformProductList({
      count: 20,
      pagination: { total: 1000, count: 20 },
      has_next: true,
      products: [{ id: '1', name: 'Ring', price: 999 }],
    });

    expect(response.total).toBe(1000);
  });

  it('does not treat page count as the catalog total while more pages exist', () => {
    const response = transformProductList({
      count: 20,
      has_next: true,
      products: [{ id: '1', name: 'Ring', price: 999 }],
    });

    expect(response.total).toBe(1);
  });

  it('uses page count as total only on the last page when total is omitted', () => {
    const response = transformProductList({
      count: 8,
      has_next: false,
      products: [{ id: '1', name: 'Ring', price: 999 }],
    });

    expect(response.total).toBe(8);
  });

  it('maps available_filters into filter groups for the collection UI', () => {
    const response = transformProductList({
      products: [
        {
          id: '1',
          name: 'Gold Ring',
          price: 2499,
        },
      ],
      available_filters: [
        {
          id: 'filter.v.option.color',
          label: 'Color',
          type: 'LIST',
          values: [
            {
              id: 'gold',
              label: 'Gold',
              count: 10,
              input: {
                variantOption: {
                  name: 'Color',
                  value: 'Gold',
                },
              },
            },
          ],
        },
      ],
    });

    const filterGroups = response.filterGroups ?? [];

    expect(filterGroups).toHaveLength(1);
    expect(filterGroups[0]).toMatchObject({
      id: 'filter.v.option.color',
      label: 'Color',
      min: 2499,
    });
    expect(filterGroups[0]?.options[0]).toMatchObject({
      id: 'gold',
      label: 'Gold',
      count: 10,
      input: {
        variantOption: {
          name: 'Color',
          value: 'Gold',
        },
      },
    });
  });

  it('uses gold price buckets for gold product collections', () => {
    const response = transformProductList({
      collection_handle: '9kt-gold-rings',
      products: [
        {
          id: '1',
          name: '9KT Gold Ring',
          price: 12_000,
          product_category: 'gold',
        },
      ],
      available_filters: [
        {
          id: 'filter.v.price',
          label: 'Price',
          type: 'PRICE_RANGE',
          values: [
            {
              id: 'filter.v.price',
              label: 'Price',
              input: { price: { min: 0, max: 80_000 } },
            },
          ],
        },
      ],
    });

    expect(response.filterGroups?.[0]?.options.map((option) => option.label)).toEqual([
      '₹ 0 - ₹ 10,000',
      '₹ 10,000 - ₹ 20,000',
      '₹ 20,000 - ₹ 30,000',
      '₹ 30,000 - ₹ 40,000',
      '₹ 40,000 - ₹ 50,000',
      '₹ 50,000 and Above',
    ]);
  });

  it('keeps API-driven price buckets for other category collections', () => {
    const response = transformProductList({
      collection_handle: 'rings',
      products: [
        {
          id: '1',
          name: 'Ring',
          price: 1499,
          product_category: 'demifine',
        },
      ],
      available_filters: [
        {
          id: 'filter.v.price',
          label: 'Price',
          type: 'PRICE_RANGE',
          values: [
            {
              id: 'filter.v.price',
              label: 'Price',
              input: { price: { min: 0, max: 5397 } },
            },
          ],
        },
      ],
    });

    const options = response.filterGroups?.[0]?.options ?? [];
    const lastOption = options.at(-1);

    expect(options[0]).toMatchObject({ min: 0, label: expect.stringMatching(/^₹0/) });
    expect(lastOption).toMatchObject({ min: 5000, label: expect.stringMatching(/Above/i) });
    expect(options.map((option) => option.label)).not.toEqual([
      '₹ 0 - ₹ 10,000',
      '₹ 10,000 - ₹ 20,000',
      '₹ 20,000 - ₹ 30,000',
      '₹ 30,000 - ₹ 40,000',
      '₹ 40,000 - ₹ 50,000',
      '₹ 50,000 and Above',
    ]);
  });

  it('uses gold price buckets from a gold collection handle when category is omitted', () => {
    const response = transformProductList({
      collection_handle: '9kt-fine-gold',
      products: [
        {
          id: '1',
          name: 'Ring',
          price: 12_000,
        },
      ],
      available_filters: [
        {
          id: 'filter.v.price',
          label: 'Price',
          type: 'PRICE_RANGE',
          values: [
            {
              id: 'filter.v.price',
              label: 'Price',
              input: { price: { min: 0, max: 80_000 } },
            },
          ],
        },
      ],
    });

    expect(response.filterGroups?.[0]?.options[0]?.label).toBe('₹ 0 - ₹ 10,000');
    expect(response.filterGroups?.[0]?.options.at(-1)?.label).toBe('₹ 50,000 and Above');
  });

  it('maps collection_image metadata from collection products responses', () => {
    const response = transformProductList({
      collection_handle: 'gold-best-sellers',
      collection_title: 'Gold Best Sellers',
      collection_type: 'NORMAL',
      collection_image: {
        url: 'https://cdn.shopify.com/collection-banner.jpg',
        altText: null,
        width: 8000,
        height: 2896,
      },
      products: [
        {
          id: '1',
          name: 'Ring',
          price: 999,
        },
      ],
    });

    expect(response.collectionMeta).toEqual({
      handle: 'gold-best-sellers',
      title: 'Gold Best Sellers',
      type: 'NORMAL',
      image: {
        url: 'https://cdn.shopify.com/collection-banner.jpg',
        width: 8000,
        height: 2896,
      },
    });
  });
});

describe('applyListingOfferFallback', () => {
  const monsoonOffers = [
    {
      key: 'MONSOON3',
      name: 'Get any 3 for ₹2699',
      description: '',
      code: 'MONSOON3',
      type: 'DISCOUNT' as const,
      discountValue: null,
      placeholder: [],
    },
    {
      key: 'MONSOON2',
      name: 'Get any 2 for ₹1899',
      description: '',
      code: 'MONSOON2',
      type: 'DISCOUNT' as const,
      discountValue: null,
      placeholder: [],
    },
  ];

  it('fills empty demifine listing cards and collection pills', () => {
    const list = transformProductList({
      products: [
        {
          id: '1',
          name: 'Hearts All Over Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [],
        },
      ],
    });

    const hydrated = applyListingOfferFallback(list, monsoonOffers);

    expect(hydrated.items[0]?.offers.map((offer) => offer.code)).toEqual(['MONSOON3', 'MONSOON2']);
    expect(hydrated.offers).toEqual(['Get any 3 for ₹2699', 'Get any 2 for ₹1899']);
  });

  it('does not overwrite gold list discounts', () => {
    const list = transformProductList({
      products: [
        {
          id: '2',
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
        {
          id: '1',
          name: 'Bracelet',
          product_category: 'demifine',
          price: 999,
          discounts: [],
        },
      ],
    });

    const hydrated = applyListingOfferFallback(list, monsoonOffers);

    expect(hydrated.items[0]?.offers[0]?.name).toBe('Flat 15% off on MRP');
    expect(hydrated.items[1]?.offers[0]?.name).toBe('Get any 3 for ₹2699');
  });

  it('returns the listing unchanged when fallback offers are empty', () => {
    const list = transformProductList({
      products: [{ id: '1', name: 'Bracelet', product_category: 'demifine', price: 999 }],
    });

    expect(applyListingOfferFallback(list, [])).toBe(list);
  });
});
