'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { cartConfig, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { isAppError, type AppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { shouldRetryQuery } from '@/lib/query/retry';
import { getProduct } from '@/services/product.service';
import { useCartStore } from '@/store/cart/cart.store';
import { extractNumericId, type CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

const STALE_TIME = 1000 * 60 * 5;

/**
 * Returns whether any cart line matches the product id or one of its variants.
 *
 * @param product - Upsell product candidate.
 * @param cartItems - Current cart lines.
 */
function isProductInCart(product: Product, cartItems: CartItem[] | undefined): boolean {
  if (!cartItems?.length) {
    return false;
  }

  const productNumericId = extractNumericId(product.id);

  return cartItems.some((item) => {
    if (item.product.id === product.id || extractNumericId(item.product.id) === productNumericId) {
      return true;
    }

    return product.variants.some((variant) => {
      const variantNumericId = extractNumericId(variant.id);
      return (
        item.product.variantId === variant.id ||
        extractNumericId(item.product.variantId) === variantNumericId
      );
    });
  });
}

/**
 * Loads the configured cart upsell products by id.
 * Products already in the cart are excluded. A single missing product does not hide the rest.
 *
 * @returns Configured products that are not in the cart, plus loading/error state.
 */
export function useCartRecommendedProducts(): {
  products: Product[];
  isLoading: boolean;
  error: AppError | null;
} {
  const enabled = isCartFeatureEnabled('recommendedUpsell');
  const productIds = cartConfig.recommendedUpsell.productIds;
  const cartItems = useCartStore((state) => state.cart?.items);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.cart.recommended(productIds),
    queryFn: async () => {
      const results = await Promise.allSettled(productIds.map((id) => getProduct(id)));
      const products = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : [],
      );

      if (products.length === 0) {
        const firstRejected = results.find(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
        );
        if (firstRejected) {
          throw firstRejected.reason;
        }
      }

      return products;
    },
    enabled: enabled && productIds.length > 0,
    staleTime: STALE_TIME,
    retry: shouldRetryQuery,
  });

  const products = useMemo(() => {
    return (data ?? []).filter((product) => !isProductInCart(product, cartItems));
  }, [cartItems, data]);

  return {
    products,
    isLoading: enabled && isLoading,
    error: isAppError(error) ? error : null,
  };
}
