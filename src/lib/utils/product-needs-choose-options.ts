import type { ProductVariant } from '@/types/product';

/**
 * Returns whether the user must pick size/color before add-to-cart or buy-now.
 *
 * @param variants - Product variant list from PDP/PLP API.
 * @returns True when multiple sizes or colors require a chooser sheet.
 */
export function productNeedsChooseOptions(variants: ProductVariant[] | undefined | null): boolean {
  if (!variants?.length) return false;
  if (variants.length > 1) return true;

  const sizes = new Set<string>();
  const colors = new Set<string>();

  for (const variant of variants) {
    for (const opt of variant.selectedOptions) {
      if (opt.name.toLowerCase().includes('color') && opt.value) {
        colors.add(opt.value.toLowerCase().trim());
      }
      if ((opt.name === 'Ring Size' || opt.name === 'Size') && opt.value) {
        sizes.add(opt.value.trim());
      }
    }
    const title = variant.title.toUpperCase();
    if (title.includes('ROSE')) colors.add('rose');
    else if (title.includes('WHITE')) colors.add('white');
    else if (title.includes('GOLD')) colors.add('gold');
  }

  return colors.size > 1 || sizes.size > 1;
}

/**
 * Picks the first available variant id, or first variant as fallback.
 *
 * @param variants - Product variant list.
 * @returns Variant id or undefined when list is empty.
 */
export function getDefaultVariantId(variants: ProductVariant[]): string | undefined {
  return variants.find((v) => v.availableForSale)?.id ?? variants[0]?.id;
}
