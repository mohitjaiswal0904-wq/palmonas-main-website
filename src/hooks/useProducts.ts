'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { productConfig } from '@/config/product/product.config';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getCollectionProducts } from '@/services/collection.service';
import {
  getProduct,
  getProductBundles,
  getProductByHandle,
  getProductList,
  getRelatedProducts,
} from '@/services/product.service';
import { extractNumericId } from '@/types/cart';
import type { Product, ProductListParams } from '@/types/product';
import type { ProductBundle } from '@/types/product/bundles';

const STALE_TIME = 1000 * 60 * 5;

export function useProductList(params: ProductListParams): {
  products: Product[] | undefined;
  total: number | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProductList(params),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    products: data?.items,
    total: data?.total,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useProduct(id: string): {
  product: Product;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useSuspenseQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    product: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useProductByHandle(handle: string): {
  product: Product | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.products.byHandle(handle),
    queryFn: () => getProductByHandle(handle),
    enabled: handle.length > 0,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    product: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

export function useRelatedProducts(productId: string | undefined): {
  products: Product[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.products.related(productId ?? ''),
    queryFn: () => getRelatedProducts(productId ?? ''),
    enabled: Boolean(productId),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    products: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

/**
 * Loads PDP bundle rails after paint so SSR is not blocked on `/bundles`.
 *
 * @param handle - Product handle for the bundles endpoint.
 * @returns Bundle rails plus query status.
 */
export function useProductBundles(handle: string | undefined): {
  bundles: ProductBundle[] | undefined;
  isLoading: boolean;
  error: AppError | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.products.bundles(handle ?? ''),
    queryFn: () => getProductBundles(handle ?? ''),
    enabled: Boolean(handle),
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  return {
    bundles: data,
    isLoading,
    error: isAppError(error) ? error : null,
  };
}

/**
 * Returns whether two product ids refer to the same catalog item.
 *
 * @param left - First product id (gid or numeric).
 * @param right - Second product id (gid or numeric).
 */
function isSameProductId(left: string, right: string): boolean {
  return left === right || extractNumericId(left) === extractNumericId(right);
}

/**
 * Loads products for the selected Shop By Offers collection tab.
 *
 * @param collectionHandle - Collection handle from the selected discount.
 * @param excludeProductId - Current PDP product, omitted from the rail.
 * @returns Collection products plus query status.
 */
export function useShopByOfferProducts(
  collectionHandle: string | undefined,
  excludeProductId: string | undefined,
): {
  products: Product[];
  isLoading: boolean;
  error: AppError | null;
} {
  const limit = productConfig.timing.shopByOffersLimit;
  const fetchLimit = excludeProductId ? limit + 1 : limit;
  const handle = collectionHandle?.trim() ?? '';

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.collections.products(handle, { page: 1, limit: fetchLimit }),
    queryFn: () => getCollectionProducts(handle, { page: 1, limit: fetchLimit }),
    enabled: handle.length > 0,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const products = useMemo(() => {
    const excludeId = excludeProductId?.trim();

    return (data?.items ?? [])
      .filter((product) => !excludeId || !isSameProductId(product.id, excludeId))
      .slice(0, limit);
  }, [data?.items, excludeProductId, limit]);

  return {
    products,
    isLoading: handle.length > 0 && isLoading,
    error: isAppError(error) ? error : null,
  };
}
