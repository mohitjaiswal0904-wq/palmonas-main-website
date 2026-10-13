'use client';

import { ProductCarousel } from '@/components/global/product-listing/ProductCarousel';
import { cartMessages, cartTheme, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { useCartRecommendedProducts } from '@/hooks/cart/useCartRecommendedProducts';
import { cn } from '@/lib/utils/cn';

/** Skeleton row while recommended products load. */
function CartRecommendedSkeleton() {
  return (
    <div
      className="flex flex-col gap-2"
      data-testid="cart-recommended-skeleton"
      aria-busy="true"
      aria-label={cartMessages.a11y.recommendedLoading}
    >
      <div className="h-3.5 w-40 animate-pulse rounded bg-[#f1f5f9]" />
      <div className="flex overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[220px] w-[calc(500%/11)] shrink-0 animate-pulse border border-black/10 bg-[#f1f5f9]"
          />
        ))}
      </div>
    </div>
  );
}

/** Cart upsell — configured product ids in a carousel below the coupon section. */
export function CartRecommendedSection() {
  const { products, isLoading, error } = useCartRecommendedProducts();

  if (!isCartFeatureEnabled('recommendedUpsell')) {
    return null;
  }

  if (isLoading) {
    return <CartRecommendedSkeleton />;
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <section
      className="flex flex-col gap-2"
      data-testid="cart-recommended-section"
      aria-label={cartMessages.a11y.recommendedSection}
    >
      <h3
        className={cn(cartTheme.orderSummaryTitleClass, 'tab:px-[5px] laptop:px-0 px-[10px]')}
        style={{ color: cartTheme.orderSummaryValue }}
      >
        {cartMessages.recommendedForYou}
      </h3>
      <ProductCarousel
        products={products}
        className="mt-0"
        // 500/11 = 2.2 cards visible; `cqw` measures the carousel column, not the viewport.
        itemClassName="w-[calc(500cqw/11)] tab:w-[calc(500cqw/9)]"
        ariaLabel={cartMessages.recommendedForYou}
        compactOfferPromo={true}
      />
    </section>
  );
}
