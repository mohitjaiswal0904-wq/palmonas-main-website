'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ArrowRightIcon, CartBagIcon } from '@/components/icons';
import { cartMessages } from '@/config/cart/cart.config';
import { useAuth } from '@/hooks/auth/useAuth';
import { useProductCartState } from '@/hooks/cart/useProductCartState';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
} from '@/lib/analytics/track-product-cart-events';
import { queryKeys } from '@/lib/query/keys';
import { getDefaultVariantId } from '@/lib/utils/product-needs-choose-options';
import { getProductByHandle } from '@/services/product.service';
import type { Product } from '@/types/product';

interface ShraddhasFavouriteShopByLookAddButtonProps {
  product: Product;
}

/**
 * Resolve a merchandise variant id for cart add, fetching PDP data when the list payload omits variants.
 */
async function resolveVariantIdForAdd(
  product: Product,
  resolvedVariantId: string | undefined,
  fetchByHandle: (handle: string) => Promise<Product>,
): Promise<string | undefined> {
  const fromList = resolvedVariantId ?? getDefaultVariantId(product.variants);
  if (fromList) {
    return fromList;
  }

  const detail = await fetchByHandle(product.handle);
  return getDefaultVariantId(detail.variants);
}

/**
 * Shop-by-look ATC — adds the default variant directly (no PDP redirect).
 */
export function ShraddhasFavouriteShopByLookAddButton({
  product,
}: ShraddhasFavouriteShopByLookAddButtonProps) {
  const queryClient = useQueryClient();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { actions } = useCart();
  const { showError } = useToast();
  const { markAddedLocally, resolvedVariantId } = useProductCartState(product);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (isAdding) {
      return;
    }

    if (isAuthLoading || !session) {
      showError(cartMessages.errors.addItem);
      return;
    }

    trackProductAddToCartClicked(product);
    setIsAdding(true);

    void (async () => {
      try {
        const nextVariantId = await resolveVariantIdForAdd(product, resolvedVariantId, (handle) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.products.byHandle(handle),
            queryFn: () => getProductByHandle(handle),
          }),
        );

        if (!nextVariantId) {
          showError(cartMessages.errors.addItem);
          return;
        }

        await actions.addItem(nextVariantId, 1);
        markAddedLocally();
        trackProductAddedToCart(product, nextVariantId);
      } catch {
        // useCart / fetch errors surface via toast where applicable
      } finally {
        setIsAdding(false);
      }
    })();
  };

  return (
    <button
      type="button"
      className="relative z-10 flex min-h-12 w-full items-center justify-center gap-2 rounded-[2px] bg-stone-900 px-4 py-3.5 text-xs font-medium tracking-[0.12em] text-white uppercase disabled:opacity-60"
      aria-label={cartMessages.a11y.addToCart}
      aria-busy={isAdding}
      disabled={isAdding}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleAddToCart();
      }}
    >
      <CartBagIcon />
      <span>{cartMessages.addToCartUpper}</span>
      <ArrowRightIcon />
    </button>
  );
}
