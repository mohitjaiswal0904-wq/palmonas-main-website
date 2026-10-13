'use client';

import { useRef } from 'react';

import { ProductCard } from '@/components/product/ProductCard';
import { AppLink } from '@/components/ui/AppLink';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import {
  HORIZONTAL_SCROLL_MOUSE,
  HORIZONTAL_SCROLL_PASS_VERTICAL,
} from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/product';

interface CmsProductGridProps {
  products: Product[];
  columns?: number;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
  /** When `scroll`, products stay on one row with horizontal scroll at all breakpoints. */
  layout?: 'grid' | 'scroll';
  /** Parent collection handle used for New Arrivals promo fallback. */
  collectionHandle?: string;
  /** Extra classes on the scroll track, such as a gap between cards. */
  trackClassName?: string;
}

export function CmsProductGrid({
  products,
  columns = 4,
  viewAllHref,
  viewAllLabel = 'View all',
  className,
  layout = 'scroll',
  collectionHandle,
  trackClassName,
}: CmsProductGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollLayout = layout === 'scroll';
  useHorizontalMouseScroll(scrollRef, products.length > 0);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        ref={scrollRef}
        className={cn(
          isScrollLayout
            ? cn(
                'scrollbar-hide flex flex-nowrap justify-evenly gap-0 overflow-x-scroll',
                HORIZONTAL_SCROLL_PASS_VERTICAL,
                HORIZONTAL_SCROLL_MOUSE,
                trackClassName,
              )
            : cn(
                'scrollbar-hide flex gap-4 overflow-x-auto',
                HORIZONTAL_SCROLL_PASS_VERTICAL,
                HORIZONTAL_SCROLL_MOUSE,
                'laptop:grid laptop:overflow-visible',
              ),
        )}
        style={
          isScrollLayout ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        }
      >
        {products.map((product) => (
          <div key={product.id} className={cn('flex shrink-0', isScrollLayout ? '' : 'w-44')}>
            <ProductCard
              className="laptop:w-[19vw] tab:w-[25vw] h-full w-[47vw]"
              product={product}
              collectionHandle={collectionHandle}
            />
          </div>
        ))}
      </div>
      {viewAllHref ? (
        <div className="flex justify-center">
          <AppLink
            href={viewAllHref}
            className="tab:px-6 tab:py-1.5 tab:text-lg mt-2.5 mb-2 rounded-md border-2 border-[#D3C8CA] px-3 py-1 text-sm font-light"
          >
            {viewAllLabel}
          </AppLink>
        </div>
      ) : null}
    </div>
  );
}
