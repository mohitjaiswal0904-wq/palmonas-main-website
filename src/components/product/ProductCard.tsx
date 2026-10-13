'use client';

import { AppLink } from '@/components/navigation/AppLink';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { OutOfStockCardButton } from '@/components/product/OutOfStockCardButton';
import { PriceBlock } from '@/components/product/PriceBlock';
import { ProductCardMedia } from '@/components/product/ProductCardMedia';
import { productTheme } from '@/config/product/product.config';
import { wishlistMessages } from '@/config/wishlist';
import { cn } from '@/lib/utils/cn';
import { shouldShowNewArrivalsFallback } from '@/lib/utils/offer';
import { isListingProductInStock } from '@/lib/utils/variant-options';
import { PRODUCT_CATEGORY, type Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Parent collection handle when the card is rendered inside a collection listing or CMS section. */
  collectionHandle?: string;
  /** When false, hide offer / limited-stock / new-arrivals promo under the price. */
  showOfferPromo?: boolean;
  /** Smaller offer/promo type for narrow cards (e.g. cart recommended carousel). */
  compactOfferPromo?: boolean;
}

export function ProductCard({
  product,
  className,
  collectionHandle,
  showOfferPromo = true,
  compactOfferPromo = false,
}: ProductCardProps) {
  const productHref = `/products/${product.handle}`;
  const isNewArrival = shouldShowNewArrivalsFallback(product, collectionHandle);
  const inStock = isListingProductInStock(product);
  const isPlatinum = product.productCategory === PRODUCT_CATEGORY.PLATINUM;

  return (
    <article
      className={cn(
        'tab:gap-3 relative flex h-full cursor-pointer flex-col gap-0 overflow-hidden border border-[#0000001A]',
        'laptop:w-[19vw] tab:w-[25vw] w-[49.9vw] bg-white pb-3',
        className,
      )}
      data-testid="product-card"
      data-product-card
      data-product-handle={product.handle}
      data-out-of-stock={inStock ? undefined : 'true'}
    >
      <AppLink
        href={productHref}
        data-product-card-link
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
        prefetch={false}
      />
      <ProductCardMedia product={product} />
      <div className="tab:mt-2 mt-1 flex w-full flex-1">
        <div className={cn(productTheme.cardOfferCycle.infoStackClass, isPlatinum && 'gap-3')}>
          <div
            className={cn(
              productTheme.cardOfferCycle.infoGridClass,
              isPlatinum ? 'items-start gap-y-2' : 'tab:items-center',
            )}
          >
            <PriceBlock
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              offers={product.offers}
              variant="card"
              isNewArrival={isNewArrival}
              showOfferPromo={showOfferPromo && inStock && !isPlatinum}
              compactOfferPromo={compactOfferPromo}
              disabled={!inStock}
              statusLabel={inStock ? undefined : wishlistMessages.labels.outOfStock}
              statusLabelClassName={productTheme.oosStatusClass}
              showPlatinumPlated={isPlatinum && inStock}
            />
            <div className={productTheme.cardOfferCycle.actionsClass}>
              {inStock ? (
                <AddToCartButton product={product} variant="card" />
              ) : (
                <OutOfStockCardButton />
              )}
            </div>
          </div>
          <p
            className={`${productTheme.typography.cardTextClass} mt-auto block w-full truncate pl-2 leading-normal text-[#1F1F1F] capitalize${
              inStock ? '' : 'opacity-50'
            }`}
          >
            {product.name}
          </p>
        </div>
      </div>
    </article>
  );
}
