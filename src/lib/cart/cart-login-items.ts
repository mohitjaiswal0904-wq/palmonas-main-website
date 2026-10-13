import type { QueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import type { CartLoginItem } from '@/types/auth/auth.types';
import type { Cart, CartDiscountsState } from '@/types/cart';
import { formatVariantId } from '@/types/cart';

/**
 * Maps local cart lines to login `cart_items` payload for cart / cart_jwe flows.
 *
 * @param cart - Guest or store cart snapshot.
 * @returns Shopify variant GIDs with quantities.
 */
export function buildCartLoginItemsFromCart(cart: Cart | null | undefined): CartLoginItem[] {
  if (!cart?.items.length) {
    return [];
  }

  return cart.items.map((item) => ({
    merchandiseId: formatVariantId(item.product.variantId),
    quantity: item.quantity,
  }));
}

/**
 * Builds login `coupon_codes` from an applied store coupon.
 *
 * @param appliedCode - Applied discount code from cart discount state.
 */
export function buildCartLoginCouponCodes(
  appliedCode: string | null | undefined,
): string[] | undefined {
  const trimmed = appliedCode?.trim();
  return trimmed ? [trimmed] : undefined;
}

/**
 * Reads the applied coupon from TanStack Query cache for cart login.
 *
 * @param queryClient - Cart discounts query client.
 * @param cartId - Current cart id used as the discounts query key.
 */
export function resolveCartLoginCouponCodes(
  queryClient: QueryClient,
  cartId: string | null | undefined,
): string[] | undefined {
  if (!cartId) {
    return undefined;
  }

  const appliedCode = queryClient.getQueryData<CartDiscountsState>(
    queryKeys.cart.discounts(cartId),
  )?.appliedCode;

  return buildCartLoginCouponCodes(appliedCode);
}
