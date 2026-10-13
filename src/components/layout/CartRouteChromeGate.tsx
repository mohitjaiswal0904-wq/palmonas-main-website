'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface CartRouteChromeGateProps {
  children: ReactNode;
}

/**
 * Returns whether the global site header should be hidden below `laptop`.
 *
 * @param pathname - Current Next.js pathname.
 */
export function shouldHideSiteChromeBelowLaptop(pathname: string): boolean {
  if (pathname === '/cart' || pathname.startsWith('/cart/')) {
    return true;
  }

  // Account shell — mobile uses page-local back + Account; laptop keeps site header.
  if (pathname === '/account' || pathname.startsWith('/account/')) {
    if (pathname.startsWith('/account/login') || pathname.startsWith('/account/register')) {
      return false;
    }
    return true;
  }

  return false;
}

/**
 * Hides site header below `laptop` on `/cart` and `/account` shell routes (PW-607 / PW-611).
 * Desktop keeps the global header; those pages use local chrome on mobile instead.
 */
export function CartRouteChromeGate({ children }: CartRouteChromeGateProps) {
  const pathname = usePathname();
  const hideBelowLaptop = shouldHideSiteChromeBelowLaptop(pathname);

  return (
    <div
      className={cn(
        // `contents` keeps announcement + sticky header in the tall page flex so sticky
        // can pin like the prototype (a short wrapper kills sticky — PW-853).
        hideBelowLaptop ? 'laptop:block hidden' : 'contents',
      )}
      data-testid="cart-route-chrome-gate"
      data-cart-route={hideBelowLaptop || undefined}
    >
      {children}
    </div>
  );
}
