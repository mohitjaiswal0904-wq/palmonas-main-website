import { PriceBlock } from '@/components/product/PriceBlock';
import { ProductRating } from '@/components/product/ProductRating';
import { ProductTags } from '@/components/product/ProductTags';
import { ProductWishlistIcon } from '@/components/product/ProductWishlistIcon';
import { productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { PRODUCT_PDP_PRICE_ID } from '@/lib/product/pdp-header-price';
import { scrollToProductReviewsSection } from '@/lib/product/scroll-to-product-reviews';
import { cn } from '@/lib/utils/cn';
import { PRODUCT_CATEGORY, type Product } from '@/types/product';

interface ProductHeaderProps {
  product: Product;
  price?: number;
  compareAtPrice?: number;
  /** Optional making-charges pill (gold). */
  makingChargesLabel?: string | null;
  /** When false, the ships-in-24h pill is omitted so a parent can group it with trust chips. */
  showTags?: boolean;
}

export function ProductHeader({
  product,
  price,
  compareAtPrice,
  makingChargesLabel,
  showTags = true,
}: ProductHeaderProps) {
  const themeVariant = product.productCategory === PRODUCT_CATEGORY.GOLD ? 'gold' : 'demifine';

  return (
    <header className="min-w-0">
      <div className="laptop:gap-4 flex items-start justify-between gap-3">
        <div className="laptop:gap-3 flex min-w-0 flex-1 flex-col gap-2">
          <PriceBlock
            price={price ?? product.price}
            compareAtPrice={compareAtPrice ?? product.compareAtPrice}
            themeVariant={themeVariant}
            anchorId={PRODUCT_PDP_PRICE_ID}
          />
          {makingChargesLabel ? (
            <span
              className={cn(
                'inline-flex max-w-full shrink-0 items-center font-medium',
                productTheme.makingCharges.layoutClass,
                themeFonts.sans.className,
              )}
              style={{
                backgroundImage: productTheme.makingCharges.gradient,
                color: productTheme.ink,
              }}
            >
              {makingChargesLabel}
            </span>
          ) : null}
          <h1
            className={cn(
              productTheme.typography.pdpTitleClass,
              'leading-normal font-normal',
              themeFonts.sans.className,
            )}
            style={{ color: productTheme.titleMuted }}
          >
            {product.name}
          </h1>
          <ProductRating
            onReviewCountClick={scrollToProductReviewsSection}
            reviews={product?.reviews}
            avgRating={product?.reviews?.avgRating}
            reviewCount={product?.reviews?.reviewCount}
          />
        </div>
        <div className="mr-4 flex shrink-0 flex-col items-end gap-0.5">
          <ProductWishlistIcon productId={product.id} productName={product.name} />
        </div>
      </div>

      {showTags ? (
        <ProductTags
          tags={product.productTags}
          className="mt-3"
          variant={themeVariant === 'gold' ? 'sellingFast' : 'shipsIn24Hours'}
        />
      ) : null}
    </header>
  );
}
