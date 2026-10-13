'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { BottomNavCartTab } from '@/components/layout/BottomNavCartTab';
import { BottomNavIcon } from '@/components/layout/bottom-nav-icon-registry';
import {
  bottomNavCartItem,
  bottomNavMessages,
  type BottomNavItemConfig,
} from '@/config/layout/bottom-nav.config';
import { useHomePageCategoryNavigation } from '@/hooks/home/useHomePageCategoryNavigation';
import { useAppNavigate } from '@/hooks/navigation/useAppNavigate';
import {
  bottomNavCategoryQueryParam,
  isBottomNavItemActive,
  isMobileBottomNavVisible,
  resolveBottomNavItemsForPath,
} from '@/lib/layout/bottom-nav';
import { cn } from '@/lib/utils/cn';

interface BottomNavItemButtonProps {
  item: BottomNavItemConfig;
  active: boolean;
  onNavigate: (href: string) => void;
  onSelectHomeCategory: (category: NonNullable<BottomNavItemConfig['homeCategory']>) => void;
  onPrefetchHomeCategory?: (category: NonNullable<BottomNavItemConfig['homeCategory']>) => void;
}

/** Renders one bottom-nav tab as an accessible button. */
function BottomNavItemButton({
  item,
  active,
  onNavigate,
  onSelectHomeCategory,
  onPrefetchHomeCategory,
}: BottomNavItemButtonProps) {
  const itemClassName = cn(
    'flex flex-col items-center gap-[7px] text-[10px] leading-none transition-colors',
    active ? 'text-palmonas-ink' : 'text-palmonas-subtle',
  );
  const homeCategory = item.homeCategory;

  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={cn(itemClassName, 'font-inherit w-full border-0 bg-transparent p-0')}
      onPointerEnter={() => {
        if (homeCategory) {
          onPrefetchHomeCategory?.(homeCategory);
        }
      }}
      onFocus={() => {
        if (homeCategory) {
          onPrefetchHomeCategory?.(homeCategory);
        }
      }}
      onClick={() => {
        if (homeCategory) {
          onSelectHomeCategory(homeCategory);
          return;
        }

        onNavigate(item.href);
      }}
    >
      <BottomNavIcon active={active} className={item.iconClassName} iconKey={item.icon} />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

/** Sticky mobile bottom navigation bar — hidden from laptop breakpoint up. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { navigate } = useAppNavigate();
  const categoryParam = searchParams.get(bottomNavCategoryQueryParam) ?? undefined;
  const visible = isMobileBottomNavVisible(pathname, categoryParam);
  const routeItems = resolveBottomNavItemsForPath(pathname, categoryParam);
  const cartActive = isBottomNavItemActive(bottomNavCartItem, pathname, categoryParam);
  const { handleSelect, prefetchCategory } = useHomePageCategoryNavigation();

  // Reserve space so page content is not covered by the fixed bar on mobile.
  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    document.body.classList.add('has-mobile-bottom-nav');

    return () => {
      document.body.classList.remove('has-mobile-bottom-nav');
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <nav
      aria-label={bottomNavMessages.a11y.navLabel}
      className="laptop:hidden z-fixed border-palmonas-border bg-palmonas-surface fixed inset-x-0 bottom-0 border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      data-testid="mobile-bottom-nav"
    >
      <ul className="flex items-center justify-center gap-3 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        {routeItems.map((item) => {
          const active = isBottomNavItemActive(item, pathname, categoryParam);

          return (
            <li key={item.id} className="min-w-0 flex-1">
              <BottomNavItemButton
                item={item}
                active={active}
                onNavigate={navigate}
                onSelectHomeCategory={handleSelect}
                onPrefetchHomeCategory={prefetchCategory}
              />
            </li>
          );
        })}
        <li className="min-w-0 flex-1">
          <BottomNavCartTab active={cartActive} />
        </li>
      </ul>
    </nav>
  );
}
