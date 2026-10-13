import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { cn } from '@/lib/utils/cn';

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
  return (
    <section
      className={cn(
        'tab:grid-cols-3 laptop:grid-cols-4 laptop:pb-0 grid grid-cols-2 border-t border-l border-[#0000001A] pb-20',
        className,
      )}
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`product-card-skeleton-${index}`} />
      ))}
    </section>
  );
}
