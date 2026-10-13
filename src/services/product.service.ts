/**
 * Client-only — uses @/lib/api.
 * SSR pages: @/services/server/product.service.server
 */
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { retryOnceOnTransient } from '@/lib/query/retry';
import {
  transformProductBundles,
  transformProductDetail,
  transformProductList,
} from '@/services/product-transform';
import type {
  Product,
  ProductDetailEnvelopeApiResponse,
  ProductListParams,
  ProductListResponse,
  ProductListEnvelopeApiResponse,
} from '@/types/product';
import type { ProductBundle, ProductBundlesEnvelopeApiResponse } from '@/types/product/bundles';

function toProductListQuery(params: ProductListParams): Record<string, string | number> {
  return {
    ...(params.search && { query: params.search }),
    ...(params.category && { product_category: params.category }),
    ...(params.page && { page: params.page }),
    ...(params.cursor && { cursor: params.cursor }),
    ...(params.limit && { page_size: params.limit }),
  };
}

export async function getProductList(params: ProductListParams = {}): Promise<ProductListResponse> {
  try {
    const { data } = await api.get<ProductListEnvelopeApiResponse>(ENDPOINTS.products.list, {
      params: toProductListQuery(params),
    });
    return transformProductList(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    const { data } = await api.get<ProductDetailEnvelopeApiResponse>(ENDPOINTS.products.detail(id));
    return transformProductDetail(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export async function getProductByHandle(handle: string): Promise<Product> {
  try {
    return await retryOnceOnTransient(async () => {
      const { data } = await api.get<ProductDetailEnvelopeApiResponse>(
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
    const { data } = await api.get<ProductListEnvelopeApiResponse>(
      ENDPOINTS.products.recommendations(productId),
    );
    return transformProductList(data).items;
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Loads Complete Look / Shop the Look / Save with the Set rails for a PDP handle.
 *
 * @param handle - Product handle used in the bundles path.
 * @returns Non-empty bundle rails in API order.
 * @throws AppError when the request fails.
 */
export async function getProductBundles(handle: string): Promise<ProductBundle[]> {
  try {
    const { data } = await api.get<ProductBundlesEnvelopeApiResponse>(
      ENDPOINTS.products.bundles(handle),
    );
    return transformProductBundles(data);
  } catch (err) {
    throw normaliseError(err);
  }
}
