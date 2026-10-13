'use client';

import { AnalyticsPageContextSync } from '@/components/analytics/AnalyticsPageContextSync';
import type { Product } from '@/types/product';

interface ProductPageAnalyticsProps {
  product: Pick<Product, 'name' | 'handle'>;
}

/** Attaches product metadata to analytics events on PDP routes. */
export function ProductPageAnalytics({ product }: ProductPageAnalyticsProps) {
  return (
    <AnalyticsPageContextSync
      pageType="product"
      productName={product.name}
      productHandle={product.handle}
    />
  );
}
