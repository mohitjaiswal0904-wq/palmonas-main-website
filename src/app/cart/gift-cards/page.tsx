import { redirect } from 'next/navigation';

import { AllGiftCardsPageContent } from '@/components/cart/gift-cards/AllGiftCardsPageContent';
import { Footer } from '@/components/layout/Footer';
import { cartMessages, isCartFeatureEnabled } from '@/config/cart/cart.config';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: cartMessages.allGiftCards,
  path: '/cart/gift-cards',
  noIndex: true,
});

export default function CartGiftCardsPage() {
  if (!isCartFeatureEnabled('giftCard')) {
    redirect('/cart');
  }

  return (
    <>
      <main className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6">
        <AllGiftCardsPageContent />
      </main>
      <Footer />
    </>
  );
}
