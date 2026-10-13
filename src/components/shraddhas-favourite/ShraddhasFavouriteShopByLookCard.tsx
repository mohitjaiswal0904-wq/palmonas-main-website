'use client';

import Image from 'next/image';

import { AppLink } from '@/components/navigation/AppLink';
import { ShraddhasFavouriteShopByLookAddButton } from '@/components/shraddhas-favourite/ShraddhasFavouriteShopByLookAddButton';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/product';

interface ShraddhasFavouriteShopByLookCardProps {
  product: Product;
  className?: string;
}

/**
 * Shop-by-look card — product link wraps media only so Add to cart stays clickable.
 */
export function ShraddhasFavouriteShopByLookCard({
  product,
  className,
}: ShraddhasFavouriteShopByLookCardProps) {
  const productHref = `/products/${product.handle}`;

  return (
    <article
      className={cn(
        'relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#f8e4e9]',
        className,
      )}
    >
      <AppLink
        href={productHref}
        data-look-card-link
        className="tab:aspect-[4/5] relative block aspect-[5/7] w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#f8e4e9] to-[#f5dbe2]" />
        )}
      </AppLink>

      <div className="tab:px-4 tab:py-4 relative z-10 flex flex-col gap-3 bg-white px-3 py-3">
        <p className="font-nunito-sans tab:text-base line-clamp-2 text-sm leading-snug font-medium text-[#151515]">
          {product.name}
        </p>
        <ShraddhasFavouriteShopByLookAddButton product={product} />
      </div>
    </article>
  );
}
