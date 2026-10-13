import 'server-only';

import { unstable_cache as cacheWithRevalidation } from 'next/cache';
import { cache } from 'react';

import { ENDPOINTS } from '@/lib/endpoints';
import { getApiBaseUrl } from '@/lib/env';
import { normaliseError } from '@/lib/errors';
import { isNextProductionRuntime } from '@/lib/is-next-production';
import { retryOnceOnTransient } from '@/lib/query/retry';
import { createPublicServerApi } from '@/lib/server-api';
import { toCollectionProductQuery } from '@/lib/utils/collection-products-query';
import { hydrateListingOffers } from '@/services/hydrate-listing-offers';
import { transformProductDetail, transformProductList } from '@/services/product-transform';
import type {
  Collection,
  CollectionEnvelopeApiResponse,
  CollectionProductsParams,
} from '@/types/collection';
import { transformCollection } from '@/types/collection';
import type {
  ProductDetailEnvelopeApiResponse,
  ProductListEnvelopeApiResponse,
  ProductListResponse,
} from '@/types/product';

const COLLECTION_REVALIDATE_SECONDS = 300;

/**
 * Collapse a product query into a stable cache-key fragment.
 * Param insertion order varies by call site, so sort — otherwise the same listing
 * gets two cache entries and neither ever warms.
 */
function serialiseProductQuery(query: Record<string, string | number>): string {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join('&');
}

async function fetchCollection(handle: string): Promise<Collection> {
  const client = createPublicServerApi();
  const { data } = await client.get<CollectionEnvelopeApiResponse>(
    ENDPOINTS.collections.byHandle(handle),
  );

  return transformCollection(data);
}

async function fetchCollectionProducts(
  handle: string,
  query: Record<string, string | number>,
): Promise<ProductListResponse> {
  const client = createPublicServerApi();
  const { data } = await client.get<ProductListEnvelopeApiResponse>(
    ENDPOINTS.collections.products(handle),
    { params: query },
  );

  return hydrateListingOffers(transformProductList(data), async (productId) => {
    const { data: detail } = await client.get<ProductDetailEnvelopeApiResponse>(
      ENDPOINTS.products.detail(productId),
    );
    return transformProductDetail(detail);
  });
}

/**
 * Fetch a Shopify collection by handle.
 *
 * Cookie-less so `generateMetadata` / Cache Components never call `cookies()`.
 * Deduped per-request so `generateMetadata` and the page body share one call, and
 * cached across requests in production so a warm handle costs no upstream round trip.
 *
 * @param handle - Collection handle from the route segment.
 * @returns The collection.
 * @throws {AppError} Normalised upstream failure (`NOT_FOUND` for unknown handles).
 */
export const getCollectionByHandle = cache(async (handle: string): Promise<Collection> => {
  try {
    if (!isNextProductionRuntime()) {
      return await fetchCollection(handle);
    }

    return await cacheWithRevalidation(
      async () => fetchCollection(handle),
      ['collection', handle, getApiBaseUrl()],
      {
        revalidate: COLLECTION_REVALIDATE_SECONDS,
        tags: [`collection-${handle}`, 'collection'],
      },
    )();
  } catch (err) {
    throw normaliseError(err);
  }
});

/**
 * Fetch one page of products for a collection handle.
 *
 * Cached across requests in production via the cookie-less client, so the shared entry
 * carries no per-user enrichment (`cart`, `in_wishlist`). The "in cart" badge is owned by
 * the client cart store anyway — `useProductCartState` ignores the API hint once the store
 * hydrates — so dropping it avoids serving one shopper's badges to another.
 *
 * @param handle - Collection handle.
 * @param params - Page, cursor, limit, sort, and filter selection.
 * @returns One transformed products page.
 * @throws {AppError} Normalised upstream failure.
 */
export async function getCollectionProducts(
  handle: string,
  params: CollectionProductsParams = {},
): Promise<ProductListResponse> {
  const query = toCollectionProductQuery(params);

  try {
    if (!isNextProductionRuntime()) {
      return await retryOnceOnTransient(() => fetchCollectionProducts(handle, query));
    }

    return await retryOnceOnTransient(() =>
      cacheWithRevalidation(
        async () => fetchCollectionProducts(handle, query),
        ['collection-products', handle, serialiseProductQuery(query), getApiBaseUrl()],
        {
          revalidate: COLLECTION_REVALIDATE_SECONDS,
          tags: [`collection-${handle}`, 'collection-products'],
        },
      )(),
    );
  } catch (err) {
    throw normaliseError(err);
  }
}
