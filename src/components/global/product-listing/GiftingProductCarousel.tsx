import type { UIEventHandler } from 'react';

import { ProductCard } from '@/components/product/ProductCard';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/product';

interface GiftingProductCarouselProps {
  'products': Product[];
  'className'?: string;
  'listClassName'?: string;
  'itemClassName'?: string;
  'ariaLabel'?: string;
  'showOfferPromo'?: boolean;
  'collectionHandle'?: string;
  /** Scroll handler for infinite load near the trailing edge. */
  'onScroll'?: UIEventHandler<HTMLDivElement>;
  'aria-busy'?: boolean;
}

/**
 * Gifting-only product rail — isolated from the shared `ProductCarousel`
 * so category-tab pagination / scroll-end loading cannot clash with PLP/CMS rails.
 */
export function GiftingProductCarousel({
  products,
  className,
  listClassName,
  itemClassName,
  ariaLabel = 'Gift products',
  showOfferPromo = true,
  collectionHandle,
  onScroll,
  'aria-busy': ariaBusy,
}: GiftingProductCarouselProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        '@container/product-carousel mt-4 w-full max-w-full touch-pan-x snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="region"
      aria-label={ariaLabel}
      aria-busy={ariaBusy}
      tabIndex={0}
      onScroll={onScroll}
    >
      <ul
        className={cn(
          'flex w-max items-stretch gap-0 border-t border-l border-[#0000001A] [&>li+li]:-ml-px',
          listClassName,
        )}
      >
        {products.map((product) => (
          <li
            key={product.id}
            className={cn(
              'flex shrink-0 snap-start',
              itemClassName ?? 'tab:w-[33.333vw] laptop:w-[20vw] w-[50vw]',
            )}
          >
            <ProductCard
              product={product}
              collectionHandle={collectionHandle}
              className="tab:w-full laptop:w-full h-full w-full"
              showOfferPromo={showOfferPromo}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
