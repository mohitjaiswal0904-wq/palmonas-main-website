'use client';

import { RelatedProducts } from '@/components/product/RelatedProducts';
import { useProductBundles } from '@/hooks/useProducts';

interface ProductBundlesLoaderProps {
  productHandle: string;
}

/**
 * Loads Complete Look / Shop the Look / Save with the Set after the PDP shell paints.
 */
export function ProductBundlesLoader({ productHandle }: ProductBundlesLoaderProps) {
  const { bundles, isLoading, error } = useProductBundles(productHandle);

  if (isLoading || error || !bundles?.length) {
    return null;
  }

  return (
    <>
      {bundles.map((bundle) => (
        <RelatedProducts
          key={bundle.key}
          products={bundle.products}
          title={bundle.title}
          headingId={`product-bundle-${bundle.key}`}
          ariaLabel={bundle.title}
        />
      ))}
    </>
  );
}
