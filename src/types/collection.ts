import { z } from 'zod';

import type { ApiResponse } from '@/types/api';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

export const CollectionSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageWidth: z.number().optional(),
  imageHeight: z.number().optional(),
  offers: z.array(z.string()).optional(),
});

export type Collection = z.infer<typeof CollectionSchema>;

export interface CollectionApiResponse {
  id?: string;
  collection_id?: string;
  handle: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  image?:
    | string
    | {
        url?: string | null;
        alt_text?: string | null;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null;
  offers?: string[] | string | null;
  promotions?: string[] | string | null;
  offer_labels?: string[] | string | null;
}

export type CollectionEnvelopeApiResponse = ApiResponse<CollectionApiResponse>;

export interface CollectionImageApiResponse {
  id?: string;
  url?: string | null;
  altText?: string | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Collection metadata returned alongside products on `/collections/:handle/products`. */
export interface CollectionListMeta {
  handle?: string;
  title?: string;
  type?: string;
  image?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
}

/**
 * Maps collection metadata from a collection products list API payload.
 *
 * @param raw - Raw list payload containing `collection_*` fields.
 * @returns Normalised collection list metadata when present.
 */
export function transformCollectionListMeta(raw: {
  collection_handle?: string;
  collection_title?: string;
  collection_type?: string;
  collection_image?: CollectionImageApiResponse | null;
}): CollectionListMeta | undefined {
  const imageRaw = raw.collection_image;
  const imageUrl = imageRaw?.url ?? undefined;

  if (!raw.collection_handle && !raw.collection_title && !imageUrl) {
    return undefined;
  }

  return {
    handle: raw.collection_handle,
    title: raw.collection_title,
    type: raw.collection_type,
    image: imageUrl
      ? {
          url: imageUrl,
          altText: imageRaw?.altText ?? imageRaw?.alt_text ?? undefined,
          width: imageRaw?.width ?? undefined,
          height: imageRaw?.height ?? undefined,
        }
      : undefined,
  };
}

/**
 * Prefers collection image/title from the products list API for collection page banners.
 *
 * @param collection - Collection from `/collections/:handle`.
 * @param meta - Collection metadata from `/collections/:handle/products`.
 * @returns Merged collection for collection page display.
 */
export function mergeCollectionWithListMeta(
  collection: Collection,
  meta: CollectionListMeta | undefined,
): Collection {
  if (!meta) {
    return collection;
  }

  return {
    ...collection,
    handle: meta.handle ?? collection.handle,
    title: meta.title ?? collection.title,
    image: meta.image?.url ?? collection.image,
    imageAlt: meta.image?.altText ?? meta.title ?? collection.imageAlt,
    imageWidth: meta.image?.width ?? collection.imageWidth,
    imageHeight: meta.image?.height ?? collection.imageHeight,
  };
}

export interface CollectionProductsParams {
  page?: number;
  cursor?: string;
  limit?: number;
  filters?: ProductFilters;
  filterGroups?: ProductFilterGroup[];
  sortBy?: ProductSortOption;
}

export function transformCollection(
  raw: CollectionApiResponse | CollectionEnvelopeApiResponse,
): Collection {
  const collection = 'data' in raw ? raw.data : raw;
  const image = typeof collection.image === 'string' ? collection.image : collection.image?.url;
  const imageAlt =
    typeof collection.image === 'string'
      ? undefined
      : (collection.image?.alt_text ?? collection.image?.altText ?? undefined);
  const offers = [
    ...(Array.isArray(collection.offers)
      ? collection.offers
      : collection.offers
        ? [collection.offers]
        : []),
    ...(Array.isArray(collection.promotions)
      ? collection.promotions
      : collection.promotions
        ? [collection.promotions]
        : []),
    ...(Array.isArray(collection.offer_labels)
      ? collection.offer_labels
      : collection.offer_labels
        ? [collection.offer_labels]
        : []),
  ]
    .map((offer) => offer.trim())
    .filter(Boolean);
  const uniqueOffers = Array.from(new Set(offers));

  return {
    id: collection.collection_id ?? collection.id ?? collection.handle,
    handle: collection.handle,
    title: collection.title,
    description: collection.description ?? undefined,
    image: collection.image_url ?? image ?? undefined,
    imageAlt,
    imageWidth:
      typeof collection.image === 'string' ? undefined : (collection.image?.width ?? undefined),
    imageHeight:
      typeof collection.image === 'string' ? undefined : (collection.image?.height ?? undefined),
    offers: uniqueOffers.length > 0 ? uniqueOffers : undefined,
  };
}
