'use client';

import { useMemo, useState } from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import { useCartStore } from '@/store/cart/cart.store';
import { extractNumericId } from '@/types/cart';
import type { Product } from '@/types/product';

interface CartLineMatch {
  id: string;
  quantity: number;
  size?: string;
  color?: string;
  product: { id?: string; handle?: string; variantId: string; variantTitle?: string };
}

/** Cart line for a listing product — used when choosing which variant to remove. */
export interface ProductCartMatchingLine {
  id: string;
  quantity: number;
  variantId: string;
  variantTitle?: string;
  size?: string;
  color?: string;
}

/**
 * Returns true when two variant ids refer to the same merchandise (GID or numeric).
 *
 * @param left - Cart or product variant id.
 * @param right - Cart or product variant id.
 */
function variantIdsMatch(left: string, right: string): boolean {
  return left === right || extractNumericId(left) === extractNumericId(right);
}

/**
 * Returns true when a cart line belongs to the listing product.
 *
 * @param item - Cart line to test.
 * @param product - Listing product.
 */
function cartLineBelongsToProduct(item: CartLineMatch, product: Product): boolean {
  if (item.product.handle && item.product.handle === product.handle) {
    return true;
  }
  if (
    item.product.id &&
    product.id &&
    extractNumericId(item.product.id) === extractNumericId(product.id)
  ) {
    return true;
  }
  return product.variants.some((variant) => variantIdsMatch(item.product.variantId, variant.id));
}

/**
 * Collects cart lines for an explicit variant, or every line of this product.
 *
 * @param cartItems - Current cart lines.
 * @param product - Listing product whose variants can match.
 * @param variantId - Optional explicit variant.
 */
function findMatchingCartLines(
  cartItems: CartLineMatch[] | undefined,
  product: Product,
  variantId?: string,
): CartLineMatch[] {
  if (!cartItems?.length) {
    return [];
  }

  if (variantId) {
    return cartItems.filter((item) => variantIdsMatch(item.product.variantId, variantId));
  }

  return cartItems.filter((item) => cartLineBelongsToProduct(item, product));
}

/**
 * PLP/PDP in-cart state from API enrichment, Zustand, or local add success.
 *
 * @param product - Product with optional `cart.isInCart` / `cart.quantity` from API.
 * @param variantId - Optional explicit variant; defaults to first available.
 * When no explicit variantId, quantity is the sum of every matching product line
 * (covers choose-options adds of a non-default size/color).
 */
export function useProductCartState(product: Product, variantId?: string) {
  const cart = useCartStore((s) => s.cart);
  const { session, isGuest } = useAuth();
  const authKey = `${session?.user?.id ?? 'guest'}:${isGuest}`;
  const [localAddState, setLocalAddState] = useState({ authKey, success: false });
  const localAddSuccess = localAddState.authKey === authKey && localAddState.success;

  const resolvedVariantId =
    variantId ?? product.variants.find((v) => v.availableForSale)?.id ?? product.variants[0]?.id;

  const matchingLines = useMemo(
    () => findMatchingCartLines(cart?.items, product, variantId),
    [cart?.items, product, variantId],
  );
  const matchingLine = matchingLines[0];
  const fromStore = matchingLine != null;

  // Hydrated cart wins — sticky localAddSuccess must not keep PLP qty after remove (PW-553).
  const showInCart = useMemo(() => {
    if (cart) return fromStore;
    if (localAddSuccess) return true;
    return Boolean(product.cart?.isInCart);
  }, [cart, fromStore, localAddSuccess, product.cart?.isInCart]);

  const quantity = useMemo(() => {
    if (matchingLines.length) {
      return matchingLines.reduce((total, line) => total + (line.quantity ?? 0), 0);
    }
    if (cart) return 0;
    if (localAddSuccess) return Math.max(product.cart?.quantity ?? 0, 1);
    return product.cart?.quantity ?? 0;
  }, [cart, localAddSuccess, matchingLines, product.cart?.quantity]);

  const cartLines = useMemo<ProductCartMatchingLine[]>(
    () =>
      matchingLines.map((line) => ({
        id: line.id,
        quantity: line.quantity ?? 0,
        variantId: line.product.variantId,
        variantTitle: line.product.variantTitle,
        size: line.size,
        color: line.color,
      })),
    [matchingLines],
  );

  return {
    showInCart,
    quantity,
    lineQuantity: matchingLine?.quantity ?? 0,
    lineId: matchingLine?.id,
    matchingLines: cartLines,
    resolvedVariantId,
    markAddedLocally: () => setLocalAddState({ authKey, success: true }),
    clearLocalSuccess: () => setLocalAddState({ authKey, success: false }),
  };
}
