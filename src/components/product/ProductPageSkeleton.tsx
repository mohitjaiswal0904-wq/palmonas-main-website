import { productTheme } from '@/config/product/product.config';
import { cn } from '@/lib/utils/cn';

/**
 * PDP-shaped placeholder while product route RSC loads or soft-nav is pending.
 */
export function ProductPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading product" data-testid="product-page-skeleton">
      <div className="laptop:grid-cols-[7fr_3fr] laptop:items-start laptop:gap-10 laptop:px-8 laptop:py-10 grid w-full grid-cols-1 gap-0">
        <div className="min-w-0">
          <div className="laptop:aspect-[4/5] aspect-[3/4] w-full animate-pulse bg-stone-100" />
          <div className="laptop:mt-4 laptop:grid laptop:grid-cols-4 mt-0 hidden gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`product-thumb-skeleton-${index}`}
                className="aspect-square animate-pulse rounded bg-stone-100"
              />
            ))}
          </div>
        </div>

        <div
          className={cn(productTheme.pdpRhythm.infoColumnClass, productTheme.pdpRhythm.stackClass)}
        >
          <div className={productTheme.pdpRhythm.clusterClass}>
            <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
            <div className="h-8 w-3/4 max-w-sm animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-32 animate-pulse rounded bg-stone-100" />
          </div>
          <div className={productTheme.pdpRhythm.promoClusterClass}>
            <div className="h-10 w-full max-w-xs animate-pulse rounded bg-stone-100" />
            <div className="h-12 w-full animate-pulse rounded bg-stone-200" />
          </div>
          <div className="h-12 w-full animate-pulse rounded bg-stone-200" />
          <div className={productTheme.pdpRhythm.clusterClass}>
            <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-stone-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </div>
    </main>
  );
}
