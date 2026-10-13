import 'server-only';

import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { retryOnceOnTransient } from '@/lib/query/retry';
import { createServerApi } from '@/lib/server-api';
import { transformProductDetail, transformProductList } from '@/services/product-transform';
import type {
  Product,
  ProductDetailEnvelopeApiResponse,
  ProductListEnvelopeApiResponse,
  ProductListParams,
  ProductListResponse,
} from '@/types/product';

function toProductListQuery(params: ProductListParams): Record<string, string | number> {
  return {
    ...(params.search && { query: params.search }),
    ...(params.category && { product_category: params.category }),
    ...(params.page && { page: params.page }),
    ...(params.cursor && { cursor: params.cursor }),
    ...(params.limit && { page_size: params.limit }),
  };
}

export async function getProductList(params: ProductListParams): Promise<ProductListResponse> {
  try {
    const client = await createServerApi();
    const { data } = await client.get<ProductListEnvelopeApiResponse>(ENDPOINTS.products.list, {
      params: toProductListQuery(params),
    });
    return transformProductList(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    const client = await createServerApi();
    const { data } = await client.get<ProductDetailEnvelopeApiResponse>(
      ENDPOINTS.products.detail(id),
    );
    return transformProductDetail(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getProductByHandle(handle: string): Promise<Product> {
  try {
    return await retryOnceOnTransient(async () => {
      const client = await createServerApi();
      const { data } = await client.get<ProductDetailEnvelopeApiResponse>(
        ENDPOINTS.products.detailFromRouteParam(handle),
      );
      return transformProductDetail(data);
    });
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getRelatedProducts(productId: string): Promise<Product[]> {
  try {
    const client = await createServerApi();
    const { data } = await client.get<ProductListEnvelopeApiResponse>(
      ENDPOINTS.products.recommendations(productId),
    );
    return transformProductList(data).items;
  } catch (err) {
    throw normaliseError(err);
  }
}
