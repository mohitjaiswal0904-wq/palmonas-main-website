import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildCollectionProductFilterParams,
  clampPriceRange,
  clampPriceRangeExact,
  getFilterDisplayLabel,
  getFilterPriceBounds,
  resolveListingPriceBucketSet,
  transformAvailableProductFilters,
} from '@/lib/utils/product-filters';
import type { AvailableProductFiltersApiResponse } from '@/types/product-filters';
import { createEmptyProductFilters, type ProductFilterGroup } from '@/types/product-listing';

const samplePath = join(process.cwd(), 'src/components/collection/sample.json');
const sample = JSON.parse(readFileSync(samplePath, 'utf8')) as {
  data: { available_filters: unknown };
};

describe('product-filters utils', () => {
  const filterGroups = transformAvailableProductFilters(
    sample.data.available_filters as AvailableProductFiltersApiResponse,
  );

  it('transforms available_filters from the collection products API', () => {
    expect(filterGroups.length).toBeGreaterThan(0);
    expect(filterGroups.map((group) => group.label)).toEqual(
      expect.arrayContaining(['Price', 'Product type', 'Color', 'Occasion', 'STYLE']),
    );
  });

  it('keeps API input on list filter options', () => {
    const productTypeGroup = filterGroups.find((group) => group.label === 'Product type');

    expect(productTypeGroup?.options[0]).toMatchObject({
      label: 'Anklets',
      input: { productType: 'Anklets' },
    });
  });

  it('builds price buckets from API PRICE_RANGE min/max (PW-626)', () => {
    const priceGroup = filterGroups.find((group) => group.label === 'Price');
    const lastOption = priceGroup?.options[priceGroup.options.length - 1];

    // Sample API price.max is 5397 → buckets start at ₹0, Above floor at ₹5000.
    expect(priceGroup?.options[0]?.min).toBe(0);
    expect(priceGroup?.options[0]?.label).toMatch(/^₹0/);
    expect(lastOption?.min).toBe(5000);
    expect(lastOption?.max).toBe(5397);
    expect(lastOption?.label).toMatch(/Above/i);
    expect(lastOption?.min).not.toBe(lastOption?.max);
  });

  it('builds gold price buckets when the listing is gold', () => {
    const goldFilterGroups = transformAvailableProductFilters(
      sample.data.available_filters as AvailableProductFiltersApiResponse,
      undefined,
      'gold',
    );
    const priceGroup = goldFilterGroups.find((group) => group.label === 'Price');
    const lastOption = priceGroup?.options[priceGroup.options.length - 1];

    expect(priceGroup?.options.map((option) => option.label)).toEqual([
      '₹ 0 - ₹ 10,000',
      '₹ 10,000 - ₹ 20,000',
      '₹ 20,000 - ₹ 30,000',
      '₹ 30,000 - ₹ 40,000',
      '₹ 40,000 - ₹ 50,000',
      '₹ 50,000 and Above',
    ]);
    expect(priceGroup?.options[0]).toMatchObject({ min: 0, max: 10_000 });
    expect(priceGroup?.options[3]).toMatchObject({ min: 30_000, max: 40_000 });
    expect(lastOption?.min).toBe(50_000);
    expect(lastOption?.max).toBeUndefined();
  });

  it('attaches catalog max to gold above bucket when the ceiling is high enough', () => {
    const goldFilterGroups = transformAvailableProductFilters(
      {
        filters: [
          {
            id: 'filter.v.price',
            label: 'Price',
            type: 'PRICE_RANGE',
            values: [
              {
                id: 'filter.v.price',
                label: 'Price',
                count: 0,
                input: { price: { min: 0, max: 80_000 } },
              },
            ],
          },
        ],
      },
      undefined,
      'gold',
    );
    const lastOption = goldFilterGroups[0]?.options.at(-1);

    expect(lastOption).toMatchObject({ min: 50_000, max: 80_000 });
  });

  it('keeps slider floor at ₹0 even when page products start higher', () => {
    const filterGroupsWithProductMin = transformAvailableProductFilters(
      sample.data.available_filters as AvailableProductFiltersApiResponse,
      1_999,
    );
    const priceGroup = filterGroupsWithProductMin.find((group) => group.label === 'Price');

    expect(priceGroup?.options[0]?.min).toBe(0);
    expect(getFilterPriceBounds(priceGroup!)).toEqual(expect.objectContaining({ min: 0 }));
  });

  it('maps STYLE metafield options to earrings_design query params (PW-634)', () => {
    const styleGroup = filterGroups.find((group) => group.label === 'STYLE');
    const bandOption = styleGroup?.options.find((option) => option.label === 'Band');

    if (!styleGroup || !bandOption) {
      throw new Error('Expected STYLE Band option in sample data');
    }

    const filters = createEmptyProductFilters(filterGroups);
    filters[styleGroup.id] = [bandOption.id];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      earrings_design: 'Band',
    });
  });
  it('builds collection product filter query params from selected options', () => {
    const filters = createEmptyProductFilters(filterGroups);
    const productTypeGroup = filterGroups.find((group) => group.label === 'Product type');
    const earringsOption = productTypeGroup?.options.find((option) => option.label === 'Earrings');

    if (!productTypeGroup || !earringsOption) {
      throw new Error('Expected earrings filter option in sample data');
    }

    filters[productTypeGroup.id] = [earringsOption.id];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      product_type: 'Earrings',
    });
  });

  it('maps custom price range selections to API query params', () => {
    const priceGroup = filterGroups.find((group) => group.label === 'Price');

    if (!priceGroup) {
      throw new Error('Expected price filter group in sample data');
    }

    const filters = createEmptyProductFilters(filterGroups);
    filters[priceGroup.id] = ['price-range:2000:5000'];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      min_price: 2000,
      max_price: 5000,
    });
  });

  it('maps metafield and color filters to API query params', () => {
    const occasionGroup = filterGroups.find((group) => group.label === 'Occasion');
    const colorGroup = filterGroups.find((group) => group.label === 'Color');
    const filters = createEmptyProductFilters(filterGroups);

    if (!occasionGroup || !colorGroup) {
      throw new Error('Expected occasion and color filter groups in sample data');
    }

    const occasionOption = occasionGroup.options[0];
    const colorOption = colorGroup.options[0];

    if (!occasionOption || !colorOption) {
      throw new Error('Expected occasion and color filter options in sample data');
    }

    filters[occasionGroup.id] = [occasionOption.id];
    filters[colorGroup.id] = [colorOption.id];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      ocassion: occasionOption.label,
      color: colorOption.label,
    });
  });

  it('maps price bucket above selections with collection max bound', () => {
    const priceGroup = filterGroups.find((group) => group.label === 'Price');

    if (!priceGroup) {
      throw new Error('Expected price filter group in sample data');
    }

    const aboveOption = priceGroup.options.find((option) => option.id.includes('above'));

    if (!aboveOption) {
      throw new Error('Expected above price bucket in sample data');
    }

    const filters = createEmptyProductFilters(filterGroups);
    filters[priceGroup.id] = [aboveOption.id];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      min_price: aboveOption.min,
      max_price: priceGroup.max,
    });
  });

  it('omits max_price for gold above when catalog max is below the bucket floor', () => {
    const goldFilterGroups = transformAvailableProductFilters(
      sample.data.available_filters as AvailableProductFiltersApiResponse,
      undefined,
      'gold',
    );
    const priceGroup = goldFilterGroups.find((group) => group.label === 'Price');
    const aboveOption = priceGroup?.options.find((option) => option.id.includes('above'));

    if (!priceGroup || !aboveOption) {
      throw new Error('Expected gold above price bucket');
    }

    const filters = createEmptyProductFilters(goldFilterGroups);
    filters[priceGroup.id] = [aboveOption.id];

    expect(buildCollectionProductFilterParams(filters, goldFilterGroups)).toEqual({
      min_price: 50_000,
    });
  });

  it('joins multiple selections in the same filter group into comma-separated query params', () => {
    const productTypeGroup = filterGroups.find((group) => group.label === 'Product type');
    const colorGroup = filterGroups.find((group) => group.label === 'Color');
    const filters = createEmptyProductFilters(filterGroups);

    if (!productTypeGroup || !colorGroup) {
      throw new Error('Expected product type and color filter groups in sample data');
    }

    const earringsOption = productTypeGroup.options.find((option) => option.label === 'Earrings');
    const ringsOption = productTypeGroup.options.find((option) => option.label === 'Rings');
    const goldOption = colorGroup.options.find((option) => option.label === 'Gold');
    const silverOption = colorGroup.options.find((option) => option.label === 'Silver');

    if (!earringsOption || !ringsOption || !goldOption || !silverOption) {
      throw new Error('Expected earrings, rings, gold, and silver filter options in sample data');
    }

    filters[productTypeGroup.id] = [earringsOption.id, ringsOption.id];
    filters[colorGroup.id] = [goldOption.id, silverOption.id];

    expect(buildCollectionProductFilterParams(filters, filterGroups)).toEqual({
      product_type: 'Earrings,Rings',
      color: 'Gold,Silver',
    });
  });
});

describe('resolveListingPriceBucketSet', () => {
  it('uses gold buckets when a product is gold', () => {
    expect(resolveListingPriceBucketSet([{ productCategory: 'gold' }], 'rings')).toBe('gold');
  });

  it('uses gold buckets when the collection handle is 9kt gold jewellery', () => {
    expect(resolveListingPriceBucketSet([], '9kt-gold-rings')).toBe('gold');
  });

  it('uses default buckets for demifine products without a gold handle', () => {
    expect(resolveListingPriceBucketSet([{ productCategory: 'demifine' }], 'rings')).toBe(
      'default',
    );
  });

  it('uses default buckets when products and handle are missing', () => {
    expect(resolveListingPriceBucketSet([])).toBe('default');
  });
});

describe('getFilterDisplayLabel', () => {
  it('converts uppercase labels to sentence case', () => {
    expect(getFilterDisplayLabel('STYLE')).toBe('Style');
    expect(getFilterDisplayLabel('GOLD RINGS')).toBe('Gold rings');
  });

  it('converts title case labels to sentence case', () => {
    expect(getFilterDisplayLabel('Product Type')).toBe('Product type');
  });

  it('leaves already sentence-cased labels unchanged', () => {
    expect(getFilterDisplayLabel('Color')).toBe('Color');
  });

  it('returns empty or whitespace-only labels unchanged', () => {
    expect(getFilterDisplayLabel('')).toBe('');
    expect(getFilterDisplayLabel('   ')).toBe('   ');
  });
});

describe('getFilterPriceBounds', () => {
  it('always starts the slider at 0 even when group.min is higher', () => {
    const group: ProductFilterGroup = {
      id: 'price',
      label: 'Price',
      min: 999,
      max: 50_000,
      options: [
        { id: 'price-0-2499', label: '₹0 - ₹2,499', min: 0, max: 2499 },
        { id: 'price-2500-4999', label: '₹2,500 - ₹4,999', min: 2500, max: 4999 },
        { id: 'price-50000-above', label: '₹50,000 above', min: 50_000 },
      ],
    };

    expect(getFilterPriceBounds(group)).toEqual({ min: 0, max: 50_000 });
  });

  it('always starts at 0 when the lowest bucket is above zero', () => {
    const group: ProductFilterGroup = {
      id: 'price',
      label: 'Price',
      min: 500,
      max: 10_000,
      options: [
        { id: 'price-500-999', label: '₹500 - ₹999', min: 500, max: 999 },
        { id: 'price-1000-above', label: '₹1,000 above', min: 1000 },
      ],
    };

    expect(getFilterPriceBounds(group)).toEqual({ min: 0, max: 10_000 });
  });

  it('falls back to group max when options have no min/max', () => {
    const group: ProductFilterGroup = {
      id: 'price',
      label: 'Price',
      min: 0,
      max: 10_000,
      options: [{ id: 'any', label: 'Any' }],
    };

    expect(getFilterPriceBounds(group)).toEqual({ min: 0, max: 10_000 });
  });

  it('returns zero bounds when neither group nor options define a range', () => {
    const group: ProductFilterGroup = {
      id: 'price',
      label: 'Price',
      options: [],
    };

    expect(getFilterPriceBounds(group)).toEqual({ min: 0, max: 0 });
  });
});

describe('clampPriceRange', () => {
  const bounds = { min: 0, max: 10_000 };

  it('snaps typed-like values to the ₹100 step for slider use', () => {
    expect(clampPriceRange(999, 10_000, bounds, 100)).toEqual({ min: 1000, max: 10_000 });
    expect(clampPriceRange(500, 10_000, bounds, 100)).toEqual({ min: 500, max: 10_000 });
  });

  it('keeps a minimum step gap between thumbs', () => {
    expect(clampPriceRange(900, 950, bounds, 100)).toEqual({ min: 900, max: 1000 });
  });
});

describe('clampPriceRangeExact', () => {
  const bounds = { min: 0, max: 10_000 };

  it('preserves exact amounts without ₹100 snapping', () => {
    expect(clampPriceRangeExact(999, 10_000, bounds)).toEqual({ min: 999, max: 10_000 });
    expect(clampPriceRangeExact(500, 10_000, bounds)).toEqual({ min: 500, max: 10_000 });
  });

  it('clamps to bounds and keeps min below max by ₹1', () => {
    expect(clampPriceRangeExact(-50, 10_000, bounds)).toEqual({ min: 0, max: 10_000 });
    expect(clampPriceRangeExact(500, 500, bounds)).toEqual({ min: 500, max: 501 });
    expect(clampPriceRangeExact(10_000, 10_000, bounds)).toEqual({ min: 9999, max: 10_000 });
  });
});
