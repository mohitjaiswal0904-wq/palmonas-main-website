import type { StaticImageData } from 'next/image';

import colorChipGold from '@/components/icons/svg/color-chip-gold.png';
import colorChipRoseGold from '@/components/icons/svg/color-chip-rose-gold.png';
import colorChipSilver from '@/components/icons/svg/color-chip-silver.png';
import { productTokens } from '@/config/theme/product.tokens';
import { buildOptionGroups } from '@/lib/utils/variant-options';
import type { ProductVariant } from '@/types/product';

const PRODUCT_COLOR_CHIP_MAP: Record<string, StaticImageData> = {
  'gold': colorChipGold,
  'yellow gold': colorChipGold,
  'rose gold': colorChipRoseGold,
  'rosegold': colorChipRoseGold,
  'silver': colorChipSilver,
  'white gold': colorChipSilver,
};

type ProductCardChipColor = 'gold' | 'rose gold' | 'silver';

const PRODUCT_CARD_CHIP_ALIASES: Record<string, ProductCardChipColor> = {
  'gold': 'gold',
  'yellow gold': 'gold',
  'rose gold': 'rose gold',
  'rosegold': 'rose gold',
  'silver': 'silver',
  'white gold': 'silver',
};

function normalizeColorKey(color: string): string {
  return color
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\d+\s*(?:k\s*t|kt|k|ct|carat)\s+/i, '');
}

export function isProductChipColor(color: string): boolean {
  return normalizeColorKey(color) in PRODUCT_CARD_CHIP_ALIASES;
}

export function toProductChipColor(color: string): ProductCardChipColor | undefined {
  return PRODUCT_CARD_CHIP_ALIASES[normalizeColorKey(color)];
}

/**
 * Resolve a product color name to its theme fill class.
 *
 * @param color - API or display color label.
 */
export function getProductColorClass(color: string): string {
  const key = normalizeColorKey(color);
  const classes = productTokens.metalColors.classByName;

  if (Object.hasOwn(classes, key)) {
    return classes[key as keyof typeof classes];
  }

  return productTokens.metalColors.fallbackClass;
}

export function getProductColorChip(color: string): StaticImageData | undefined {
  const chipColor = toProductChipColor(color);

  if (!chipColor) {
    return undefined;
  }

  return PRODUCT_COLOR_CHIP_MAP[chipColor];
}

export function getProductColors(product: {
  colors?: string[];
  filterAttributes?: Record<string, string[]>;
}): string[] {
  const colors = product.colors ?? product.filterAttributes?.color ?? [];

  return Array.from(
    new Set(colors.map((color) => color.trim()).filter((color) => color.length > 0)),
  );
}

function collectProductCardChipColors(values: string[]): ProductCardChipColor[] {
  const chipColors: ProductCardChipColor[] = [];
  const seenChipColors = new Set<ProductCardChipColor>();

  for (const value of values) {
    const chipColor = toProductChipColor(value);

    if (!chipColor || seenChipColors.has(chipColor)) {
      continue;
    }

    seenChipColors.add(chipColor);
    chipColors.push(chipColor);

    if (chipColors.length >= productTokens.cardSwatches.maxVisible) {
      break;
    }
  }

  return chipColors;
}

/**
 * Maps PDP metal-colour option values to listing-card chip colours.
 *
 * @param variants - Same variant list used by {@link buildOptionGroups} on the PDP.
 */
function getProductCardChipColorsFromVariants(variants: ProductVariant[]): ProductCardChipColor[] {
  const colorOptionValues = buildOptionGroups(variants)
    .filter((group) => group.type === 'color')
    .flatMap((group) => group.values);

  return collectProductCardChipColors(colorOptionValues);
}

/**
 * Chip colours for listing cards — derived only from selectable PDP metal options.
 *
 * @param product - Listing product; ignores `colors` / filters when variants are missing or
 *   do not expose multiple metal choices (matches {@link VariantSelector} on the PDP).
 */
export function getProductCardChipColors(product: {
  colors?: string[];
  filterAttributes?: Record<string, string[]>;
  variants?: ProductVariant[];
}): ProductCardChipColor[] {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return [];
  }

  return getProductCardChipColorsFromVariants(variants);
}

/**
 * True when the product card should render color chips (Figma: two or more).
 *
 * @param product - Listing product with variant rows from the catalog API.
 */
export function hasProductCardColorSwatches(product: {
  colors?: string[];
  filterAttributes?: Record<string, string[]>;
  variants?: ProductVariant[];
}): boolean {
  return getProductCardChipColors(product).length >= productTokens.cardSwatches.minVisible;
}
