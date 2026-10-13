import { z } from 'zod';

import type { ApiResponse } from '@/types/api';
import type { CollectionImageApiResponse } from '@/types/collection';
import { GoldVariantDetailsSchema } from '@/types/gold-product-details';

/** Raw API shape — only used in the service layer. */
export interface MoneyApiResponse {
  amount?: string | number;
  currencyCode?: string;
  currency_code?: string;
}

interface PriceRangeApiResponse {
  minVariantPrice?: MoneyApiResponse;
  maxVariantPrice?: MoneyApiResponse;
}

interface ProductImageApiResponse {
  id?: string;
  url?: string | null;
  src?: string | null;
  alt_text?: string | null;
  altText?: string | null;
  width?: number;
  height?: number;
}

interface ProductVariantSelectedOptionApiResponse {
  name?: string | null;
  value?: string | null;
}

interface ProductVariantImageApiResponse {
  url?: string | null;
  altText?: string | null;
}

export interface ProductMetafieldApiResponse {
  namespace?: string;
  key?: string;
  value?: string;
  type?: string;
}

export interface ProductVariantApiResponse {
  id?: string;
  name?: string | null;
  title?: string;
  price?: number | string | MoneyApiResponse | null;
  compareAtPrice?: number | string | MoneyApiResponse | null;
  compare_at_price?: number | string | MoneyApiResponse | null;
  sku?: string | null;
  availableForSale?: boolean;
  available_for_sale?: boolean;
  quantityAvailable?: number | null;
  quantity_available?: number | null;
  color?: string[] | string | null;
  selectedOptions?: ProductVariantSelectedOptionApiResponse[];
  image?: ProductVariantImageApiResponse;
  metafields?: ProductMetafieldApiResponse[];
}

interface ProductOfferPlaceholderApiResponse {
  text?: string;
  style?: string;
}

export interface ProductOfferApiResponse {
  key?: string;
  name?: string;
  description?: string;
  code?: string;
  type?: string;
  discount_value?: number | null;
  payable_price?: number | null;
  payablePrice?: number | null;
  discount_category?: string;
  placeholder?: ProductOfferPlaceholderApiResponse[];
  freebie_image_url?: string | null;
  freebieImageUrl?: string | null;
  freebie_route?: string | null;
  freebieRoute?: string | null;
  collections?: ProductOfferCollectionApiResponse[];
}

export interface ProductOfferCollectionApiResponse {
  id?: string | null;
  title?: string | null;
  handle?: string | null;
  image?: string | null;
}

export interface ProductTagApiResponse {
  name?: string;
  value?: string;
}

export interface ProductReviewsApiResponse {
  avg_rating?: number | string | null;
  review_count?: number | string | null;
  avgRating?: number | string | null;
  reviewCount?: number | string | null;
}

interface ProductBannerApiResponse {
  text?: string | null;
  label?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  position?: string | null;
}

export interface ProductApiResponse {
  id?: string;
  product_id?: string;
  handle?: string;
  name?: string;
  title?: string;
  badgeLabel?: string | null;
  badge_label?: string | null;
  productBadge?: string | null;
  product_badge?: string | null;
  banner?: ProductBannerApiResponse | null;
  description?: string | null;
  description_html?: string | null;
  price?: number | string | null;
  originalPrice?: number | string | null;
  compare_at_price?: number | string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  image_urls?: string[];
  images?: ProductImageApiResponse[];
  category?: string | null;
  product_category?: string | null;
  product_type?: string | null;
  productType?: string | null;
  color?: string[] | string | null;
  colors?: string[] | string | null;
  tags?: string[] | string | null;
  product_tags?: ProductTagApiResponse[] | string[] | string | null;
  created_at?: string | null;
  createdAt?: string | null;
  published_at?: string | null;
  publishedAt?: string | null;
  filters?: Record<string, unknown> | null;
  attributes?: Record<string, unknown> | null;
  options?: Record<string, unknown> | null;
  price_range?: PriceRangeApiResponse;
  priceRange?: PriceRangeApiResponse;
  variants?: ProductVariantApiResponse[];
  offers?: ProductOfferApiResponse[];
  discounts?: ProductOfferApiResponse[] | string[] | string | null;
  discount_info?: ProductOfferApiResponse[];
  specifications?: string | null;
  supplier_info?: string | null;
  return_info?: string | null;
  vendor?: string | null;
  availableForSale?: boolean;
  available_for_sale?: boolean;
  rating?: number | string | null;
  reviews?: ProductReviewsApiResponse | null;
  cart?: { is_in_cart?: boolean; quantity?: number } | null;
  quantity_ordered_30_days?: number | string | null;
  usps?: string[] | null;
}

export interface ProductListApiResponse {
  items?: ProductApiResponse[];
  products?: ProductApiResponse[];
  recommendations?: ProductApiResponse[];
  filters?: unknown;
  filterGroups?: unknown;
  filter_groups?: unknown;
  availableFilters?: unknown;
  available_filters?: unknown;
  facets?: unknown;
  count?: number;
  total?: number;
  pagination?: {
    count?: number;
    total?: number;
    page?: number;
    page_size?: number;
    total_pages?: number;
  };
  page?: number;
  page_size?: number;
  total_pages?: number;
  has_next?: boolean;
  next_cursor?: string | null;
  has_previous?: boolean;
  previous_cursor?: string | null;
  sort_by?: string | null;
  offers?: unknown;
  promotions?: unknown;
  offer_labels?: unknown;
  collection_offers?: unknown;
  collection_handle?: string;
  collection_title?: string;
  collection_type?: string;
  collection_image?: CollectionImageApiResponse | null;
}

export interface ProductDetailApiResponse {
  product: ProductApiResponse;
  discount_info?: ProductOfferApiResponse[];
  reviews?: ProductReviewsApiResponse;
  variants?: ProductVariantApiResponse[];
  recommendations?: ProductApiResponse[];
}

export type ProductListEnvelopeApiResponse = ApiResponse<ProductListApiResponse> & {
  total?: number;
};
export type ProductDetailEnvelopeApiResponse = ApiResponse<ProductDetailApiResponse>;

export const ProductOfferPlaceholderSchema = z.object({
  text: z.string(),
  style: z.string(),
});

export type ProductOfferPlaceholder = z.infer<typeof ProductOfferPlaceholderSchema>;

export const ProductOfferCollectionSchema = z.object({
  id: z.string().nullable(),
  title: z.string().nullable(),
  handle: z.string(),
  image: z.string().nullable(),
});

export type ProductOfferCollection = z.infer<typeof ProductOfferCollectionSchema>;

export const ProductOfferSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  code: z.string(),
  type: z.enum(['FREEBIE', 'DISCOUNT']),
  discountValue: z.number().nullable().optional(),
  payablePrice: z.number().nullable().optional(),
  discountCategory: z.string().optional(),
  placeholder: z.array(ProductOfferPlaceholderSchema),
  freebieImageUrl: z.string().optional(),
  freebieRoute: z.string().optional(),
  collections: z.array(ProductOfferCollectionSchema).optional(),
});

export type ProductOffer = z.infer<typeof ProductOfferSchema>;

export const ProductReviewsSchema = z.object({
  avgRating: z.number(),
  reviewCount: z.number(),
});

export type ProductReviews = z.infer<typeof ProductReviewsSchema>;

export const ProductTagSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export type ProductTag = z.infer<typeof ProductTagSchema>;

export const ProductVariantOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export type ProductVariantOption = z.infer<typeof ProductVariantOptionSchema>;

export const ProductVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().optional(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  availableForSale: z.boolean(),
  quantityAvailable: z.number().optional(),
  selectedOptions: z.array(ProductVariantOptionSchema),
  image: z.string().optional(),
  goldDetails: GoldVariantDetailsSchema.optional(),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductOptionGroupSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
  type: z.enum(['color', 'size', 'text']),
});

export type ProductOptionGroup = z.infer<typeof ProductOptionGroupSchema>;

/** Canonical product-category values — use these instead of string literals. */
export const PRODUCT_CATEGORY = {
  DEMIFINE: 'demifine',
  GOLD: 'gold',
  PLATINUM: 'platinum',
} as const;

const PRODUCT_CATEGORY_VALUES = [
  PRODUCT_CATEGORY.DEMIFINE,
  PRODUCT_CATEGORY.GOLD,
  PRODUCT_CATEGORY.PLATINUM,
] as const;

export const ProductCategorySchema = z.enum(PRODUCT_CATEGORY_VALUES);

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

/** Demifine PDP USP keys from the product detail API. */
export const PRODUCT_USP_IDS = [
  'anti_tarnish',
  'skin_safe_jewellery',
  'platinum_plated',
  'gold_plated_14k',
  'sterling_silver_925',
  'gold_tone_plated',
  'adjustable_rings',
] as const;

export const ProductUspIdSchema = z.enum(PRODUCT_USP_IDS);

export type ProductUspId = z.infer<typeof ProductUspIdSchema>;

export const ProductCartStateSchema = z.object({
  isInCart: z.boolean(),
  quantity: z.number(),
});

export type ProductCartState = z.infer<typeof ProductCartStateSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  image: z.string(),
  images: z.array(z.string()),
  category: z.string(),
  productCategory: ProductCategorySchema,
  badgeLabel: z.string().optional(),
  colors: z.array(z.string()).optional(),
  avgRating: z.number().optional(),
  reviewCount: z.number().optional(),
  createdAt: z.string().optional(),
  filterAttributes: z.record(z.array(z.string())).optional(),
  offers: z.array(ProductOfferSchema),
  reviews: ProductReviewsSchema.optional(),
  specifications: z.string().optional(),
  supplierInfo: z.string().optional(),
  returnInfo: z.string().optional(),
  productTags: z.array(ProductTagSchema).optional(),
  /** Demifine trust USPs from the product detail API (`usps`). */
  usps: z.array(ProductUspIdSchema).optional(),
  /** Units sold in the last 30 days from the product detail API. */
  quantityOrdered30Days: z.number().optional(),
  /** Product-level availability from the detail API (may be false with empty variants). */
  availableForSale: z.boolean().optional(),
  variants: z.array(ProductVariantSchema),
  cart: ProductCartStateSchema.optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductListParamsSchema = z.object({
  category: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  cursor: z.string().optional(),
  search: z.string().optional(),
});

export type ProductListParams = z.infer<typeof ProductListParamsSchema>;

export const ProductListResponseSchema = z.object({
  items: z.array(ProductSchema),
  filterGroups: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        options: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            value: z.string().optional(),
          }),
        ),
      }),
    )
    .optional(),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean().optional(),
  nextCursor: z.string().optional(),
  offers: z.array(z.string()).optional(),
  collectionMeta: z
    .object({
      handle: z.string().optional(),
      title: z.string().optional(),
      type: z.string().optional(),
      image: z
        .object({
          url: z.string(),
          altText: z.string().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
