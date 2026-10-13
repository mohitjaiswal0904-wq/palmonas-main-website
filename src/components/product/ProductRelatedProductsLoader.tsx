'use client';

import { RelatedProducts } from '@/components/product/RelatedProducts';
import { useRelatedProducts } from '@/hooks/useProducts';

interface ProductRelatedProductsLoaderProps {
  productId: string;
}

/**
 * Loads similar products after the PDP shell paints so SSR is not blocked on recommendations.
 */
export function ProductRelatedProductsLoader({ productId }: ProductRelatedProductsLoaderProps) {
  const { products, isLoading, error } = useRelatedProducts(productId);

  if (isLoading || error || !products?.length) {
    return null;
  }

  return <RelatedProducts products={products} />;
}
