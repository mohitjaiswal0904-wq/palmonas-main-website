import { Suspense } from 'react';

import { OrderSuccessContent } from '@/components/cart/OrderSuccessContent';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { cartMessages } from '@/config/cart/cart.config';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: cartMessages.orderSuccessTitle,
  path: '/order-success',
  noIndex: true,
});

export default function OrderSuccessPage() {
  return (
    <>
      <Header />
      <main className="laptop:py-10 container flex min-h-[calc(100vh-8rem)] flex-col py-6">
        <Suspense fallback={null}>
          <OrderSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
