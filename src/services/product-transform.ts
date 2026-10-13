/**
 * Service-layer transforms: map raw product API responses into the domain
 * types consumed by the app. Kept out of `@/types/product` so the types module
 * stays declaration-only.
 */
import { getProductBundleTitle } from '@/config/product/product.config';
import { resolveProductUsps } from '@/lib/product/resolve-product-usps';
import { isProductChipColor } from '@/lib/utils/product-colors';
import {
  resolveListingPriceBucketSet,
  transformAvailableProductFilters,
} from '@/lib/utils/product-filters';
import { transformCollectionListMeta } from '@/types/collection';
import type { GoldVariantDetails } from '@/types/gold-product-details';
import type {
  MoneyApiResponse,
  Product,
  ProductApiResponse,
  ProductCategory,
  ProductDetailApiResponse,
  ProductDetailEnvelopeApiResponse,
  ProductListApiResponse,
  ProductListEnvelopeApiResponse,
  ProductListResponse,
  ProductMetafieldApiResponse,
  ProductOffer,
  ProductOfferApiResponse,
  ProductOfferCollection,
  ProductOfferCollectionApiResponse,
  ProductReviews,
  ProductReviewsApiResponse,
  ProductTag,
  ProductTagApiResponse,
  ProductVariant,
  ProductVariantApiResponse,
} from '@/types/product';
import { PRODUCT_CATEGORY } from '@/types/product';
import type {
  ProductBundle,
  ProductBundleApiItem,
  ProductBundlesApiResponse,
  ProductBundlesEnvelopeApiResponse,
} from '@/types/product/bundles';
import type { CollectionProductListApiResponse } from '@/types/product-filters';
import type { ProductFilterGroup, ProductFilterOption } from '@/types/product-listing';

function normaliseShopifyId(id: string): string {
  return id.split('/').pop() ?? id;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function toMoneyNumber(value: number | string | MoneyApiResponse | null | undefined): number {
  if (typeof value === 'object' && value !== null) {
    return toNumber(value.amount);
  }

  return toNumber(value);
}

function toOfferType(value: string | undefined): ProductOffer['type'] {
  return value === 'FREEBIE' ? 'FREEBIE' : 'DISCOUNT';
}

/**
 * Read per-unit payable price from a listing discount payload.
 *
 * @param raw - Offer payload from product list / detail discounts.
 * @returns Positive payable price, or null when absent.
 */
function readOfferPayablePrice(raw: ProductOfferApiResponse): number | null {
  const parsed = toNumber(raw.payable_price ?? raw.payablePrice);
  return parsed > 0 ? parsed : null;
}

/**
 * Keep offer collections that have a usable handle for Shop By Offers rails.
 *
 * @param collections - Raw collections nested on a discount payload.
 * @returns Collections with a trimmed handle.
 */
function transformOfferCollections(
  collections: ProductOfferCollectionApiResponse[] | undefined,
): ProductOfferCollection[] {
  const mapped: ProductOfferCollection[] = [];

  for (const collection of collections ?? []) {
    const handle = collection.handle?.trim();
    if (!handle) {
      continue;
    }

    mapped.push({
      id: collection.id?.trim() || null,
      title: collection.title?.trim() || null,
      handle,
      image: collection.image?.trim() || null,
    });
  }

  return mapped;
}

/**
 * Reads a freebie media/route string from snake_case or camelCase API fields.
 *
 * @param raw - Offer payload from product detail / discounts.
 * @param snakeKey - Snake_case field name.
 * @param camelKey - CamelCase field name.
 * @returns Trimmed non-empty string, or undefined.
 */
function readOfferFreebieField(
  raw: ProductOfferApiResponse,
  snakeKey: 'freebie_image_url' | 'freebie_route',
  camelKey: 'freebieImageUrl' | 'freebieRoute',
): string | undefined {
  const snakeValue = raw[snakeKey];
  if (typeof snakeValue === 'string' && snakeValue.trim()) {
    return snakeValue.trim();
  }

  const camelValue = raw[camelKey];
  if (typeof camelValue === 'string' && camelValue.trim()) {
    return camelValue.trim();
  }

  return undefined;
}

function transformOffer(raw: ProductOfferApiResponse): ProductOffer {
  const freebieImageUrl = readOfferFreebieField(raw, 'freebie_image_url', 'freebieImageUrl');
  const freebieRoute = readOfferFreebieField(raw, 'freebie_route', 'freebieRoute');
  const payablePrice = readOfferPayablePrice(raw);
  const collections = transformOfferCollections(raw.collections);

  return {
    key: raw.key ?? raw.code ?? '',
    name: raw.name ?? '',
    description: raw.description ?? '',
    code: raw.code ?? '',
    type: toOfferType(raw.type),
    discountValue: raw.discount_value ?? null,
    ...(payablePrice !== null ? { payablePrice } : {}),
    ...(raw.discount_category ? { discountCategory: raw.discount_category } : {}),
    placeholder: (raw.placeholder ?? []).map((item) => ({
      text: item.text ?? '',
      style: item.style ?? 'normal',
    })),
    ...(freebieImageUrl ? { freebieImageUrl } : {}),
    ...(freebieRoute ? { freebieRoute } : {}),
    ...(collections.length > 0 ? { collections } : {}),
  };
}

function isProductOfferApiResponse(value: unknown): value is ProductOfferApiResponse {
  return typeof value === 'object' && value !== null;
}

function transformLegacyOfferCode(code: string): ProductOffer {
  const trimmed = code.trim();

  return transformOffer({
    key: trimmed,
    name: trimmed,
    description: '',
    code: trimmed,
    type: 'OFFER',
  });
}

function mergeOffers(...sources: (unknown[] | undefined)[]): ProductOffer[] {
  const seen = new Set<string>();
  const merged: ProductOffer[] = [];

  for (const source of sources) {
    for (const raw of source ?? []) {
      const offer =
        typeof raw === 'string'
          ? transformLegacyOfferCode(raw)
          : isProductOfferApiResponse(raw)
            ? transformOffer(raw)
            : null;

      if (!offer?.key || seen.has(offer.key)) {
        continue;
      }

      seen.add(offer.key);
      merged.push(offer);
    }
  }

  return merged;
}

function transformOffers(
  raw: ProductApiResponse,
  extraSources: (unknown[] | undefined)[] = [],
): ProductOffer[] {
  return mergeOffers(
    raw.offers,
    Array.isArray(raw.discounts) ? raw.discounts : undefined,
    Array.isArray(raw.discount_info) ? raw.discount_info : undefined,
    ...extraSources,
  );
}

function transformReviews(raw: ProductReviewsApiResponse): ProductReviews {
  return {
    avgRating: toNumber(raw.avg_rating ?? raw.avgRating),
    reviewCount: toNumber(raw.review_count ?? raw.reviewCount),
  };
}

function getProductImages(raw: ProductApiResponse): string[] {
  const imageUrls = raw.images
    ?.map((image) => image.url ?? image.src)
    .filter((url): url is string => Boolean(url));
  const images = raw.image_urls ?? imageUrls ?? [];
  const primaryImage = raw.image_url ?? raw.imageUrl;

  if (images.length > 0) {
    return images;
  }

  return primaryImage ? [primaryImage] : [];
}

function getProductPrice(raw: ProductApiResponse): number {
  const variant = raw.variants?.[0];

  return (
    toNumber(raw.price) ||
    toMoneyNumber(raw.priceRange?.minVariantPrice) ||
    toMoneyNumber(raw.price_range?.minVariantPrice) ||
    toMoneyNumber(variant?.price)
  );
}

function getCompareAtPrice(raw: ProductApiResponse): number | undefined {
  const variant = raw.variants?.[0];
  const compareAtPrice =
    toNumber(raw.compare_at_price) ||
    toNumber(raw.originalPrice) ||
    toMoneyNumber(variant?.compareAtPrice) ||
    toMoneyNumber(variant?.compare_at_price);

  return compareAtPrice > 0 ? compareAtPrice : undefined;
}

function getVariantCompareAtPrice(raw: ProductVariantApiResponse): number | undefined {
  const compareAtPrice = toMoneyNumber(raw.compareAtPrice) || toMoneyNumber(raw.compare_at_price);

  return compareAtPrice > 0 ? compareAtPrice : undefined;
}

function metafieldsToMap(
  metafields: ProductMetafieldApiResponse[] | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const field of metafields ?? []) {
    const key = field.key?.trim().toLowerCase();

    if (key && field.value?.trim()) {
      map[key] = field.value.trim();
    }
  }

  return map;
}

function getMetafieldValue(map: Record<string, string>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = map[key.toLowerCase()];

    if (value) {
      return value;
    }
  }

  return undefined;
}

/**
 * Maps each gold-detail field to the metafield keys it may arrive under.
 * Centralised here so the accepted keys can be reviewed/adjusted in one place
 * as the backend metafield contract is confirmed.
 */
const GOLD_DETAIL_METAFIELD_KEYS = {
  metalType: ['metal_type', 'type', 'metal'],
  purity: ['purity', 'gold_purity'],
  colour: ['colour', 'color', 'metal_colour', 'metal_color'],
  netWeight: ['net_weight', 'net_weight_grams', 'gold_weight'],
  diamondShape: ['diamond_shape', 'shape'],
  diamondClarity: ['diamond_clarity', 'clarity'],
  diamondCount: ['no_of_diamond', 'no_of_diamonds', 'number_of_diamonds'],
  diamondWeight: ['diamond_weight', 'weight'],
  width: ['width'],
  height: ['height'],
  grossWeight: ['gross_weight'],
} satisfies Record<keyof GoldVariantDetails, string[]>;

function parseVariantGoldDetails(
  metafields: ProductMetafieldApiResponse[] | undefined,
): GoldVariantDetails | undefined {
  const map = metafieldsToMap(metafields);

  const details = Object.fromEntries(
    Object.entries(GOLD_DETAIL_METAFIELD_KEYS).map(([field, keys]) => [
      field,
      getMetafieldValue(map, ...keys),
    ]),
  ) as GoldVariantDetails;

  const hasDetails = Object.values(details).some(Boolean);

  return hasDetails ? details : undefined;
}

function transformVariant(raw: ProductVariantApiResponse): ProductVariant {
  const quantityAvailable = raw.quantityAvailable ?? raw.quantity_available;
  const availableForSale = raw.availableForSale ?? raw.available_for_sale ?? true;
  const sku = typeof raw.sku === 'string' && raw.sku.trim() ? raw.sku.trim() : undefined;
  const compareAtPrice = getVariantCompareAtPrice(raw);
  const image = raw.image?.url ?? undefined;
  const goldDetails = parseVariantGoldDetails(raw.metafields);

  return {
    id: normaliseShopifyId(raw.id ?? raw.sku ?? ''),
    title: raw.title ?? '',
    ...(sku ? { sku } : {}),
    price: toMoneyNumber(raw.price),
    ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
    availableForSale,
    // Omit null/non-numeric inventory — untracked stock must not look like qty 0.
    ...(typeof quantityAvailable === 'number' ? { quantityAvailable } : {}),
    selectedOptions: (raw.selectedOptions ?? []).map((option) => ({
      name: option.name ?? 'Option',
      value: option.value ?? '',
    })),
    ...(image ? { image } : {}),
    ...(goldDetails ? { goldDetails } : {}),
  };
}

function transformVariants(raw: ProductApiResponse): ProductVariant[] {
  return (raw.variants ?? []).map(transformVariant);
}

function getProductBadgeLabel(raw: ProductApiResponse): string | undefined {
  const badgeLabel = raw.badgeLabel ?? raw.badge_label ?? raw.productBadge ?? raw.product_badge;

  if (badgeLabel?.trim()) {
    return badgeLabel.trim();
  }

  const bannerText = raw.banner?.text ?? raw.banner?.label;

  return bannerText?.trim() || undefined;
}

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

function toTextList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (isRecord(item)) {
          return (
            toText(item.label) ?? toText(item.name) ?? toText(item.title) ?? toText(item.value)
          );
        }

        return toText(item);
      })
      .filter((item): item is string => Boolean(item));
  }

  if (isRecord(value)) {
    const text =
      toText(value.label) ?? toText(value.name) ?? toText(value.title) ?? toText(value.value);

    return text ? [text] : [];
  }

  const text = toText(value);

  return text
    ? text
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function getFilterTagSource(raw: ProductApiResponse): unknown {
  if (raw.tags) {
    return raw.tags;
  }

  const productTags = raw.product_tags;

  if (Array.isArray(productTags) && productTags.every((tag) => typeof tag === 'string')) {
    return productTags;
  }

  if (typeof productTags === 'string') {
    return productTags;
  }

  return undefined;
}

function getProductTags(raw: ProductApiResponse): ProductTag[] | undefined {
  const tags = raw.product_tags;

  if (!Array.isArray(tags)) {
    return undefined;
  }

  const structured = tags.filter(
    (tag): tag is ProductTagApiResponse & { name: string; value: string } =>
      typeof tag === 'object' &&
      tag !== null &&
      'name' in tag &&
      'value' in tag &&
      Boolean(tag.name && tag.value),
  );

  if (structured.length === 0) {
    return undefined;
  }

  return structured.map((tag) => ({ name: tag.name, value: tag.value }));
}

function slugifyFilterId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getProductListOffers(
  list: ProductListApiResponse,
  rawItems: ProductApiResponse[],
): string[] | undefined {
  const offers = dedupeStrings([
    ...toTextList(list.offers),
    ...toTextList(list.promotions),
    ...toTextList(list.offer_labels),
    ...toTextList(list.collection_offers),
    ...rawItems.flatMap((item) => [
      ...toTextList(item.discounts),
      ...toTextList(item.offers),
      ...toTextList(item.discount_info),
    ]),
  ]);

  return offers.length > 0 ? offers : undefined;
}

const VARIANT_COLOR_OPTION_NAMES = new Set(['color', 'colour', 'metal', 'material', 'finish']);

function isVariantSizeLabel(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return true;
  }

  const normalized = trimmed.toLowerCase();

  return ['xs', 's', 'm', 'l', 'xl', 'xxl', 'small', 'medium', 'large', 'free size'].includes(
    normalized,
  );
}

function addRecognizedColorLabel(colors: string[], value: string | null | undefined): void {
  const text = toText(value);

  if (!text || isVariantSizeLabel(text) || !isProductChipColor(text)) {
    return;
  }

  colors.push(text);
}

function getProductColorsFromRaw(raw: ProductApiResponse): string[] {
  const colors = [...toTextList(raw.color), ...toTextList(raw.colors)];

  raw.variants?.forEach((variant) => {
    colors.push(...toTextList(variant.color));

    addRecognizedColorLabel(colors, variant.name);
    addRecognizedColorLabel(colors, variant.title);

    variant.selectedOptions?.forEach((option) => {
      const optionName = toText(option.name)?.toLowerCase();

      if (optionName && VARIANT_COLOR_OPTION_NAMES.has(optionName)) {
        addRecognizedColorLabel(colors, option.value);
      }
    });
  });

  if (isRecord(raw.options) && 'color' in raw.options) {
    colors.push(...toTextList(raw.options.color));
  }

  return dedupeStrings(colors);
}

function getProductReviewSummary(raw: ProductApiResponse): {
  avgRating?: number;
  reviewCount?: number;
} {
  const avgRating =
    toNumber(raw.reviews?.avg_rating ?? raw.reviews?.avgRating) || toNumber(raw.rating);
  const reviewCount = toNumber(raw.reviews?.review_count ?? raw.reviews?.reviewCount);

  if (avgRating <= 0 || reviewCount <= 0) {
    return {};
  }

  return { avgRating, reviewCount };
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

function normaliseFilterLabel(label: string): string {
  return label;
}

function normaliseFilterOption(raw: unknown, fallbackId?: string): ProductFilterOption | undefined {
  if (isRecord(raw)) {
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

    const value = toText(raw.value) ?? toText(raw.id) ?? label;
    const id = toText(raw.id) ?? toText(raw.slug) ?? slugifyFilterId(value);

    return { id, label, value };
  }

  const label = toText(raw) ?? fallbackId;

  if (!label) {
    return undefined;
  }

  return { id: slugifyFilterId(label), label, value: label };
}

function normaliseFilterOptions(raw: unknown): ProductFilterOption[] {
  if (Array.isArray(raw)) {
    return dedupeOptions(
      raw.flatMap((item) => {
        const option = normaliseFilterOption(item);

        return option ? [option] : [];
      }),
    );
  }

  if (isRecord(raw)) {
    return dedupeOptions(
      Object.entries(raw).flatMap(([key, value]) => {
        const option = normaliseFilterOption(value, key);

        return option ? [option] : [];
      }),
    );
  }

  return [];
}

function normaliseFilterGroup(raw: unknown, fallbackId?: string): ProductFilterGroup | undefined {
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
  const options = normaliseFilterOptions(raw.options ?? raw.values ?? raw.items ?? raw.buckets);

  if (options.length === 0) {
    return undefined;
  }

  return { id, label: normaliseFilterLabel(label), options };
}

function normaliseFilterGroups(raw: unknown): ProductFilterGroup[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => {
      const group = normaliseFilterGroup(item);

      return group ? [group] : [];
    });
  }

  if (isRecord(raw)) {
    return Object.entries(raw).flatMap(([key, value]) => {
      const group = normaliseFilterGroup(value, key);

      if (group) {
        return [group];
      }

      const options = normaliseFilterOptions(value);

      return options.length > 0
        ? [{ id: slugifyFilterId(key), label: normaliseFilterLabel(key), options }]
        : [];
    });
  }

  return [];
}

function getProductFilterGroups(
  raw: ProductListApiResponse,
  products: Product[],
): ProductFilterGroup[] {
  const prices = products.map((product) => product.price).filter((price) => price > 0);
  const productPriceMin = prices.length > 0 ? Math.min(...prices) : undefined;
  const availableFilters = transformAvailableProductFilters(
    (raw.available_filters ??
      raw.availableFilters ??
      raw.filterGroups ??
      raw.filter_groups ??
      raw.filters ??
      raw.facets) as CollectionProductListApiResponse['available_filters'],
    productPriceMin,
    resolveListingPriceBucketSet(products, raw.collection_handle),
  );

  if (availableFilters.length > 0) {
    return availableFilters;
  }

  return normaliseFilterGroups(
    raw.filterGroups ??
      raw.filter_groups ??
      raw.availableFilters ??
      raw.available_filters ??
      raw.filters ??
      raw.facets,
  );
}

function addFilterAttribute(
  attributes: Record<string, string[]>,
  key: string,
  values: string[],
): void {
  const nextValues = dedupeStrings([...(attributes[key] ?? []), ...values]);

  if (nextValues.length > 0) {
    attributes[key] = nextValues;
  }
}

function getProductFilterAttributes(raw: ProductApiResponse): Record<string, string[]> | undefined {
  const attributes: Record<string, string[]> = {};

  addFilterAttribute(
    attributes,
    'category',
    toTextList(raw.category ?? raw.product_category ?? raw.productType ?? raw.product_type),
  );
  addFilterAttribute(attributes, 'product_type', toTextList(raw.productType ?? raw.product_type));
  addFilterAttribute(attributes, 'color', toTextList(raw.color ?? raw.colors));
  addFilterAttribute(attributes, 'tags', toTextList(getFilterTagSource(raw)));

  [raw.filters, raw.attributes, raw.options].forEach((source) => {
    if (!isRecord(source)) {
      return;
    }

    Object.entries(source).forEach(([key, value]) => {
      addFilterAttribute(attributes, slugifyFilterId(key), toTextList(value));
    });
  });

  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

function readListCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  return undefined;
}

function unwrapProductList(
  raw: ProductListApiResponse | ProductListEnvelopeApiResponse,
): ProductListApiResponse {
  const envelope = isRecord(raw) ? raw : undefined;
  const data = envelope && 'data' in envelope && isRecord(envelope.data) ? envelope.data : envelope;

  if (!data) {
    return raw as ProductListApiResponse;
  }

  const pagination = isRecord(data.pagination) ? data.pagination : undefined;
  const total =
    readListCount(data.total) ??
    readListCount(pagination?.total) ??
    (envelope && envelope !== data ? readListCount(envelope.total) : undefined);

  return {
    ...(data as ProductListApiResponse),
    ...(total !== undefined ? { total } : {}),
  };
}

/**
 * Resolves catalog size from `total`. Page `count` is only used when this is the last page.
 *
 * @param list - Unwrapped product list payload.
 * @param itemCount - Number of products on this page.
 * @returns Catalog total for pagination and search result copy.
 */
function resolveProductListTotal(list: ProductListApiResponse, itemCount: number): number {
  const catalogTotal = readListCount(list.total);

  if (catalogTotal !== undefined) {
    return catalogTotal;
  }

  if (list.has_next === false) {
    return readListCount(list.count) ?? itemCount;
  }

  return itemCount;
}

function unwrapProductDetail(
  raw: ProductDetailApiResponse | ProductDetailEnvelopeApiResponse,
): ProductDetailApiResponse {
  return 'data' in raw ? raw.data : raw;
}

function normalizeProductCategory(value: string | null | undefined): ProductCategory {
  const normalized = value?.trim().toLowerCase() ?? '';

  if (normalized === PRODUCT_CATEGORY.GOLD) {
    return PRODUCT_CATEGORY.GOLD;
  }

  if (normalized.startsWith(PRODUCT_CATEGORY.PLATINUM)) {
    return PRODUCT_CATEGORY.PLATINUM;
  }

  return PRODUCT_CATEGORY.DEMIFINE;
}

function getQuantityOrdered30Days(raw: ProductApiResponse): number | undefined {
  const quantity = toNumber(raw.quantity_ordered_30_days);

  return quantity > 0 ? quantity : undefined;
}

/**
 * Standardize the shopper-facing SKU label in API-provided specification copy.
 *
 * @param specifications - Raw product specification text or HTML.
 * @returns Specification copy with a consistently uppercase SKU label.
 */
function normalizeSpecificationCopy(specifications: string | null | undefined): string | undefined {
  return specifications?.replace(/\bsku\s*:/gi, 'SKU:');
}

function buildProductFromApi(raw: ProductApiResponse): Product {
  const id = normaliseShopifyId(raw.product_id ?? raw.id ?? raw.handle ?? '');
  const handle = raw.handle ?? id;
  const images = getProductImages(raw);
  const { avgRating, reviewCount } = getProductReviewSummary(raw);
  const colors = getProductColorsFromRaw(raw);
  const usps = resolveProductUsps(raw.usps, [...(getProductTags(raw) ?? []), raw.tags]);

  return {
    id,
    handle,
    name: raw.name ?? raw.title ?? 'Untitled product',
    description: raw.description ?? raw.description_html ?? '',
    price: getProductPrice(raw),
    compareAtPrice: getCompareAtPrice(raw),
    image: images[0] ?? '',
    images,
    category: raw.category ?? raw.product_category ?? raw.productType ?? raw.product_type ?? '',
    productCategory: normalizeProductCategory(raw.product_category),
    badgeLabel: getProductBadgeLabel(raw),
    colors: colors.length > 0 ? colors : undefined,
    avgRating,
    reviewCount,
    createdAt: raw.createdAt ?? raw.created_at ?? raw.publishedAt ?? raw.published_at ?? undefined,
    filterAttributes: getProductFilterAttributes(raw),
    offers: transformOffers(raw),
    specifications: normalizeSpecificationCopy(raw.specifications),
    supplierInfo: raw.supplier_info ?? undefined,
    returnInfo: raw.return_info ?? undefined,
    productTags: getProductTags(raw),
    ...(usps.length > 0 ? { usps } : {}),
    quantityOrdered30Days: getQuantityOrdered30Days(raw),
    availableForSale: raw.availableForSale ?? raw.available_for_sale,
    variants: transformVariants(raw),
    // PDP/PLP cart badge from product API enrichment (`is_in_cart`, `quantity`).
    cart: raw.cart
      ? {
          isInCart: Boolean(raw.cart.is_in_cart),
          quantity: Number(raw.cart.quantity ?? 0),
        }
      : undefined,
  };
}

/** @deprecated Use transformProductDetail for product detail responses. */
export function transformProduct(
  raw: ProductApiResponse | ProductDetailApiResponse | ProductDetailEnvelopeApiResponse,
): Product {
  if ('data' in raw) {
    return transformProductDetail(raw);
  }

  if ('product' in raw) {
    return transformProductDetail(raw);
  }

  return buildProductFromApi(raw);
}

export function transformProductDetail(
  raw: ProductDetailApiResponse | ProductDetailEnvelopeApiResponse,
): Product {
  const detail = unwrapProductDetail(raw);
  const productWithVariants: ProductApiResponse = {
    ...detail.product,
    variants: detail.variants ?? detail.product.variants,
  };
  const product = buildProductFromApi(productWithVariants);
  const offers = transformOffers(detail.product, [detail.discount_info]);

  return {
    ...product,
    offers,
    variants: transformVariants(productWithVariants),
    reviews: detail.reviews ? transformReviews(detail.reviews) : undefined,
  };
}

export function transformProductList(
  raw: ProductListApiResponse | ProductListEnvelopeApiResponse,
): ProductListResponse {
  const list = unwrapProductList(raw);
  const items = list.items ?? list.products ?? list.recommendations ?? [];
  const transformedItems = items.map(buildProductFromApi);
  const itemCount = transformedItems.length;
  const total = resolveProductListTotal(list, itemCount);
  const pageSize = list.page_size ?? itemCount;
  const filterGroups = getProductFilterGroups(list, transformedItems);
  const offers = getProductListOffers(list, items);
  const collectionMeta = transformCollectionListMeta(list);

  return {
    items: transformedItems,
    filterGroups,
    offers,
    collectionMeta,
    total,
    page: list.page ?? 1,
    totalPages: list.total_pages ?? (pageSize > 0 ? Math.ceil(total / pageSize) : 1),
    hasNext: list.has_next,
    nextCursor: list.next_cursor ?? undefined,
  };
}

/**
 * Copy category-wide demifine offers onto listing cards that the list API left empty.
 *
 * Gold rows keep their own `discounts`. Demifine collection payloads send `discounts: []`
 * even when the matching PDP has `offers` / `discount_info`.
 *
 * @param list - Transformed collection products page.
 * @param fallbackOffers - Offers from one demifine product detail in the same listing.
 * @returns Listing with empty demifine cards filled, and offer pill labels merged.
 */
export function applyListingOfferFallback(
  list: ProductListResponse,
  fallbackOffers: ProductOffer[],
): ProductListResponse {
  if (fallbackOffers.length === 0) {
    return list;
  }

  let applied = false;
  const items = list.items.map((product) => {
    if (product.offers.length > 0 || product.productCategory !== PRODUCT_CATEGORY.DEMIFINE) {
      return product;
    }

    applied = true;
    return { ...product, offers: fallbackOffers };
  });

  if (!applied) {
    return list;
  }

  const labels = dedupeStrings([
    ...(list.offers ?? []),
    ...fallbackOffers.map((offer) => offer.name),
  ]);

  return {
    ...list,
    items,
    offers: labels.length > 0 ? labels : list.offers,
  };
}

function unwrapProductBundles(
  raw: ProductBundlesApiResponse | ProductBundlesEnvelopeApiResponse,
): ProductBundlesApiResponse {
  if ('data' in raw && raw.data && typeof raw.data === 'object' && 'bundles' in raw.data) {
    return raw.data;
  }

  return raw;
}

function transformProductBundle(raw: ProductBundleApiItem): ProductBundle | null {
  const products = (raw.products ?? []).map(buildProductFromApi);
  if (products.length === 0) {
    return null;
  }

  return {
    key: raw.key,
    title: getProductBundleTitle(raw.key, raw.title),
    products,
  };
}

/**
 * Map the product bundles payload into non-empty PDP rails.
 *
 * @param raw - Bare or enveloped `/bundles` response.
 * @returns Rails that have at least one product, in API order.
 */
export function transformProductBundles(
  raw: ProductBundlesApiResponse | ProductBundlesEnvelopeApiResponse,
): ProductBundle[] {
  const payload = unwrapProductBundles(raw);
  const bundles = Array.isArray(payload.bundles) ? payload.bundles : [];

  return bundles
    .map(transformProductBundle)
    .filter((bundle): bundle is ProductBundle => bundle !== null);
}
