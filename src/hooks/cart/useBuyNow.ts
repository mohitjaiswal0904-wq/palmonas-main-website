'use client';

import { useCallback, useState } from 'react';

import { cartMessages } from '@/config/cart/cart.config';
import { useToast } from '@/hooks/useToast';
import { checkoutProvider } from '@/infrastructure/checkout';
import { createBuyNowCart } from '@/repositories/cart/cart.repository';
import { formatVariantId } from '@/types/cart';

/**
 * Buy-now flow — creates ephemeral cart and opens checkout provider.
 * Guest-allowed (separate buy-now cart), same as cart Continue to Checkout.
 *
 * @returns Loading state and `createAndCheckout` action.
 */
export function useBuyNow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showInfo, showError } = useToast();

  const createAndCheckout = useCallback(
    async (variantId: string, quantity = 1, formatGid = false) => {
      try {
        setLoading(true);
        setError(null);
        const merchandiseId = formatGid ? formatVariantId(variantId) : variantId;
        const buyNowCart = await createBuyNowCart(merchandiseId, quantity);
        await checkoutProvider.openCheckout({
          cartId: buyNowCart.idWithKey,
          source: 'buy_now',
          checkoutUrl: buyNowCart.checkoutUrl,
        });
        showInfo(cartMessages.toasts.buyNowProceeding);
      } catch (err) {
        const message = err instanceof Error ? err.message : cartMessages.errors.buyNow;
        setError(message);
        showError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showError, showInfo],
  );

  return {
    loading,
    error,
    createAndCheckout,
  };
}
