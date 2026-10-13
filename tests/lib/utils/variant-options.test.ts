import {
  buildOptionGroups,
  detectOptionType,
  findVariantBySelections,
  formatSizeOptionLabel,
  isListingProductInStock,
  isProductPurchasable,
  isVariantInStock,
  isVariantPurchasable,
} from '@/lib/utils/variant-options';
import { PRODUCT_CATEGORY, type Product, type ProductVariant } from '@/types/product';

const variants: ProductVariant[] = [
  {
    id: 'yellow-4',
    title: '9KT Yellow Gold / 4',
    price: 42568,
    availableForSale: true,
    selectedOptions: [{ name: 'Metal Color', value: 'Yellow' }],
  },
  {
    id: 'yellow-5',
    title: '9KT Yellow Gold / 5',
    price: 43147,
    availableForSale: true,
    selectedOptions: [{ name: 'Metal Color', value: 'Yellow' }],
  },
  {
    id: 'rose-4',
    title: '9KT Rose Gold / 4',
    price: 42781,
    availableForSale: true,
    selectedOptions: [{ name: 'Metal Color', value: 'Rose' }],
  },
  {
    id: 'rose-5',
    title: '9KT Rose Gold / 5',
    price: 43147,
    availableForSale: true,
    selectedOptions: [{ name: 'Metal Color', value: 'Rose' }],
  },
];

describe('variant option inference', () => {
  it('orders ring-size groups before colour groups (Figma size then colour)', () => {
    expect(buildOptionGroups(variants)).toEqual([
      { name: 'Ring Size', values: ['4', '5'], type: 'size' },
      { name: 'Metal Color', values: ['Yellow', 'Rose'], type: 'color' },
    ]);
  });

  it('orders size before colour when API lists size option first', () => {
    const sizeFirstVariants: ProductVariant[] = [
      {
        id: 'yellow-4',
        title: '9KT Yellow Gold / 4',
        price: 42568,
        availableForSale: true,
        selectedOptions: [
          { name: 'Ring Size', value: '4' },
          { name: 'Metal Color', value: 'Yellow' },
        ],
      },
      {
        id: 'yellow-5',
        title: '9KT Yellow Gold / 5',
        price: 43147,
        availableForSale: true,
        selectedOptions: [
          { name: 'Ring Size', value: '5' },
          { name: 'Metal Color', value: 'Yellow' },
        ],
      },
      {
        id: 'rose-4',
        title: '9KT Rose Gold / 4',
        price: 42781,
        availableForSale: true,
        selectedOptions: [
          { name: 'Ring Size', value: '4' },
          { name: 'Metal Color', value: 'Rose' },
        ],
      },
      {
        id: 'rose-5',
        title: '9KT Rose Gold / 5',
        price: 43147,
        availableForSale: true,
        selectedOptions: [
          { name: 'Ring Size', value: '5' },
          { name: 'Metal Color', value: 'Rose' },
        ],
      },
    ];

    expect(buildOptionGroups(sizeFirstVariants)).toEqual([
      { name: 'Ring Size', values: ['4', '5'], type: 'size' },
      { name: 'Metal Color', values: ['Yellow', 'Rose'], type: 'color' },
    ]);
  });

  it('preserves order among colour-only groups when no size is present', () => {
    const colourOnlyVariants: ProductVariant[] = [
      {
        id: 'yellow',
        title: 'Yellow',
        price: 100,
        availableForSale: true,
        selectedOptions: [{ name: 'Metal Color', value: 'Yellow' }],
      },
      {
        id: 'rose',
        title: 'Rose',
        price: 100,
        availableForSale: true,
        selectedOptions: [{ name: 'Metal Color', value: 'Rose' }],
      },
      {
        id: 'white',
        title: 'White',
        price: 100,
        availableForSale: true,
        selectedOptions: [{ name: 'Metal Finish', value: 'White' }],
      },
      {
        id: 'platinum',
        title: 'Platinum',
        price: 100,
        availableForSale: true,
        selectedOptions: [{ name: 'Metal Finish', value: 'Platinum' }],
      },
    ];

    expect(buildOptionGroups(colourOnlyVariants)).toEqual([
      { name: 'Metal Color', values: ['Yellow', 'Rose'], type: 'color' },
      { name: 'Metal Finish', values: ['White', 'Platinum'], type: 'color' },
    ]);
  });

  it('resolves the variant matching both selected color and inferred size', () => {
    expect(
      findVariantBySelections(variants, {
        'Metal Color': 'Rose',
        'Ring Size': '5',
      })?.id,
    ).toBe('rose-5');
  });

  it('does not infer a size from a non-numeric title suffix', () => {
    const withoutEncodedSize: ProductVariant[] = [
      {
        ...variants[0]!,
        title: '9KT Yellow Gold / Adjustable',
      },
      {
        ...variants[2]!,
        title: '9KT Rose Gold / Adjustable',
      },
    ];

    expect(buildOptionGroups(withoutEncodedSize)).toEqual([
      { name: 'Metal Color', values: ['Yellow', 'Rose'], type: 'color' },
    ]);
  });

  it('returns undefined when the selected combination does not exist', () => {
    expect(
      findVariantBySelections(variants, {
        'Metal Color': 'White',
        'Ring Size': '4',
      }),
    ).toBeUndefined();
  });

  it('treats bare numeric titles as ring size, not colour', () => {
    const sizeOnlyVariants: ProductVariant[] = [
      {
        id: 'size-6',
        title: '6',
        price: 1083,
        availableForSale: true,
        selectedOptions: [],
      },
      {
        id: 'size-7',
        title: '7',
        price: 1083,
        availableForSale: true,
        selectedOptions: [],
      },
      {
        id: 'size-8',
        title: '8',
        price: 1083,
        availableForSale: true,
        selectedOptions: [],
      },
    ];

    expect(buildOptionGroups(sizeOnlyVariants)).toEqual([
      { name: 'Ring Size', values: ['6', '7', '8'], type: 'size' },
    ]);
    expect(findVariantBySelections(sizeOnlyVariants, { 'Ring Size': '7' })?.id).toBe('size-7');
  });

  it('does not treat chain length/thickness values as ring sizes', () => {
    const chainVariants: ProductVariant[] = [
      {
        id: 'rope-60-6',
        title: '60cm / 6mm',
        price: 1111,
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '60cm / 6mm' }],
      },
      {
        id: 'rope-50-6',
        title: '50cm / 6mm',
        price: 999,
        availableForSale: true,
        selectedOptions: [{ name: 'Size', value: '50cm / 6mm' }],
      },
    ];

    expect(buildOptionGroups(chainVariants)).toEqual([
      { name: 'Size', values: ['60cm / 6mm', '50cm / 6mm'], type: 'text' },
    ]);
    expect(findVariantBySelections(chainVariants, { Size: '50cm / 6mm' })?.id).toBe('rope-50-6');
  });

  it('does not infer a ring size from measurement titles', () => {
    const chainTitleVariants: ProductVariant[] = [
      {
        id: 'rope-60-6',
        title: '60cm / 6mm',
        price: 1111,
        availableForSale: true,
        selectedOptions: [],
      },
      {
        id: 'rope-50-6',
        title: '50cm / 6mm',
        price: 999,
        availableForSale: true,
        selectedOptions: [],
      },
    ];

    expect(buildOptionGroups(chainTitleVariants)).toEqual([
      { name: 'Size', values: ['60cm / 6mm', '50cm / 6mm'], type: 'text' },
    ]);
  });
});

describe('detectOptionType', () => {
  it('classifies numeric Size values as ring sizes', () => {
    expect(detectOptionType('Size', ['6', '7', '8'])).toBe('size');
    expect(detectOptionType('Ring Size', ['4', '5'])).toBe('size');
  });

  it('classifies measurement Size values as text', () => {
    expect(detectOptionType('Size', ['60cm / 6mm', '50cm / 6mm'])).toBe('text');
  });

  it('does not treat necklace length numbers as ring sizes', () => {
    expect(detectOptionType('Length', ['16', '18', '20'])).toBe('text');
  });

  it('still classifies metal names as colour', () => {
    expect(detectOptionType('Metal Color', ['Yellow', 'Rose'])).toBe('color');
  });
});

describe('formatSizeOptionLabel', () => {
  it('uses ring-size copy for ring size groups', () => {
    expect(formatSizeOptionLabel('Ring Size')).toBe('Select Ring Size(US)');
  });

  it('prefixes other option names with Select', () => {
    expect(formatSizeOptionLabel('Size')).toBe('Select Size');
    expect(formatSizeOptionLabel('Length')).toBe('Select Length');
  });
});

describe('isVariantInStock', () => {
  it('returns true when availableForSale and quantity are ok', () => {
    expect(
      isVariantInStock({
        id: 'v1',
        title: 'Default',
        price: 100,
        availableForSale: true,
        quantityAvailable: 2,
        selectedOptions: [],
      }),
    ).toBe(true);
  });

  it('returns false when availableForSale is false', () => {
    expect(
      isVariantInStock({
        id: 'v1',
        title: 'Default',
        price: 100,
        availableForSale: false,
        selectedOptions: [],
      }),
    ).toBe(false);
  });

  it('returns false when quantityAvailable is zero', () => {
    expect(
      isVariantInStock({
        id: 'v1',
        title: 'Default',
        price: 100,
        availableForSale: true,
        quantityAvailable: 0,
        selectedOptions: [],
      }),
    ).toBe(false);
  });

  it('returns true when quantityAvailable is nullish (untracked inventory)', () => {
    expect(
      isVariantInStock({
        id: 'v1',
        title: 'Default',
        price: 100,
        availableForSale: true,
        selectedOptions: [],
        // Runtime API payloads sometimes set null; treat as untracked, not sold out.
        quantityAvailable: null as unknown as undefined,
      }),
    ).toBe(true);
  });

  it('returns true when variant is undefined', () => {
    expect(isVariantInStock(undefined)).toBe(true);
  });
});

describe('isVariantPurchasable', () => {
  const oosVariant: ProductVariant = {
    id: 'oos',
    title: 'Default',
    price: 100,
    availableForSale: false,
    quantityAvailable: 0,
    selectedOptions: [],
  };

  const inStockVariant: ProductVariant = {
    id: 'in',
    title: 'Default',
    price: 100,
    availableForSale: true,
    quantityAvailable: 3,
    selectedOptions: [],
  };

  it('treats gold out-of-stock catalog variants as purchasable', () => {
    expect(isVariantPurchasable(oosVariant, PRODUCT_CATEGORY.GOLD)).toBe(true);
  });

  it('treats gold in-stock variants as purchasable', () => {
    expect(isVariantPurchasable(inStockVariant, PRODUCT_CATEGORY.GOLD)).toBe(true);
  });

  it('blocks demifine out-of-stock variants', () => {
    expect(isVariantPurchasable(oosVariant, PRODUCT_CATEGORY.DEMIFINE)).toBe(false);
  });

  it('allows demifine in-stock variants', () => {
    expect(isVariantPurchasable(inStockVariant, PRODUCT_CATEGORY.DEMIFINE)).toBe(true);
  });

  it('blocks demifine purchase when no variant is resolved', () => {
    expect(isVariantPurchasable(undefined, PRODUCT_CATEGORY.DEMIFINE)).toBe(false);
  });

  it('treats gold as purchasable when no variant is resolved', () => {
    expect(isVariantPurchasable(undefined, PRODUCT_CATEGORY.GOLD)).toBe(true);
  });
});

describe('isProductPurchasable', () => {
  const inStockVariant: ProductVariant = {
    id: 'in',
    title: 'Default',
    price: 100,
    availableForSale: true,
    quantityAvailable: 3,
    selectedOptions: [],
  };

  it('blocks demifine when product-level availableForSale is false', () => {
    expect(
      isProductPurchasable(
        { productCategory: PRODUCT_CATEGORY.DEMIFINE, availableForSale: false },
        inStockVariant,
      ),
    ).toBe(false);
  });

  it('blocks demifine with empty variants even when product availability is unknown', () => {
    expect(
      isProductPurchasable({ productCategory: PRODUCT_CATEGORY.DEMIFINE }, undefined),
    ).toBe(false);
  });

  it('allows demifine when product and variant are available', () => {
    expect(
      isProductPurchasable(
        { productCategory: PRODUCT_CATEGORY.DEMIFINE, availableForSale: true },
        inStockVariant,
      ),
    ).toBe(true);
  });

  it('keeps gold purchasable when product-level availableForSale is false', () => {
    expect(
      isProductPurchasable(
        { productCategory: PRODUCT_CATEGORY.GOLD, availableForSale: false },
        undefined,
      ),
    ).toBe(true);
  });
});

describe('isListingProductInStock', () => {
  const baseProduct: Product = {
    id: 'p1',
    handle: 'ring',
    name: 'Ring',
    description: '',
    price: 1000,
    image: '',
    images: [],
    category: 'rings',
    productCategory: PRODUCT_CATEGORY.DEMIFINE,
    offers: [],
    variants: [],
  };

  it('treats demifine list rows without variants as in stock', () => {
    expect(isListingProductInStock(baseProduct)).toBe(true);
  });

  it('blocks demifine when product-level availableForSale is false', () => {
    expect(isListingProductInStock({ ...baseProduct, availableForSale: false })).toBe(false);
  });

  it('blocks demifine when every variant is unavailable', () => {
    expect(
      isListingProductInStock({
        ...baseProduct,
        variants: [
          {
            id: 'v1',
            title: 'Default',
            price: 1000,
            availableForSale: false,
            selectedOptions: [],
          },
        ],
      }),
    ).toBe(false);
  });

  it('keeps gold listing products in stock even when marked unavailable', () => {
    expect(
      isListingProductInStock({
        ...baseProduct,
        productCategory: PRODUCT_CATEGORY.GOLD,
        availableForSale: false,
      }),
    ).toBe(true);
  });
});
