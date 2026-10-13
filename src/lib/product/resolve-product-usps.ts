import { productUspRules } from '@/config/product/product.config';
import { PRODUCT_USP_IDS, type ProductUspId } from '@/types/product';

const PRODUCT_USP_ID_SET = new Set<string>(PRODUCT_USP_IDS);

/**
 * Returns whether a raw API string is a known demifine USP key.
 *
 * @param value - Trimmed, lowercased API token.
 */
function isProductUspId(value: string): value is ProductUspId {
  return PRODUCT_USP_ID_SET.has(value);
}

/**
 * Normalizes tag copy so `Metal_925 Sterling_Silver` matches `925_sterling_silver`.
 *
 * @param value - Raw tag name or value.
 */
function toTagHaystackToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

/**
 * Flattens API tags into one searchable string.
 *
 * @param tags - `product_tags`, `tags`, or a mix of both.
 */
function collectTagHaystack(tags: unknown): string {
  const parts: string[] = [];

  const visit = (value: unknown): void => {
    if (typeof value === 'string' && value.trim()) {
      parts.push(toTagHaystackToken(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (value && typeof value === 'object') {
      const record = value as { name?: unknown; value?: unknown };
      visit(record.name);
      visit(record.value);
    }
  };

  visit(tags);

  return parts.join(' ');
}

/**
 * Returns the first configured USP whose needles appear in the tag haystack.
 *
 * @param rules - Id + needle pairs from product config.
 * @param haystack - Normalized tag string.
 */
function firstMatchingUsp(
  rules: readonly { id: string; needles: readonly string[] }[],
  haystack: string,
): ProductUspId | undefined {
  for (const rule of rules) {
    if (!isProductUspId(rule.id)) {
      continue;
    }

    if (rule.needles.some((needle) => haystack.includes(toTagHaystackToken(needle)))) {
      return rule.id;
    }
  }

  return undefined;
}

/**
 * Builds the default demifine USP row from product tags when the API omits `usps`.
 *
 * @param tags - Product tags used for the 3rd/4th slots.
 */
function deriveUspsFromTags(tags: unknown): ProductUspId[] {
  const haystack = collectTagHaystack(tags);
  const always = productUspRules.always.filter(isProductUspId);
  const third =
    firstMatchingUsp(productUspRules.thirdByTag, haystack) ??
    (isProductUspId(productUspRules.defaultThird)
      ? productUspRules.defaultThird
      : 'gold_tone_plated');
  const fourth = firstMatchingUsp(productUspRules.fourthByTag, haystack);
  const resolved = [...always, third];

  if (fourth) {
    resolved.push(fourth);
  }

  return resolved;
}

/**
 * Keeps known `usps` keys in API order and drops unknown or duplicate values.
 *
 * @param usps - Raw `usps` array from the product API.
 */
function resolveUspsFromApi(usps: unknown[]): ProductUspId[] {
  const seen = new Set<ProductUspId>();
  const resolved: ProductUspId[] = [];

  for (const item of usps) {
    if (typeof item !== 'string') {
      continue;
    }

    const id = item.trim().toLowerCase();

    if (!isProductUspId(id) || seen.has(id)) {
      continue;
    }

    seen.add(id);
    resolved.push(id);
  }

  return resolved;
}

/**
 * Resolves demifine USPs from the product API, then from tags when `usps` is missing.
 *
 * @param usps - Raw `usps` array from the product API.
 * @param tags - Product tags used only when the API omits a usable list.
 * @returns Canonical USP ids for the demifine PDP strip.
 */
export function resolveProductUsps(usps: unknown, tags?: unknown): ProductUspId[] {
  if (Array.isArray(usps)) {
    const fromApi = resolveUspsFromApi(usps);

    if (usps.length === 0 || fromApi.length > 0) {
      return fromApi;
    }
  }

  return deriveUspsFromTags(tags);
}
