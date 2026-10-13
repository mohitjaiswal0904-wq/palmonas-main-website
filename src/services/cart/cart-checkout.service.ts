import { cartMessages } from '@/config/cart/cart.config';
import { fetchCurrentCart, invalidateCartCache } from '@/repositories/cart/cart.repository';
import { validatePreCheckoutApi } from '@/services/cart/cart.service';
import { waitForGuestCartMerge } from '@/services/cart/guest-cart-merge.service';
import { useCartStore } from '@/store/cart/cart.store';
import { extractNumericId, type CheckoutPrepareResult } from '@/types/cart';

/**
 * Prepares authoritative cart id for GoKwik checkout after merge + force fetch + pre-checkout.
 */
export async function prepareCheckoutCart(): Promise<CheckoutPrepareResult> {
  const postLoginCartId = useCartStore.getState().consumePostLoginCheckoutCartId();

  if (postLoginCartId) {
    invalidateCartCache();
    const cart = await fetchCurrentCart({ force: true });
    const preCheckout = await validatePreCheckoutApi();
    const cartId = postLoginCartId.trim() || preCheckout.cart_id?.trim();

    if (!cartId) {
      throw new Error(cartMessages.errors.checkout);
    }

    return {
      cartId,
      isValid: preCheckout.is_valid,
      preCheckout,
      cart,
    };
  }

  await waitForGuestCartMerge();

  invalidateCartCache();
  const cart = await fetchCurrentCart({ force: true });
  const preCheckout = await validatePreCheckoutApi();

  if (!preCheckout.cart_id?.trim()) {
    throw new Error(cartMessages.errors.checkout);
  }

  const cartId = preCheckout.cart_id.trim();

  if (
    process.env.NODE_ENV === 'development' &&
    extractNumericId(preCheckout.cart_id) !== extractNumericId(cart.id)
  ) {
    console.warn('[cart] pre-checkout cart_id differs from GET /cart/current', {
      preCheckoutCartId: preCheckout.cart_id,
      currentCartId: cart.id,
    });
  }

  return {
    cartId,
    isValid: preCheckout.is_valid,
    preCheckout,
    cart,
  };
}
