'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { HeaderAuthMenu } from '@/components/auth/HeaderAuthMenu';
import { cartMessages } from '@/config/cart/cart.config';
import { useCartStats } from '@/hooks/cart/useCartStats';
import { useAfterHydration } from '@/hooks/useAfterHydration';
import { cn } from '@/lib/utils/cn';

interface HeaderActionsProps {
  className?: string;
}

interface CounterLinkProps {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
}

function CounterLink({ href, label, count, children }: CounterLinkProps) {
  const counterLabel = typeof count === 'number' ? `, ${count} items` : '';

  return (
    <Link
      href={href}
      className="relative inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 transition-colors hover:text-amber-700"
      aria-label={`${label}${counterLabel}`}
    >
      {children}
      {typeof count === 'number' ? (
        <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-stone-950 px-1 text-[10px] leading-none font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6.3 8h13.4l-1.2 9H7.5L6.3 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
      <path d="M9.5 20h.1M16.4 20h.1" />
    </svg>
  );
}

export function HeaderActions({ className }: HeaderActionsProps) {
  const badgesReady = useAfterHydration();
  const { cartCount, cartCountHydrated } = useCartStats();

  return (
    <nav
      className={cn(
        'mobile:gap-4 mobile:text-sm flex shrink-0 items-center gap-2 text-xs',
        className,
      )}
      aria-label="Utility navigation"
    >
      <Link href="/account/login" className="transition-colors hover:text-amber-700">
        Login
      </Link>
      <HeaderAuthMenu />
      <CounterLink
        href="/cart"
        label={cartMessages.a11y.openCart}
        count={badgesReady && cartCountHydrated ? cartCount : undefined}
      >
        <CartIcon />
      </CounterLink>
    </nav>
  );
}
