import { CartCheckoutUtmSync } from '@/components/cart/CartCheckoutUtmSync';
import { CartPageContent } from '@/components/cart/CartPageContent';
import { cartMessages } from '@/config/cart/cart.config';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: cartMessages.pageTitle,
  path: '/cart',
  noIndex: true,
});

/** Shared app-shell prefetch — UTM search must not block the cart body. */
export const prefetch = 'partial';

/** No route `loading.tsx` — Cache Components + UTM search left that skeleton stuck. */
export default function CartPage() {
  return (
    <main className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6">
      <CartCheckoutUtmSync />
      <CartPageContent />
    </main>
  );
}
