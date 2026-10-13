/**
 * Client-only — uses @/lib/api.
 * SSR pages: @/services/server/collection.service.server
 */
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { retryOnceOnTransient } from '@/lib/query/retry';
import { toCollectionProductQuery } from '@/lib/utils/collection-products-query';
import { hydrateListingOffers } from '@/services/hydrate-listing-offers';
import { transformProductDetail, transformProductList } from '@/services/product-transform';
import type { CollectionProductsParams } from '@/types/collection';
import type {
  ProductDetailEnvelopeApiResponse,
  ProductListEnvelopeApiResponse,
  ProductListResponse,
} from '@/types/product';

/**
 * Fetch one page of collection products from the browser.
 */
export async function getCollectionProducts(
  handle: string,
  params: CollectionProductsParams = {},
): Promise<ProductListResponse> {
  try {
    return await retryOnceOnTransient(async () => {
      const { data } = await api.get<ProductListEnvelopeApiResponse>(
        ENDPOINTS.collections.products(handle),
        { params: toCollectionProductQuery(params) },
      );

      return hydrateListingOffers(transformProductList(data), async (productId) => {
        const { data: detail } = await api.get<ProductDetailEnvelopeApiResponse>(
          ENDPOINTS.products.detail(productId),
        );
        return transformProductDetail(detail);
      });
    });
  } catch (err) {
    throw normaliseError(err);
  }
}
