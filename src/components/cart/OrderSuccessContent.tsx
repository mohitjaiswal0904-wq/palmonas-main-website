'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { cartMessages } from '@/config/cart/cart.config';

/** Order confirmation content shown after GoKwik checkout success. */
export function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div
      className="laptop:py-16 mx-auto flex max-w-[480px] flex-col items-center px-4 py-12 text-center"
      data-testid="order-success"
      role="status"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf5] text-2xl text-[#059669]">
        ✓
      </div>
      <h1 className="font-nunito-sans laptop:text-2xl mb-2 text-lg font-medium text-[#151515]">
        {cartMessages.orderSuccessTitle}
      </h1>
      {orderId ? (
        <p className="font-nunito-sans laptop:text-sm mb-8 text-xs text-[#64748b]">
          {cartMessages.orderIdLabel}: <span className="font-medium text-[#151515]">{orderId}</span>
        </p>
      ) : (
        <p className="mb-8" />
      )}
      <div className="flex w-full max-w-[328px] flex-col gap-3">
        <Link
          href="/"
          className="flex h-11 w-full items-center justify-center rounded-lg bg-[#151515] text-sm tracking-wide text-white"
        >
          {cartMessages.continueShopping}
        </Link>
        <Link
          href="/account/orders"
          className="flex h-11 w-full items-center justify-center rounded-lg border border-[#e2e8f0] text-sm tracking-wide text-[#151515]"
        >
          {cartMessages.viewOrders}
        </Link>
      </div>
    </div>
  );
}
