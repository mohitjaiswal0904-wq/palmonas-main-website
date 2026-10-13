import { fetchCurrentCart } from '@/repositories/cart/cart.repository';
import { useCartStore } from '@/store/cart/cart.store';
import type { Cart } from '@/types/cart';

/**
 * Loads auth cart lines into Zustand for PLP badges after stats-only cold start.
 *
 * @returns Transformed current cart.
 */
export async function hydrateAuthenticatedCartLines(): Promise<Cart> {
  const cart = await fetchCurrentCart();
  useCartStore.getState().setCart(cart);
  return cart;
}
