import { ProductCarousel } from '@/components/global/product-listing';
import { productMessages, productTheme } from '@/config/product/product.config';
import type { Product } from '@/types/product';

interface RelatedProductsProps {
  products: Product[];
  /** When false, product cards hide offer / limited-stock / new-arrivals promo. */
  showOfferPromo?: boolean;
  /** Section heading. Defaults to Similar Products. */
  title?: string;
  /** Unique heading id so multiple rails can sit on one PDP. */
  headingId?: string;
  /** Accessible name for the product carousel. */
  ariaLabel?: string;
}

export function RelatedProducts({
  products,
  showOfferPromo = true,
  title = productMessages.similarProducts,
  headingId = 'similar-products-heading',
  ariaLabel = productMessages.a11y.similarProducts,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={productTheme.pdpRhythm.similarSectionClass} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="laptop:px-0 laptop:text-center laptop:text-[28px] laptop:leading-none px-4 text-base font-medium"
        style={{ color: productTheme.ink }}
      >
        {title}
      </h2>
      <ProductCarousel
        products={products}
        ariaLabel={ariaLabel}
        className={productTheme.pdpRhythm.similarCarouselClass}
        itemClassName="w-[48vw] max-w-[180px] min-w-[140px] shrink-0 snap-start laptop:w-[20vw] laptop:max-w-none laptop:min-w-0"
        showOfferPromo={showOfferPromo}
      />
    </section>
  );
}
