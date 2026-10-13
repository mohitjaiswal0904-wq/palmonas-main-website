import { CartOffersPageSkeleton } from '@/components/cart/offers/CartOffersPageSkeleton';

export default function Loading() {
  return (
    <main
      className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6"
      aria-busy="true"
      aria-label="Loading offers"
    >
      <CartOffersPageSkeleton />
    </main>
  );
}
