import { redirect } from 'next/navigation';

import { AllOffersPageContent } from '@/components/cart/offers/AllOffersPageContent';
import { cartMessages, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: cartMessages.allOffers,
  path: '/cart/offers',
  noIndex: true,
});

export default function CartOffersPage() {
  if (!isCartFeatureEnabled('offers')) {
    redirect('/cart');
  }

  return (
    <main className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6">
      <AllOffersPageContent />
    </main>
  );
}
