import { productTokens } from '@/config/theme/product.tokens';
import {
  getProductCardChipColors,
  getProductColorChip,
  getProductColorClass,
  getProductColors,
  hasProductCardColorSwatches,
} from '@/lib/utils/product-colors';
import type { ProductVariant } from '@/types/product';

const goldSilverColorVariants: ProductVariant[] = [
  {
    id: 'gold',
    title: 'Gold',
    price: 100,
    availableForSale: true,
    selectedOptions: [{ name: 'Color', value: 'Gold' }],
  },
  {
    id: 'silver',
    title: 'Silver',
    price: 100,
    availableForSale: true,
    selectedOptions: [{ name: 'Color', value: 'Silver' }],
  },
];

describe('getProductColorClass', () => {
  it('maps known jewelry colors to theme fill classes', () => {
    expect(getProductColorClass('Gold')).toBe(productTokens.metalColors.classByName.gold);
    expect(getProductColorClass('Rose Gold')).toBe(
      productTokens.metalColors.classByName['rose gold'],
    );
    expect(getProductColorClass('Silver')).toBe(productTokens.metalColors.classByName.silver);
  });

  it('falls back to the theme neutral class for unknown colors', () => {
    expect(getProductColorClass('Mystery')).toBe(productTokens.metalColors.fallbackClass);
  });
});

describe('getProductColorChip', () => {
  it('maps known jewelry colors to chip images', () => {
    expect(getProductColorChip('Gold')).toBeDefined();
    expect(getProductColorChip('Rose Gold')).toBeDefined();
    expect(getProductColorChip('Rose-Gold')).toBeDefined();
    expect(getProductColorChip('Silver')).toBeDefined();
    expect(getProductColorChip('Yellow Gold')).toBeDefined();
    expect(getProductColorChip('9KT Yellow Gold')).toBeDefined();
    expect(getProductColorChip('9KT Rose Gold')).toBeDefined();
    expect(getProductColorChip('9KT White Gold')).toBeDefined();
    expect(getProductColorChip('White Gold')).toBeDefined();
    expect(getProductColorChip('White')).toBeUndefined();
  });

  it('returns undefined for colors without a chip image', () => {
    expect(getProductColorChip('Mystery')).toBeUndefined();
  });
});

describe('getProductColors', () => {
  it('prefers the top-level colors field', () => {
    expect(
      getProductColors({
        colors: ['Gold', 'Silver'],
        filterAttributes: { color: ['Rose Gold'] },
      }),
    ).toEqual(['Gold', 'Silver']);
  });

  it('falls back to filter attributes when colors are missing', () => {
    expect(
      getProductColors({
        filterAttributes: { color: ['Gold', 'Gold', 'Silver'] },
      }),
    ).toEqual(['Gold', 'Silver']);
  });

  it('returns an empty array when no colors are available', () => {
    expect(getProductColors({})).toEqual([]);
  });
});

describe('getProductCardChipColors', () => {
  it('returns only gold, rose gold, and silver chips from variant metal options', () => {
    expect(
      getProductCardChipColors({
        variants: [
          {
            id: 'rose',
            title: 'Rose Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Rose Gold' }],
          },
          {
            id: 'gold',
            title: 'Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Gold' }],
          },
          {
            id: 'silver',
            title: 'Silver',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Silver' }],
          },
        ],
      }),
    ).toEqual(['rose gold', 'gold', 'silver']);
  });

  it('maps yellow gold variant options to the gold chip', () => {
    expect(
      getProductCardChipColors({
        variants: [
          {
            id: 'yg',
            title: 'Yellow Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Yellow Gold' }],
          },
          {
            id: 'rg',
            title: 'Rose Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Rose Gold' }],
          },
        ],
      }),
    ).toEqual(['gold', 'rose gold']);
  });

  it('maps 9KT fine gold variant labels to supported chips', () => {
    expect(
      getProductCardChipColors({
        variants: [
          {
            id: 'yg',
            title: '9KT Yellow Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Metal Color', value: '9KT Yellow Gold' }],
          },
          {
            id: 'wg',
            title: '9KT White Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Metal Color', value: '9KT White Gold' }],
          },
          {
            id: 'rg',
            title: '9KT Rose Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Metal Color', value: '9KT Rose Gold' }],
          },
        ],
      }),
    ).toEqual(['gold', 'silver', 'rose gold']);
  });

  it('limits visible chips to three', () => {
    expect(
      getProductCardChipColors({
        variants: [
          {
            id: 'gold',
            title: 'Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Gold' }],
          },
          {
            id: 'rose',
            title: 'Rose Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Rose Gold' }],
          },
          {
            id: 'silver',
            title: 'Silver',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Silver' }],
          },
        ],
      }),
    ).toEqual(['gold', 'rose gold', 'silver']);
  });

  it('returns an empty array when variants are missing even if colors metadata exists', () => {
    expect(
      getProductCardChipColors({
        colors: ['Gold', 'Silver'],
        variants: [],
      }),
    ).toEqual([]);
  });

  it('returns an empty array when metal options are not mappable chip colours', () => {
    expect(
      getProductCardChipColors({
        variants: [
          {
            id: 'a',
            title: 'White',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Metal Finish', value: 'White' }],
          },
          {
            id: 'b',
            title: 'Blue',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Metal Finish', value: 'Blue' }],
          },
        ],
      }),
    ).toEqual([]);
  });
});

describe('hasProductCardColorSwatches', () => {
  it('returns true when two selectable metal variants exist', () => {
    expect(hasProductCardColorSwatches({ variants: goldSilverColorVariants })).toBe(true);
  });

  it('returns true when three chip colours exist on variants', () => {
    expect(
      hasProductCardColorSwatches({
        variants: [
          ...goldSilverColorVariants,
          {
            id: 'rose',
            title: 'Rose Gold',
            price: 100,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Rose Gold' }],
          },
        ],
      }),
    ).toBe(true);
  });

  it('returns false when only one metal variant exists', () => {
    expect(
      hasProductCardColorSwatches({
        variants: [goldSilverColorVariants[0]!],
      }),
    ).toBe(false);
  });

  it('returns false when colors metadata exists but variants do not support PDP metal choice', () => {
    expect(hasProductCardColorSwatches({ colors: ['Gold', 'Silver'], variants: [] })).toBe(false);
  });
});
