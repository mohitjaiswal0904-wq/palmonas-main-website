import type { GoldProductDetails, GoldProductDetailsRow } from '@/types/gold-product-details';
import type { MtoPrice } from '@/types/mto-price';
import type { ProductVariant } from '@/types/product';

function compactRows(rows: Array<GoldProductDetailsRow | null>): GoldProductDetailsRow[] {
  return rows.filter((row): row is GoldProductDetailsRow => row !== null);
}

function buildDetailRow(
  label: string,
  value: string | undefined | null,
): GoldProductDetailsRow | null {
  if (!value?.trim()) {
    return null;
  }

  return { label, value: value.trim() };
}

/** Formats a positive numeric value (with optional unit) for display, else undefined. */
function formatPositive(value: number | undefined, unit?: string): string | undefined {
  if (!value || value <= 0) {
    return undefined;
  }

  return unit ? `${value} ${unit}` : `${value}`;
}

function withUnit(value: string | undefined, unit: string): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.toLowerCase().endsWith(unit.toLowerCase())) {
    return trimmed;
  }

  return `${trimmed} ${unit}`;
}

export function buildGoldProductDetails(
  variant: ProductVariant | undefined,
  mtoPrice: MtoPrice | undefined,
): GoldProductDetails | undefined {
  const details = variant?.goldDetails;

  const metalRows = compactRows([
    buildDetailRow('Type', details?.metalType ?? 'Gold'),
    buildDetailRow('Purity', details?.purity ?? mtoPrice?.purityDisplay ?? mtoPrice?.purity),
    buildDetailRow('Colour', details?.colour ?? mtoPrice?.metal),
    buildDetailRow('SKU', variant?.sku),
    buildDetailRow(
      'Net weight',
      details?.netWeight ?? formatPositive(mtoPrice?.goldWeightGrams, 'g'),
    ),
  ]);

  const diamondRows = compactRows([
    buildDetailRow('Shape', details?.diamondShape),
    buildDetailRow('Clarity', details?.diamondClarity),
    buildDetailRow(
      'No of Diamond',
      details?.diamondCount ?? formatPositive(mtoPrice?.noOfDiamonds),
    ),
    buildDetailRow(
      'Weight',
      details?.diamondWeight ?? formatPositive(mtoPrice?.diamondWeightCarat, 'ct'),
    ),
  ]);

  const dimensionRows = compactRows([
    buildDetailRow('Width', withUnit(details?.width, 'cm')),
    buildDetailRow('Height', withUnit(details?.height, 'cm')),
    buildDetailRow('Gross weight', withUnit(details?.grossWeight, 'g')),
  ]);

  const sections = [
    metalRows.length > 0 ? { title: 'Metal Details', rows: metalRows } : null,
    diamondRows.length > 0 ? { title: 'Diamond Details', rows: diamondRows } : null,
    dimensionRows.length > 0 ? { title: 'Dimensions', rows: dimensionRows } : null,
  ].filter((section): section is GoldProductDetails['sections'][number] => section !== null);

  if (sections.length === 0) {
    return undefined;
  }

  return { sections };
}
