'use client';

import { useEffect, useMemo, useRef } from 'react';

import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { WishlistCategoryFilter } from '@/types/wishlist';

const DEFAULT_TABS: { id: WishlistCategoryFilter; label: string }[] = [
  { id: 'demifine', label: 'Demifine®' },
  { id: 'gold', label: 'Gold Jewellery' },
  { id: 'all', label: 'All Jewellery' },
];

const ACCOUNT_TABS: { id: WishlistCategoryFilter; label: string }[] = [
  { id: 'demifine', label: 'Demifine®' },
  { id: 'gold', label: 'Gold' },
  { id: 'all', label: 'All' },
];

interface WishlistCategoryTabsProps {
  activeFilter: WishlistCategoryFilter;
  onFilterChange: (filter: WishlistCategoryFilter) => void;
  /** Category pills that currently have wishlist products (plus `all`). */
  availableFilters?: readonly WishlistCategoryFilter[];
  variant?: 'default' | 'account';
}

/**
 * Renders wishlist category pills for sections that contain products.
 */
export function WishlistCategoryTabs({
  activeFilter,
  onFilterChange,
  availableFilters,
  variant = 'default',
}: WishlistCategoryTabsProps) {
  const allTabs = variant === 'account' ? ACCOUNT_TABS : DEFAULT_TABS;
  const tabs = useMemo(() => {
    if (!availableFilters || availableFilters.length === 0) {
      return allTabs;
    }

    const available = new Set(availableFilters);
    return allTabs.filter((tab) => available.has(tab.id));
  }, [allTabs, availableFilters]);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Keep the active chip centered in the horizontal scroll row when scroll-spy changes tabs.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeFilter]);

  return (
    <div
      className={cn(
        'w-full min-w-0 [scrollbar-width:none] overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        HORIZONTAL_SCROLL_PASS_VERTICAL,
      )}
      tabIndex={0}
      aria-label="Wishlist category filters"
    >
      <div
        className="flex w-max min-w-full flex-nowrap gap-3 pb-1 font-sans"
        role="tablist"
        aria-label="Wishlist categories"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeFilter;

          return (
            <button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={cn(
                'inline-flex h-[30px] shrink-0 items-center justify-center gap-[6px] rounded-[23px] border px-[10px] py-[4px] text-center text-[12px] leading-[18px] tracking-[0.24px] whitespace-nowrap transition-colors',
                isActive
                  ? 'border-[#D3C8CA] bg-[#ECE2DF] font-medium text-[#151515]'
                  : 'border-[#CAC9C9] bg-transparent font-normal text-[#CAC9C9]',
              )}
              onClick={() => onFilterChange(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
