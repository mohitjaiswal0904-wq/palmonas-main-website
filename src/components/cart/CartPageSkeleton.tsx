import { CartFetchingSkeleton } from '@/components/cart/CartFetchingSkeleton';

/**
 * Full cart page placeholder for route Instant Loading and nav pending overlay.
 */
export function CartPageSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading cart"
      className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6"
      data-testid="cart-page-skeleton"
    >
      <CartFetchingSkeleton />
    </main>
  );
}
