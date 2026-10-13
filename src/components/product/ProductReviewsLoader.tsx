'use client';

import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { productTokens } from '@/config/theme/product.tokens';
import { PRODUCT_REVIEWS_SECTION_ID } from '@/lib/product/scroll-to-product-reviews';

interface ProductReviewsLoaderProps {
  productId: string;
  productHandle: string;
}

/**
 * Client loader for PDP reviews — fetches after shell paint like related products.
 */
export function ProductReviewsLoader({ productId, productHandle }: ProductReviewsLoaderProps) {
  return (
    <div id={PRODUCT_REVIEWS_SECTION_ID} className={productTokens.reviews.sectionAnchorClass}>
      <ProductReviewsSection productId={productId} productHandle={productHandle} />
    </div>
  );
}
