'use client';

import { BottomNavCartIcon } from '@/components/icons/BottomNavIcons';
import { buildNavCountAriaLabel, NavCountBadge } from '@/components/layout/NavCountBadge';
import { AppLink } from '@/components/ui/AppLink';
import { cartMessages } from '@/config/cart/cart.config';
import { bottomNavCartItem, bottomNavMessages } from '@/config/layout/bottom-nav.config';
import { useCartStats } from '@/hooks/cart/useCartStats';
import { useAfterHydration } from '@/hooks/useAfterHydration';
import { cn } from '@/lib/utils/cn';

interface BottomNavCartTabProps {
  active: boolean;
}

/** Bottom-nav cart tab — mirrors header cart link icon, badge, and `/cart` navigation. */
export function BottomNavCartTab({ active }: BottomNavCartTabProps) {
  const badgesReady = useAfterHydration();
  const { cartCount, cartCountHydrated } = useCartStats();
  const showCartBadge = badgesReady && cartCountHydrated;
  const cartBadgeCount = showCartBadge ? cartCount : 0;

  return (
    <AppLink
      href={bottomNavCartItem.href}
      data-cart-fly-target="nav"
      prefetch
      aria-current={active ? 'page' : undefined}
      aria-label={buildNavCountAriaLabel(cartMessages.a11y.openCart, cartBadgeCount, showCartBadge)}
      className={cn(
        'flex flex-col items-center gap-[7px] text-[10px] leading-none transition-colors',
        active ? 'text-palmonas-ink' : 'text-palmonas-subtle',
      )}
    >
      <span className="relative inline-flex">
        <BottomNavCartIcon active={active} className={bottomNavCartItem.iconClassName} />
        <NavCountBadge count={cartBadgeCount} />
      </span>
      <span className="truncate">{bottomNavMessages.labels.cart}</span>
    </AppLink>
  );
}
