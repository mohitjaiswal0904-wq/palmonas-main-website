import type { CSSProperties } from 'react';

import {
  PRODUCT_CATEGORY,
  type Product,
  type ProductCategory,
  type ProductOptionGroup,
  type ProductVariant,
} from '@/types/product';

function buildMetallicSwatch(baseColor: string, metallicStops: string): string {
  return [
    `linear-gradient(134.59deg, ${metallicStops})`,
    `linear-gradient(0deg, ${baseColor}, ${baseColor})`,
  ].join(', ');
}

const ROSE_GOLD_SWATCH_BACKGROUND = buildMetallicSwatch(
  '#E08F98',
  '#965F59 10.86%, #B87A74 21.72%, #CF9690 25.66%, #B26A62 38.07%, #C17A72 53.81%, #D0948D 63.8%, #A55A53 77.5%, #B87A74 85.89%',
);

const GOLD_SWATCH_BACKGROUND = buildMetallicSwatch(
  '#C9B486',
  '#B39558 12.83%, #D9CDB0 51.34%, #C4AD82 85.89%',
);

const SILVER_SWATCH_BACKGROUND = buildMetallicSwatch(
  '#A8A8A8',
  '#686868 12.83%, #C8C8C8 51.34%, #808080 85.89%',
);

/**
 * Ordered matchers — first match wins (e.g. "rose gold" before "gold").
 */
const COLOR_SWATCH_MATCHERS: ReadonlyArray<{
  test: (value: string) => boolean;
  backgroundImage: string;
}> = [
  {
    test: (value) => /rose\s*gold|rose/i.test(value),
    backgroundImage: ROSE_GOLD_SWATCH_BACKGROUND,
  },
  { test: (value) => /\bwhite\b/i.test(value), backgroundImage: SILVER_SWATCH_BACKGROUND },
  { test: (value) => /gold/i.test(value), backgroundImage: GOLD_SWATCH_BACKGROUND },
  {
    test: (value) => /silver/i.test(value),
    backgroundImage: SILVER_SWATCH_BACKGROUND,
  },
];

const DEFAULT_COLOR_SWATCH_BACKGROUND = buildMetallicSwatch(
  '#E4D1A6',
  '#D1B574 12.83%, #F5ECD6 51.34%, #E4D3A2 85.89%',
);

/** Extra color keywords recognized for option-type detection only (no swatch). */
const EXTRA_COLOR_KEYWORDS = ['platinum', 'black', 'copper', 'brass'];

const COLOR_OPTION_PATTERN = /color|colour|metal|material|finish|plating/i;
const SIZE_OPTION_PATTERN = /size|ring/i;
const MEASUREMENT_UNIT_PATTERN = /\d+\s*(?:cm|mm|in(?:ch(?:es)?)?)\b/i;
const COLOR_VALUE_PATTERN = new RegExp(
  ['rose', 'gold', 'white', 'silver', ...EXTRA_COLOR_KEYWORDS].join('|'),
  'i',
);

/**
 * Returns whether a value is a numeric US ring size (e.g. `6`, `6.5`).
 *
 * @param value - Option value from the catalog.
 * @returns True when the value is digits only and not a length/thickness string.
 */
function isNumericRingSizeValue(value: string): boolean {
  return /^\d+(\.\d+)?$/.test(value.trim());
}

/**
 * Classifies an option group for the variant picker UI.
 *
 * Only numeric US ring sizes use the circular size chips. Length/thickness
 * strings such as `60cm / 6mm` stay `text` so they render as pills.
 *
 * @param name - Option group name from the catalog (e.g. `Ring Size`, `Size`).
 * @param values - Distinct values in the group.
 * @returns `color`, `size`, or `text`.
 */
export function detectOptionType(name: string, values: string[]): ProductOptionGroup['type'] {
  const nameLower = name.toLowerCase();

  if (COLOR_OPTION_PATTERN.test(nameLower)) {
    return 'color';
  }

  const isNumericRingSizeGroup =
    values.length > 0 &&
    values.every(isNumericRingSizeValue) &&
    SIZE_OPTION_PATTERN.test(nameLower);

  if (isNumericRingSizeGroup) {
    return 'size';
  }

  if (values.every((value) => COLOR_VALUE_PATTERN.test(value))) {
    return 'color';
  }

  return 'text';
}

function isDefaultOptionValue(value: string): boolean {
  return value.trim().toLowerCase() === 'default title';
}

function addOptionValue(groups: Map<string, Set<string>>, name: string, value: string): void {
  if (!value || isDefaultOptionValue(value)) {
    return;
  }

  const existing = groups.get(name) ?? new Set<string>();
  existing.add(value);
  groups.set(name, existing);
}

/**
 * Reads a numeric ring size from a variant title.
 *
 * Supports:
 * - Encoded metal/size titles: `9KT Yellow Gold / 4`
 * - Size-only titles when `selectedOptions` is empty: `6`, `7`, `8`
 *
 * @param title - Variant title returned by the catalog API.
 * @returns Size value, or undefined when the title is not a numeric size.
 */
function getTitleSize(title: string): string | undefined {
  const trimmed = title.trim();

  if (MEASUREMENT_UNIT_PATTERN.test(trimmed)) {
    return undefined;
  }

  const slashEncoded = trimmed.match(/\s\/\s*(\d+(?:\.\d+)?)\s*$/)?.[1];

  if (slashEncoded) {
    return slashEncoded;
  }

  return isNumericRingSizeValue(trimmed) ? trimmed : undefined;
}

/**
 * Resolves a real or title-derived option value for a variant.
 *
 * @param variant - Product variant to inspect.
 * @param optionName - Option group being matched.
 * @returns Matching option value when present.
 */
function getVariantOptionValue(variant: ProductVariant, optionName: string): string | undefined {
  const explicitOption = variant.selectedOptions.find((option) => option.name === optionName);

  if (explicitOption) {
    return explicitOption.value;
  }

  if (SIZE_OPTION_PATTERN.test(optionName)) {
    return getTitleSize(variant.title);
  }

  if (optionName === 'Color' && variant.selectedOptions.length === 0) {
    return variant.title;
  }

  return undefined;
}

export function buildOptionGroups(variants: ProductVariant[]): ProductOptionGroup[] {
  const groups = new Map<string, Set<string>>();

  for (const variant of variants) {
    const hasSelectableOptions = variant.selectedOptions.some(
      (option) => !isDefaultOptionValue(option.value),
    );

    if (hasSelectableOptions) {
      for (const option of variant.selectedOptions) {
        addOptionValue(groups, option.name, option.value);
      }
    }

    const hasExplicitSize = variant.selectedOptions.some((option) =>
      SIZE_OPTION_PATTERN.test(option.name),
    );
    const titleSize = hasExplicitSize ? undefined : getTitleSize(variant.title);

    if (titleSize) {
      addOptionValue(groups, 'Ring Size', titleSize);
    } else if (!hasSelectableOptions && variant.title && !isDefaultOptionValue(variant.title)) {
      addOptionValue(
        groups,
        MEASUREMENT_UNIT_PATTERN.test(variant.title) ? 'Size' : 'Color',
        variant.title,
      );
    }
  }

  const TYPE_ORDER: Record<ProductOptionGroup['type'], number> = {
    size: 0,
    color: 1,
    text: 2,
  };

  return Array.from(groups.entries())
    .map(([name, values]) => {
      const optionValues = Array.from(values);
      return {
        name,
        values: optionValues,
        type: detectOptionType(name, optionValues),
      };
    })
    .filter((group) => group.values.length > 1)
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.name.localeCompare(b.name));
}

export function getDefaultSelections(groups: ProductOptionGroup[]): Record<string, string> {
  return Object.fromEntries(groups.map((group) => [group.name, group.values[0] ?? '']));
}

export function findVariantBySelections(
  variants: ProductVariant[],
  selections: Record<string, string>,
): ProductVariant | undefined {
  return variants.find((variant) =>
    Object.entries(selections).every(
      ([optionName, selectedValue]) =>
        !selectedValue || getVariantOptionValue(variant, optionName) === selectedValue,
    ),
  );
}

/** Maps PDP variant stock fields to the utils EDD API `inStock` query param. */
export function isVariantInStock(variant: ProductVariant | undefined): boolean {
  if (!variant) {
    return true;
  }

  if (!variant.availableForSale) {
    return false;
  }

  // Only trust numeric inventory — API often sends `null` when quantity is untracked.
  if (typeof variant.quantityAvailable === 'number' && variant.quantityAvailable <= 0) {
    return false;
  }

  return true;
}

/**
 * Resolve whether a variant may show as in-stock / be purchased in UI.
 * Gold is always purchasable (product decision); demifine uses catalog stock.
 * Missing variant is not purchasable (unlike {@link isVariantInStock}, which
 * defaults true for EDD when no variant is selected yet).
 *
 * @param variant - Selected variant, if any.
 * @param productCategory - Product category (gold vs demifine).
 * @returns Whether UI should treat the variant as in stock / purchasable.
 */
export function isVariantPurchasable(
  variant: ProductVariant | undefined,
  productCategory?: ProductCategory,
): boolean {
  if (productCategory === PRODUCT_CATEGORY.GOLD) {
    return true;
  }

  if (!variant) {
    return false;
  }

  return isVariantInStock(variant);
}

/**
 * Resolve whether the shopper can purchase this product for the given variant.
 * Honours product-level `availableForSale` (API may return empty variants when OOS).
 *
 * @param product - Product with category and optional product-level availability.
 * @param variant - Selected variant, if any.
 * @returns Whether purchase CTAs should be enabled.
 */
export function isProductPurchasable(
  product: Pick<Product, 'productCategory' | 'availableForSale'>,
  variant: ProductVariant | undefined,
): boolean {
  if (product.productCategory === PRODUCT_CATEGORY.GOLD) {
    return true;
  }

  if (product.availableForSale === false) {
    return false;
  }

  return isVariantPurchasable(variant, product.productCategory);
}

/**
 * Resolve listing-card stock for search/collection grids.
 * Empty variant arrays stay in stock (list APIs often omit variants) unless
 * product-level `availableForSale` is false. Gold always stays purchasable.
 *
 * @param product - Listing product row.
 * @returns Whether the card should show add-to-cart.
 */
export function isListingProductInStock(product: Product): boolean {
  if (product.productCategory === PRODUCT_CATEGORY.GOLD) {
    return true;
  } else if (product.availableForSale === false) {
    return false;
  } else if (product.variants.length === 0) {
    return true;
  }

  return product.variants.some((variant) => isProductPurchasable(product, variant));
}

export function getDefaultVariant(variants: ProductVariant[]): ProductVariant | undefined {
  if (variants.length === 0) {
    return undefined;
  }

  const optionGroups = buildOptionGroups(variants);

  if (optionGroups.length === 0) {
    return variants[0];
  }

  const selections = getDefaultSelections(optionGroups);

  return findVariantBySelections(variants, selections) ?? variants[0];
}

/**
 * Builds the option-row heading for a size-like group.
 *
 * @param name - Option group name from the catalog.
 * @returns Ring-size copy for `Ring Size`, otherwise `Select {name}`.
 */
export function formatSizeOptionLabel(name: string): string {
  if (/ring\s*size/i.test(name)) {
    return 'Select Ring Size(US)';
  }

  return `Select ${name}`;
}

export function getColorSwatchBackground(value: string): string {
  const normalized = value.toLowerCase();
  const match = COLOR_SWATCH_MATCHERS.find(({ test }) => test(normalized));

  return match?.backgroundImage ?? DEFAULT_COLOR_SWATCH_BACKGROUND;
}

export function getColorSwatchStyle(value: string): CSSProperties {
  return {
    backgroundImage: getColorSwatchBackground(value),
    backgroundBlendMode: 'overlay',
  };
}

/** Class reserved for unknown colors; style background is preferred. */
export function getColorSwatchClass(_value: string): string {
  return '';
}
