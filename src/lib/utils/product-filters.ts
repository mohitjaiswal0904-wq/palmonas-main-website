import { goldPriceFilterBuckets } from '@/config/product-listing/product-listing.config';
import { PRODUCT_CATEGORY } from '@/types/product';
import type {
  AvailableProductFiltersApiResponse,
  CollectionProductListApiResponse,
  ProductFilterApiGroup,
  ProductFilterApiInput,
  ProductFilterApiValue,
} from '@/types/product-filters';
import type {
  ProductFilterGroup,
  ProductFilterOption,
  ProductFilters,
  ProductSortAlias,
  ProductSortOption,
} from '@/types/product-listing';

export type ListingPriceBucketSet = 'gold' | 'default';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toText(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function slugifyFilterId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function dedupeOptions(options: ProductFilterOption[]): ProductFilterOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    if (seen.has(option.id)) {
      return false;
    }

    seen.add(option.id);
    return true;
  });
}

function getFilterOptionInputValues(input: unknown): string[] {
  if (!isRecord(input)) {
    return [];
  }

  const values: string[] = [];

  Object.values(input).forEach((value) => {
    if (isRecord(value)) {
      Object.values(value).forEach((nestedValue) => {
        const text = toText(nestedValue);

        if (text) {
          values.push(text);
        }
      });
      return;
    }

    const text = toText(value);

    if (text) {
      values.push(text);
    }
  });

  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getPriceRange(raw: unknown): { min: number; max: number } | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  const input = raw.input;
  const price = isRecord(input) && isRecord(input.price) ? input.price : raw.price;

  if (!isRecord(price)) {
    return undefined;
  }

  const min = toOptionalNumber(price.min);
  const max = toOptionalNumber(price.max);

  if (min === undefined || max === undefined || max < min) {
    return undefined;
  }

  return { min, max };
}

/**
 * Picks gold vs default price buckets for a collection listing.
 *
 * Gold collections are detected from product category, then from handles that
 * include `gold` or `9kt` (drawer gold jewellery routes).
 *
 * @param products - Products on the listing page.
 * @param collectionHandle - Collection handle from the products list API.
 * @returns Bucket set used for Price checkbox options.
 */
export function resolveListingPriceBucketSet(
  products: Array<{ productCategory?: string }>,
  collectionHandle?: string,
): ListingPriceBucketSet {
  if (products.some((product) => product.productCategory === PRODUCT_CATEGORY.GOLD)) {
    return 'gold';
  }

  const handle = collectionHandle?.trim().toLowerCase() ?? '';

  if (handle.includes('gold') || handle.includes('9kt')) {
    return 'gold';
  }

  return 'default';
}

function formatPriceRangeLabel(min: number, max: number): string {
  return `₹${Math.round(min).toLocaleString('en-IN')} - ₹${Math.round(max).toLocaleString('en-IN')}`;
}

function formatPriceAboveLabel(min: number): string {
  return `₹${Math.round(min).toLocaleString('en-IN')} - Above`;
}

function roundUpToStep(value: number, step: number): number {
  return Math.ceil(value / step) * step;
}

/**
 * Build gold Price checkbox buckets from listing config.
 * Open-ended "Above" options carry `max` when the API ceiling is above the bucket floor.
 *
 * @param catalogMax - API catalog price ceiling.
 * @returns Filter options for gold collection Price groups.
 */
function createGoldPriceRangeOptions(catalogMax: number): ProductFilterOption[] {
  return goldPriceFilterBuckets.map((bucket) => {
    const bucketMax = 'max' in bucket && typeof bucket.max === 'number' ? bucket.max : undefined;

    if (bucketMax === undefined) {
      return {
        id: `price-${Math.round(bucket.min)}-above`,
        label: bucket.label,
        value: `${Math.round(bucket.min)}-above`,
        min: bucket.min,
        ...(catalogMax > bucket.min ? { max: catalogMax } : {}),
      };
    }

    return {
      id: `price-${Math.round(bucket.min)}-${Math.round(bucketMax)}`,
      label: bucket.label,
      value: `${Math.round(bucket.min)}-${Math.round(bucketMax)}`,
      min: bucket.min,
      max: bucketMax,
    };
  });
}

/**
 * Build price checkbox buckets from an API PRICE_RANGE min/max.
 * Open-ended "Above" options carry `max` when the API ceiling is above the bucket floor.
 *
 * @param min - API catalog price floor.
 * @param max - API catalog price ceiling.
 * @returns Filter options for the Price group.
 */
function createApiPriceRangeOptions(min: number, max: number): ProductFilterOption[] {
  // Keep the first bucket (and slider floor) at ₹0 whenever the API/catalog floor is under ₹500.
  const start = min < 500 ? 0 : Math.floor(min / 1000) * 1000;
  const aboveStart = Math.floor(max / 1000) * 1000;
  const options: ProductFilterOption[] = [];
  const aboveMax = max > aboveStart ? max : undefined;

  if (aboveStart <= start) {
    return [
      {
        id: `price-${Math.round(start)}-above`,
        label: formatPriceAboveLabel(start),
        value: `${Math.round(start)}-above`,
        min: start,
        ...(max > start ? { max } : {}),
      },
    ];
  }

  const step = roundUpToStep((aboveStart - start) / 4, 500);

  for (let rangeMin = start; rangeMin < aboveStart && options.length < 4; rangeMin += step) {
    const rangeMax = Math.min(rangeMin + step - 1, aboveStart - 1);

    if (rangeMax <= rangeMin) {
      continue;
    }

    options.push({
      id: `price-${Math.round(rangeMin)}-${Math.round(rangeMax)}`,
      label: formatPriceRangeLabel(rangeMin, rangeMax),
      value: `${Math.round(rangeMin)}-${Math.round(rangeMax)}`,
      min: rangeMin,
      max: rangeMax,
    });
  }

  options.push({
    id: `price-${Math.round(aboveStart)}-above`,
    label: formatPriceAboveLabel(aboveStart),
    value: `${Math.round(aboveStart)}-above`,
    min: aboveStart,
    ...(aboveMax !== undefined ? { max: aboveMax } : {}),
  });

  return options;
}

/**
 * Build price checkbox buckets for a listing.
 *
 * @param min - API catalog price floor.
 * @param max - API catalog price ceiling.
 * @param bucketSet - Gold uses fixed buckets; default stays API-driven.
 * @returns Filter options for the Price group.
 */
function createPriceRangeOptions(
  min: number,
  max: number,
  bucketSet: ListingPriceBucketSet,
): ProductFilterOption[] {
  if (bucketSet === 'gold') {
    return createGoldPriceRangeOptions(max);
  }

  return createApiPriceRangeOptions(min, max);
}

function parseFilterApiInput(input: unknown): ProductFilterApiInput | undefined {
  if (!isRecord(input)) {
    return undefined;
  }

  if (isRecord(input.price)) {
    const min = toOptionalNumber(input.price.min);
    const max = toOptionalNumber(input.price.max);

    if (min !== undefined && max !== undefined) {
      return { price: { min, max } };
    }
  }

  const productType = toText(input.productType);

  if (productType) {
    return { productType };
  }

  if (isRecord(input.productMetafield)) {
    const namespace = toText(input.productMetafield.namespace);
    const key = toText(input.productMetafield.key);
    const value = toText(input.productMetafield.value);

    if (namespace && key && value) {
      return { productMetafield: { namespace, key, value } };
    }
  }

  if (isRecord(input.variantOption)) {
    const name = toText(input.variantOption.name);
    const value = toText(input.variantOption.value);

    if (name && value) {
      return { variantOption: { name, value } };
    }
  }

  return undefined;
}

function normaliseFilterOption(raw: unknown, fallbackId?: string): ProductFilterOption | undefined {
  if (!isRecord(raw)) {
    const label = toText(raw) ?? fallbackId;

    if (!label) {
      return undefined;
    }

    return { id: slugifyFilterId(label), label, value: label };
  }

  const label =
    toText(raw.label) ??
    toText(raw.name) ??
    toText(raw.title) ??
    toText(raw.value) ??
    toText(raw.id) ??
    fallbackId;

  if (!label) {
    return undefined;
  }

  const input = parseFilterApiInput(raw.input);
  const inputValues = getFilterOptionInputValues(raw.input);
  const value = inputValues[0] ?? toText(raw.value) ?? toText(raw.id) ?? label;
  const id = toText(raw.id) ?? toText(raw.slug) ?? slugifyFilterId(value);
  const count = typeof raw.count === 'number' ? raw.count : undefined;
  const priceRange = getPriceRange(raw);

  return {
    id,
    label,
    value,
    count,
    min: priceRange?.min,
    max: priceRange?.max,
    input,
  };
}

function normaliseFilterOptions(raw: unknown): ProductFilterOption[] {
  if (!Array.isArray(raw)) {
    if (!isRecord(raw)) {
      return [];
    }

    return dedupeOptions(
      Object.entries(raw).flatMap(([key, value]) => {
        const option = normaliseFilterOption(value, key);

        return option ? [option] : [];
      }),
    );
  }

  return dedupeOptions(
    raw.flatMap((item) => {
      const option = normaliseFilterOption(item);

      return option ? [option] : [];
    }),
  );
}

function normaliseFilterGroup(
  raw: unknown,
  fallbackId?: string,
  productPriceMin?: number,
  priceBucketSet: ListingPriceBucketSet = 'default',
): ProductFilterGroup | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  const label =
    toText(raw.label) ??
    toText(raw.name) ??
    toText(raw.title) ??
    toText(raw.key) ??
    toText(raw.field) ??
    fallbackId;

  if (!label) {
    return undefined;
  }

  const id =
    toText(raw.id) ??
    toText(raw.key) ??
    toText(raw.field) ??
    toText(raw.slug) ??
    slugifyFilterId(label);
  const normalisedType = toText(raw.type)?.toLowerCase().replace(/-/g, '_');
  const rawOptions = raw.options ?? raw.values ?? raw.items ?? raw.buckets;
  const priceRange =
    normalisedType === 'price_range' && Array.isArray(rawOptions)
      ? rawOptions.flatMap((option) => {
          const range = getPriceRange(option);

          return range ? [range] : [];
        })[0]
      : undefined;

  let options: ProductFilterOption[];

  if (normalisedType === 'price_range' && Array.isArray(rawOptions)) {
    options = rawOptions.flatMap((option) => {
      const range = getPriceRange(option);

      // Gold uses fixed buckets; other categories stay API-driven from catalog min/max.
      return range ? createPriceRangeOptions(range.min, range.max, priceBucketSet) : [];
    });
  } else {
    options = normaliseFilterOptions(rawOptions);
  }

  if (options.length === 0) {
    return undefined;
  }

  const configuredMins = options
    .map((option) => option.min)
    .filter((value): value is number => typeof value === 'number');
  const configuredMaxes = options
    .map((option) => option.max)
    .filter((value): value is number => typeof value === 'number');

  return {
    id,
    label,
    options,
    min: priceRange?.min ?? productPriceMin ?? 0,
    max:
      priceRange?.max ??
      (configuredMaxes.length > 0 ? Math.max(...configuredMaxes) : undefined) ??
      (configuredMins.length > 0 ? Math.max(...configuredMins) : undefined),
  };
}

export function unwrapAvailableProductFilters(
  raw: CollectionProductListApiResponse['available_filters'],
): ProductFilterApiGroup[] | undefined {
  if (!raw) {
    return undefined;
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (isRecord(raw) && Array.isArray(raw.filters)) {
    return raw.filters as ProductFilterApiGroup[];
  }

  return undefined;
}

/**
 * Maps collection `available_filters` into listing filter groups.
 *
 * @param raw - API available_filters payload.
 * @param productPriceMin - Cheapest product on the current page (slider floor fallback).
 * @param priceBucketSet - Gold uses fixed buckets; default stays API-driven.
 * @returns Normalised filter groups for the listing UI.
 */
export function transformAvailableProductFilters(
  raw: CollectionProductListApiResponse['available_filters'],
  productPriceMin?: number,
  priceBucketSet: ListingPriceBucketSet = 'default',
): ProductFilterGroup[] {
  const filters = unwrapAvailableProductFilters(raw);

  if (!filters) {
    return [];
  }

  return filters.flatMap((item) => {
    const group = normaliseFilterGroup(item, undefined, productPriceMin, priceBucketSet);

    return group ? [group] : [];
  });
}

function isPriceFilterGroupId(groupId: string): boolean {
  return groupId.toLowerCase().includes('price');
}

export const CUSTOM_PRICE_RANGE_OPTION_PREFIX = 'price-range:';

export function createCustomPriceRangeOptionId(min: number, max: number): string {
  return `${CUSTOM_PRICE_RANGE_OPTION_PREFIX}${Math.round(min)}:${Math.round(max)}`;
}

export function isCustomPriceRangeOptionId(optionId: string): boolean {
  return optionId.startsWith(CUSTOM_PRICE_RANGE_OPTION_PREFIX);
}

export function parseCustomPriceRangeOptionId(
  optionId: string,
): { min: number; max: number } | undefined {
  if (!isCustomPriceRangeOptionId(optionId)) {
    return undefined;
  }

  const [minValue, maxValue] = optionId
    .slice(CUSTOM_PRICE_RANGE_OPTION_PREFIX.length)
    .split(':')
    .map((value) => Number.parseInt(value, 10));

  if (
    minValue === undefined ||
    maxValue === undefined ||
    !Number.isFinite(minValue) ||
    !Number.isFinite(maxValue) ||
    maxValue < minValue
  ) {
    return undefined;
  }

  return { min: minValue, max: maxValue };
}

export function getPriceFilterOptionLabel(
  group: ProductFilterGroup,
  optionId: string,
): string | undefined {
  const customRange = parseCustomPriceRangeOptionId(optionId);

  if (customRange) {
    return `${formatFilterCurrency(customRange.min)} - ${formatFilterCurrency(customRange.max)}`;
  }

  return group.options.find((option) => option.id === optionId)?.label;
}

function snapPriceValue(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Formats a filter label for display in sentence case.
 *
 * @param label - Raw filter group or option label from the API.
 * @returns Sentence-cased label (first character upper, remainder lower).
 */
export function getFilterDisplayLabel(label: string): string {
  const trimmed = label.trim();

  if (!trimmed) {
    return label;
  }

  const lower = trimmed.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

export function isPriceFilterGroup(group: ProductFilterGroup | undefined): boolean {
  return Boolean(group && isPriceFilterGroupId(group.id));
}

export function getDesktopFilterGroups(groups: ProductFilterGroup[]): ProductFilterGroup[] {
  return groups.filter((group) => !isPriceFilterGroup(group));
}

export function stripPriceFilterGroups(groups: ProductFilterGroup[]): ProductFilterGroup[] {
  return groups.filter((group) => !isPriceFilterGroup(group));
}

export function stripPriceFilters(filters: ProductFilters): ProductFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([groupId]) => !isPriceFilterGroupId(groupId)),
  );
}

/**
 * Drops filter groups with no selected options so URL state and comparisons stay stable.
 *
 * @param filters - Product filter map (may include empty group keys from the filter UI).
 * @returns Filters containing only groups with at least one selected option.
 */
export function compactProductFilters(filters: ProductFilters): ProductFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, optionIds]) => optionIds.length > 0),
  );
}

export function hasFilterOptions(groups: ProductFilterGroup[]): boolean {
  return groups.some((group) => group.options.length > 0);
}

export function formatFilterCurrency(value: number): string {
  return `₹${Math.round(value)}`;
}

/**
 * Resolves slider bounds for a price filter group.
 * Min is always 0 so the dual-thumb control starts at ₹0 regardless of API/bucket floors.
 *
 * @param group - Price filter group with optional bounds and bucket options.
 * @returns Inclusive min/max for the dual-thumb range control.
 */
export function getFilterPriceBounds(group: ProductFilterGroup): { min: number; max: number } {
  const maxValues = group.options.flatMap((option) =>
    typeof option.max === 'number' ? [option.max] : [],
  );
  // Open-ended "above" buckets only set `min` — include those so the slider can reach them.
  const openEndedMins = group.options.flatMap((option) =>
    typeof option.min === 'number' && typeof option.max !== 'number' ? [option.min] : [],
  );

  const maxCandidates = [
    ...(typeof group.max === 'number' ? [group.max] : []),
    ...maxValues,
    ...openEndedMins,
  ];

  return {
    min: 0,
    max: maxCandidates.length > 0 ? Math.max(...maxCandidates) : 0,
  };
}

const PRICE_RANGE_STEP = 100;

/** Minimum gap between min and max when typing exact rupee amounts (no ₹100 snap). */
const PRICE_RANGE_EXACT_GAP = 1;

export function getPriceRangeStepForGroup(_group: ProductFilterGroup): number {
  return PRICE_RANGE_STEP;
}

/**
 * Clamps a price range to bounds and snaps both ends to `step` (slider thumbs).
 *
 * @param min - Requested minimum.
 * @param max - Requested maximum.
 * @param bounds - Inclusive filter bounds.
 * @param step - Snap increment (typically ₹100).
 * @returns Snapped, ordered min/max within bounds.
 */
export function clampPriceRange(
  min: number,
  max: number,
  bounds: { min: number; max: number },
  step: number,
): { min: number; max: number } {
  const snappedMin = snapPriceValue(min, step);
  const snappedMax = snapPriceValue(max, step);
  const clampedMin = Math.max(bounds.min, Math.min(snappedMin, bounds.max));
  const clampedMax = Math.max(bounds.min, Math.min(snappedMax, bounds.max));

  if (clampedMax - clampedMin < step) {
    if (clampedMin + step <= bounds.max) {
      return { min: clampedMin, max: clampedMin + step };
    }

    return { min: Math.max(bounds.min, clampedMax - step), max: clampedMax };
  }

  return {
    min: Math.min(clampedMin, clampedMax - step),
    max: Math.max(clampedMax, clampedMin + step),
  };
}

/**
 * Clamps a price range to bounds without ₹100 snapping (text inputs).
 * Preserves entered amounts; only enforces bounds and min &lt; max.
 *
 * @param min - Requested minimum.
 * @param max - Requested maximum.
 * @param bounds - Inclusive filter bounds.
 * @returns Exact, ordered min/max within bounds.
 */
export function clampPriceRangeExact(
  min: number,
  max: number,
  bounds: { min: number; max: number },
): { min: number; max: number } {
  const clampedMin = Math.max(bounds.min, Math.min(Math.round(min), bounds.max));
  const clampedMax = Math.max(bounds.min, Math.min(Math.round(max), bounds.max));

  if (clampedMax - clampedMin < PRICE_RANGE_EXACT_GAP) {
    if (clampedMin + PRICE_RANGE_EXACT_GAP <= bounds.max) {
      return { min: clampedMin, max: clampedMin + PRICE_RANGE_EXACT_GAP };
    }

    return {
      min: Math.max(bounds.min, clampedMax - PRICE_RANGE_EXACT_GAP),
      max: clampedMax,
    };
  }

  return { min: clampedMin, max: clampedMax };
}

export function isFullPriceRange(
  min: number,
  max: number,
  bounds: { min: number; max: number },
): boolean {
  return min <= bounds.min && max >= bounds.max;
}

function mergeQueryParamValue(
  params: Record<string, string | number>,
  key: string,
  value: string | number,
): void {
  const normalisedValue = String(value).trim();

  if (normalisedValue.length === 0) {
    return;
  }

  const existing = params[key];

  if (existing === undefined) {
    params[key] = value;
    return;
  }

  const existingValues = String(existing)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (existingValues.includes(normalisedValue)) {
    return;
  }

  params[key] = `${existing},${normalisedValue}`;
}

function applyQueryParams(
  params: Record<string, string | number>,
  nextParams: Record<string, string | number>,
): void {
  Object.entries(nextParams).forEach(([key, value]) => {
    mergeQueryParamValue(params, key, value);
  });
}

function mapFilterInputToQueryParams(
  input: ProductFilterApiInput,
  label: string,
): Record<string, string | number> {
  if ('productType' in input) {
    return { product_type: input.productType };
  }

  if ('productMetafield' in input) {
    return { [input.productMetafield.key]: input.productMetafield.value };
  }

  if ('variantOption' in input) {
    if (input.variantOption.name.toLowerCase() === 'color') {
      return { color: label };
    }

    return { [`variant_option.${input.variantOption.name}`]: label };
  }

  if ('price' in input) {
    return {
      min_price: input.price.min,
      max_price: input.price.max,
    };
  }

  return {};
}

function mapPriceOptionToQueryParams(
  option: ProductFilterOption,
  group: ProductFilterGroup,
  optionId: string,
): Record<string, number> {
  const customRange = parseCustomPriceRangeOptionId(optionId);

  if (customRange) {
    return {
      min_price: customRange.min,
      max_price: customRange.max,
    };
  }

  if (typeof option.min !== 'number') {
    return {};
  }

  if (typeof option.max === 'number') {
    return {
      min_price: option.min,
      max_price: option.max,
    };
  }

  const groupMax = group.max;

  // Open-ended "and above" — only bound by catalog max when it still sits above the floor.
  if (typeof groupMax === 'number' && groupMax >= option.min) {
    return {
      min_price: option.min,
      max_price: groupMax,
    };
  }

  return {
    min_price: option.min,
  };
}

export function buildCollectionProductFilterParams(
  filters: ProductFilters,
  filterGroups: ProductFilterGroup[],
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  Object.entries(filters).forEach(([groupId, selectedOptionIds]) => {
    if (selectedOptionIds.length === 0) {
      return;
    }

    const group = filterGroups.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    selectedOptionIds.forEach((optionId) => {
      if (isPriceFilterGroupId(groupId) && isCustomPriceRangeOptionId(optionId)) {
        const customRange = parseCustomPriceRangeOptionId(optionId);

        if (customRange) {
          applyQueryParams(params, {
            min_price: customRange.min,
            max_price: customRange.max,
          });
        }

        return;
      }

      const option = group.options.find((item) => item.id === optionId);

      if (!option) {
        return;
      }

      if (isPriceFilterGroupId(groupId)) {
        applyQueryParams(params, mapPriceOptionToQueryParams(option, group, optionId));
        return;
      }

      if (option.input) {
        applyQueryParams(params, mapFilterInputToQueryParams(option.input, option.label));
        return;
      }

      // Fallback when API list options omit `input` (seen on some STYLE metafield rows).
      const metafieldFromId = /^filter\.p\.m\.([^.]+)\.([^.]+)\.(.+)$/.exec(option.id);

      if (metafieldFromId?.[2]) {
        const metafieldKey = metafieldFromId[2];
        applyQueryParams(params, {
          [metafieldKey]: option.value || option.label,
        });
      }
    });
  });

  return params;
}

const COLLECTION_SORT_API_MAP: Partial<Record<ProductSortOption | ProductSortAlias, string>> = {
  'new-arrivals': 'created-descending',
  'best-selling': 'best-selling',
  'price-asc': 'price-ascending',
  'price-desc': 'price-descending',
  'name-asc': 'title-ascending',
  'name-desc': 'title-descending',
  'price-low-high': 'price-ascending',
  'price_asc': 'price-ascending',
  'price-high-low': 'price-descending',
  'price_desc': 'price-descending',
  'a-z': 'title-ascending',
  'name_asc': 'title-ascending',
  'z-a': 'title-descending',
  'name_desc': 'title-descending',
  'newest': 'created-descending',
  'just_launched': 'created-descending',
  'best-sellers': 'best-selling',
  'best_selling': 'best-selling',
  'trending': 'best-selling',
  'rating': 'best-selling',
};

export function toCollectionSortParam(
  sort: ProductSortOption | ProductSortAlias,
): string | undefined {
  return COLLECTION_SORT_API_MAP[sort];
}

const SEARCH_SORT_API_MAP: Partial<Record<ProductSortOption | ProductSortAlias, string>> = {
  'new-arrivals': 'newest',
  'best-selling': 'best-selling',
  'price-asc': 'price-asc',
  'price-desc': 'price-desc',
  'name-asc': 'name-asc',
  'name-desc': 'name-desc',
  'price-low-high': 'price-asc',
  'price_asc': 'price-asc',
  'price-high-low': 'price-desc',
  'price_desc': 'price-desc',
  'a-z': 'name-asc',
  'name_asc': 'name-asc',
  'z-a': 'name-desc',
  'name_desc': 'name-desc',
  'newest': 'newest',
  'just_launched': 'newest',
  'best-sellers': 'best-selling',
  'best_selling': 'best-selling',
  'trending': 'best-selling',
  'rating': 'rating-desc',
};

/**
 * Maps listing sort to GET /api/v2/search/products `sort`.
 * Featured / unknown values are omitted so the API uses relevance.
 *
 * @param sort - UI or alias sort value.
 * @returns Search API sort string, or undefined for relevance.
 */
export function toSearchSortParam(sort: ProductSortOption | ProductSortAlias): string | undefined {
  return SEARCH_SORT_API_MAP[sort];
}

export function isAvailableProductFiltersApiResponse(
  value: unknown,
): value is AvailableProductFiltersApiResponse {
  return isRecord(value) && Array.isArray(value.filters);
}

export function isProductFilterApiValue(value: unknown): value is ProductFilterApiValue {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.count === 'number' &&
    value.input !== undefined
  );
}
