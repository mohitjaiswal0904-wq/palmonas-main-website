'use client';

import Link from 'next/link';

import { CartBagIcon } from '@/components/icons/cart-icons';
import { cartMessages } from '@/config/cart/cart.config';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

/** Empty cart placeholder with continue-shopping CTA. */
export function CartEmptyState() {
  return (
    <div
      className="laptop:py-16 mx-auto flex max-w-[400px] flex-col items-center px-4 py-12 text-center"
      role="status"
    >
      <div className="mb-6 rounded-full bg-[#f8fafc] p-4">
        <CartBagIcon className="laptop:h-12 laptop:w-12 h-10 w-10 text-[#afafaf]" />
      </div>
      <h2 className="font-nunito-sans laptop:text-xl mb-2 text-base font-medium text-[#151515]">
        {cartMessages.emptyTitle}
      </h2>
      <p className="font-nunito-sans laptop:text-sm mb-8 max-w-[280px] text-xs text-[#afafaf]">
        {cartMessages.emptyDescription}
      </p>
      <Link
        href={resolveCollectionPagePath('best-sellers')}
        className="flex h-11 w-full max-w-[328px] items-center justify-center rounded-lg bg-[#151515] text-sm tracking-wide text-white"
      >
        {cartMessages.continueShopping}
      </Link>
    </div>
  );
}
