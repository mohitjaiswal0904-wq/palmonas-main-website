import { Fragment, type ReactNode } from 'react';

import { ProductGridEmptyState } from '@/components/global/product-listing/ProductGridEmptyState';
import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  className?: string;
  loadMoreTriggerAfterIndex?: number;
  renderLoadMoreTrigger?: () => ReactNode;
  trailingContent?: ReactNode;
  /** Collection handle for New Arrivals promo fallback on product cards. */
  collectionHandle?: string;
}

export function ProductGrid({
  products,
  className,
  loadMoreTriggerAfterIndex,
  renderLoadMoreTrigger,
  trailingContent,
  collectionHandle,
}: ProductGridProps) {
  if (products.length === 0) {
    return <ProductGridEmptyState />;
  }

  return (
    <section
      className={cn(
        'laptop:pb-0 tab:mt-0 tab:gap-0 mt-4 flex flex-wrap items-stretch gap-0 border-0 border-[#0000001A] pb-20',
        className,
      )}
      aria-label="Products"
    >
      {products.map((product, index) => (
        <Fragment key={product.id}>
          <ProductCard product={product} className="" collectionHandle={collectionHandle} />
          {loadMoreTriggerAfterIndex === index ? renderLoadMoreTrigger?.() : null}
        </Fragment>
      ))}
      {trailingContent}
    </section>
  );
}
