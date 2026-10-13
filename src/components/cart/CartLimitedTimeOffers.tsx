'use client';

import { PlusIcon } from '@/components/icons/PlusIcon';
import { ProductCardRating } from '@/components/product/ProductCardRating';
import {
  cartConfig,
  cartMessages,
  cartTheme,
  isCartFeatureEnabled,
} from '@/config/cart/cart.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';

interface LtoProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
  swatches?: string[];
}

function LtoProductCard({ product }: { product: LtoProduct }) {
  const swatches = product.swatches ?? [];
  const rating = product.rating ?? 4.5;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <div
      className="flex w-[126px] shrink-0 flex-col gap-3 border border-black/10 bg-white pb-3"
      data-testid="lto-product-card"
    >
      <div className="relative aspect-[126/168] w-full overflow-hidden bg-white">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-x-1 bottom-1.5 flex items-end justify-between gap-1">
          <div className="flex items-center -space-x-[2px]">
            {swatches.map((color) => (
              <span
                key={color}
                className="size-[5.5px] shrink-0 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <ProductCardRating avgRating={rating} reviewCount={reviewCount} variant="compact" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-1 px-1.5">
        <p className="truncate text-[8px] text-[#1f1f1f] capitalize">{product.name}</p>
        <div className="flex items-end gap-1">
          <span className="min-w-0 flex-1 text-[11px] font-bold whitespace-nowrap text-[#151515]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <button
            type="button"
            className="flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-[#151515] bg-white text-[#151515]"
            data-testid="lto-add-button"
            aria-label={cartMessages.a11y.addToCart}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Limited-time offers carousel — Figma gradient wash, badge, scrollable product row. */
export function CartLimitedTimeOffers() {
  const lto = cartConfig.mock.limitedTimeOffers;
  if (!isCartFeatureEnabled('limitedTimeOffers') || !lto) {
    return null;
  }

  const products = (lto.products ?? []) as LtoProduct[];
  const countdown = 'countdown' in lto ? lto.countdown : null;
  const badgeText = 'badgeText' in lto ? lto.badgeText : null;

  return (
    <div
      className="laptop:overflow-hidden flex flex-col gap-2 overflow-hidden py-3"
      style={{ backgroundImage: cartTheme.ltoGradient }}
      data-testid="cart-limited-time-offers"
    >
      <div className="flex w-full flex-col gap-2 px-4 pb-3">
        <div className="flex items-center justify-between gap-1 tracking-tight text-[#151515]">
          <p className="min-w-0 flex-1 text-sm font-medium">{lto.title}</p>
          {countdown ? <span className="shrink-0 text-sm font-bold">{countdown}</span> : null}
        </div>
        {badgeText ? (
          <span
            className="flex w-full items-center rounded-[17px] px-[9px] py-2 text-sm leading-[14px] font-bold tracking-tight text-[#151515]"
            style={{ background: cartTheme.ltoBadgeGradient }}
            data-testid="lto-badge"
          >
            {badgeText}
          </span>
        ) : null}
      </div>
      {products.length > 0 ? (
        <div className={cn('scrollbar-hide flex overflow-x-auto', HORIZONTAL_SCROLL_PASS_VERTICAL)}>
          {products.map((product) => (
            <LtoProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
