'use client';

import { useEffect, type ReactNode } from 'react';

import { isCheckoutEnabled } from '@/config/cart/cart.config';
import { useToast } from '@/hooks/useToast';
import { GokwikCheckout, registerCheckoutToast } from '@/infrastructure/checkout';
import { GokwikCheckoutEvents } from '@/infrastructure/gokwik/GokwikCheckoutEvents';
import { CartStatsProvider } from '@/providers/cart/CartStatsProvider';
import { PostAuthSync } from '@/providers/cart/PostAuthSync';

/** Inner bootstrap: checkout toast registration + PostAuthSync. */
function CartBootstrap({ children }: { children: ReactNode }) {
  const { showWarning } = useToast();

  useEffect(() => {
    registerCheckoutToast((message) => showWarning(message));
  }, [showWarning]);

  return (
    <>
      <PostAuthSync />
      {children}
    </>
  );
}

/** Root cart provider — stats context, guest merge sync, checkout toast. */
export function CartProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {isCheckoutEnabled() ? (
        <>
          <GokwikCheckout />
          <GokwikCheckoutEvents />
        </>
      ) : null}
      <CartStatsProvider>
        <CartBootstrap>{children}</CartBootstrap>
      </CartStatsProvider>
    </>
  );
}
