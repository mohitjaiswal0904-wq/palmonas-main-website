'use client';

import Image from 'next/image';

import { ProductCardBadge } from '@/components/product/ProductCardBadge';
import { ProductCardRating } from '@/components/product/ProductCardRating';
import { ProductColorSwatches } from '@/components/product/ProductColorSwatches';
import { WishlistButton } from '@/components/product/WishlistButton';
import { cn } from '@/lib/utils/cn';
import { hasProductCardColorSwatches } from '@/lib/utils/product-colors';
import { shouldShowProductRating } from '@/lib/utils/product-rating-visibility';
import type { Product } from '@/types/product';

interface ProductCardMediaProps {
  product: Product;
  /** Replaces the default wishlist heart when provided (e.g. wishlist page remove control). */
  overlayAction?: React.ReactNode;
}

export function ProductCardMedia({ product, overlayAction }: ProductCardMediaProps) {
  const hasRating =
    product.avgRating !== undefined &&
    product.reviewCount !== undefined &&
    shouldShowProductRating(product.avgRating);
  const hasColorSwatches = hasProductCardColorSwatches(product);

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-white">
      <div className="relative h-full">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-stone-50 to-stone-200" />
        )}
      </div>
      {product.badgeLabel ? <ProductCardBadge label={product.badgeLabel} /> : null}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        {overlayAction ?? (
          <WishlistButton
            productId={product.id}
            productName={product.name}
            variant="card"
            className="pointer-events-auto"
          />
        )}
      </div>
      {hasColorSwatches || hasRating ? (
        <div
          className={cn(
            'pointer-events-none absolute right-[6px] bottom-[7px] left-[6px] z-[5] flex items-center gap-2 overflow-visible',
            hasColorSwatches ? 'justify-between' : 'justify-end',
          )}
        >
          <ProductColorSwatches product={product} />
          {hasRating ? (
            <ProductCardRating
              avgRating={product.avgRating ?? 0}
              reviewCount={product.reviewCount ?? 0}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
