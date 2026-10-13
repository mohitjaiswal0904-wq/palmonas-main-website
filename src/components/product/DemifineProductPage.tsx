'use client';

import { useCallback, useState } from 'react';

import { ProductBundlesLoader } from '@/components/product/ProductBundlesLoader';
import { ProductDetailLayout } from '@/components/product/ProductDetailLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductPurchaseAssurance } from '@/components/product/ProductPurchaseAssurance';
import { ProductRelatedProductsLoader } from '@/components/product/ProductRelatedProductsLoader';
import { ProductReviewsLoader } from '@/components/product/ProductReviewsLoader';
import { ProductShopByOffers } from '@/components/product/ProductShopByOffers';
import { StickyAddToCartBar } from '@/components/product/StickyAddToCartBar';
import { getDefaultVariant } from '@/lib/utils/variant-options';
import type { Product, ProductVariant } from '@/types/product';

interface DemifineProductPageProps {
  product: Product;
}

export function DemifineProductPage({ product }: DemifineProductPageProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => getDefaultVariant(product.variants)?.id,
  );

  const handleVariantChange = useCallback((variant: ProductVariant | undefined) => {
    setSelectedVariantId(variant?.id);
  }, []);

  return (
    <>
      <div className="tab:pb-24 pb-8">
        <ProductDetailLayout
          gallery={<ProductGallery product={product} />}
          info={<ProductInfo product={product} onVariantChange={handleVariantChange} />}
        />
        <ProductPurchaseAssurance />
        <ProductShopByOffers product={product} />
        <ProductRelatedProductsLoader productId={product.id} />
        <ProductBundlesLoader productHandle={product.handle} />
        <ProductReviewsLoader productId={product.id} productHandle={product.handle} />
      </div>
      <StickyAddToCartBar product={product} variantId={selectedVariantId} />
    </>
  );
}
