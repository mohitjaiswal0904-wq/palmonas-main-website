'use client';

import { AppLink } from '@/components/navigation/AppLink';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { OutOfStockCardButton } from '@/components/product/OutOfStockCardButton';
import { PriceBlock } from '@/components/product/PriceBlock';
import { ProductCardMedia } from '@/components/product/ProductCardMedia';
import { WishlistRemoveButton } from '@/components/wishlist/WishlistRemoveButton';
import { productTheme } from '@/config/product/product.config';
import { wishlistMessages } from '@/config/wishlist';
import { cn } from '@/lib/utils/cn';
import { isWishlistItemInStock } from '@/lib/utils/wishlist-stock';
import type { WishlistItem } from '@/types/wishlist';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemoveRequest: () => void;
  className?: string;
}

export function WishlistItemCard({ item, onRemoveRequest, className }: WishlistItemCardProps) {
  const { product } = item;
  const productHref = `/products/${product.handle}`;
  const inStock = isWishlistItemInStock(item);

  return (
    <article
      className={cn(
        'tab:gap-3 relative flex h-full flex-col gap-0 overflow-hidden border-r border-b border-[#0000001A] bg-white pb-3',
        className,
      )}
      data-testid="wishlist-item-card"
      data-out-of-stock={inStock ? undefined : 'true'}
    >
      <AppLink
        href={productHref}
        data-wishlist-card-link
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
      />
      <ProductCardMedia
        product={product}
        overlayAction={
          <WishlistRemoveButton productName={product.name} onRemoveRequest={onRemoveRequest} />
        }
      />
      <div className="tab:mt-2 relative z-[2] mt-1 flex w-full flex-1">
        <div className={productTheme.cardOfferCycle.infoStackClass}>
          <div className={cn(productTheme.cardOfferCycle.infoGridClass, 'tab:items-center')}>
            <PriceBlock
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              offers={product.offers}
              variant="card"
              showOfferPromo={inStock}
              disabled={!inStock}
              statusLabel={inStock ? undefined : wishlistMessages.labels.outOfStock}
              statusLabelClassName="text-[#C4554D]"
            />
            <div className={productTheme.cardOfferCycle.actionsClass}>
              {inStock ? (
                <AddToCartButton product={product} variant="card" variantId={item.variantId} />
              ) : (
                <OutOfStockCardButton />
              )}
            </div>
          </div>
          <p
            className={`text-xxs tab:text-xs mt-auto block w-full truncate pl-2 leading-normal text-[#1F1F1F] capitalize${
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
