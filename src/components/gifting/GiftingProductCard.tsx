import Image from 'next/image';
import Link from 'next/link';

import { BestsellerLightningBoltIcon } from '@/components/icons/BestsellerLightningBoltIcon';
import type { GiftingStaticProduct } from '@/config/gifting/gifting.config';
import { cn } from '@/lib/utils/cn';

interface GiftingProductCardProps {
  product: GiftingStaticProduct;
  className?: string;
}

/**
 * Static product card matching the gifting mock (no cart/wishlist mutations).
 */
export function GiftingProductCard({ product, className }: GiftingProductCardProps) {
  return (
    <article
      className={cn(
        'tab:w-[32%] laptop:w-[280px] relative flex w-[48%] shrink-0 flex-col overflow-hidden border border-[#0000001A] bg-white',
        className,
      )}
    >
      <Link
        href={product.href}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
      />

      <div className="relative aspect-square w-full bg-white">
        {product.isBestseller ? (
          <span className="absolute top-2 left-2 z-[2] inline-flex items-center gap-1 rounded-md bg-[#FFF4CC] px-1.5 py-0.5 text-[10px] font-medium text-[#151515]">
            <BestsellerLightningBoltIcon className="h-[11px] w-[11px]" />
            Bestseller
          </span>
        ) : null}

        <span
          className="absolute top-2 right-2 z-[2] inline-flex h-7 w-7 items-center justify-center rounded-full text-[#757575]"
          aria-hidden="true"
        >
          ♡
        </span>

        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 48vw, 280px"
        />
      </div>

      <div className="flex flex-col gap-1.5 px-2 pt-1 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D4AF37]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#C0C0C0]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8B4A0]" />
          </div>
          <p className="text-[10px] text-[#757575]">
            {product.rating} ★ | {product.reviewCount}
          </p>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-semibold text-[#151515]">{product.priceLabel}</span>
              {product.compareAtPriceLabel ? (
                <span className="text-xs text-[#9A9A9A] line-through">
                  {product.compareAtPriceLabel}
                </span>
              ) : null}
            </div>
            {product.offerLabel ? (
              <p className="mt-0.5 text-[11px] font-medium text-[#1F8A4C]">{product.offerLabel}</p>
            ) : null}
            <p className="mt-1 truncate text-xs text-[#1F1F1F]">{product.name}</p>
          </div>

          <span
            className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[#151515] text-lg leading-none text-[#151515]"
            aria-hidden="true"
          >
            +
          </span>
        </div>
      </div>
    </article>
  );
}
