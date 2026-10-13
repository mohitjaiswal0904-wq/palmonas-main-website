import { NamedHorizontalScrollTrack } from '@/components/analytics/NamedHorizontalScrollTrack';
import { ProductCard } from '@/components/product/ProductCard';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { Product } from '@/types/product';

interface ProductCarouselProps {
  products: Product[];
  className?: string;
  /** Classes on the inner track (e.g. equal horizontal inset for PDP). */
  listClassName?: string;
  /** Override per-item width / snap classes (e.g. PDP similar products). */
  itemClassName?: string;
  ariaLabel?: string;
  /** When false, product cards hide offer / limited-stock / new-arrivals promo. */
  showOfferPromo?: boolean;
  /** Smaller offer/promo type for narrow carousel cards (e.g. cart recommended). */
  compactOfferPromo?: boolean;
}

/**
 * Horizontal product card rail used across PLP-style marketing surfaces.
 */
export function ProductCarousel({
  products,
  className,
  listClassName,
  itemClassName,
  ariaLabel = 'Products',
  showOfferPromo = true,
  compactOfferPromo = false,
}: ProductCarouselProps) {
  if (products.length === 0) {
    return <p className="mt-4 text-stone-600">No products found.</p>;
  }

  return (
    <NamedHorizontalScrollTrack
      eventName={analyticsCanonicalEvents.carouselScrolled}
      sectionName="product_carousel"
      className={cn(
        '@container/product-carousel mt-4 w-full max-w-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-visible scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        HORIZONTAL_SCROLL_PASS_VERTICAL,
        className,
      )}
      role="region"
      ariaLabel={ariaLabel}
      tabIndex={0}
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
              // Card declares per-breakpoint viewport widths; override each so it fills the slot.
              className="tab:w-full laptop:w-full h-full w-full"
              showOfferPromo={showOfferPromo}
              compactOfferPromo={compactOfferPromo}
            />
          </li>
        ))}
      </ul>
    </NamedHorizontalScrollTrack>
  );
}
