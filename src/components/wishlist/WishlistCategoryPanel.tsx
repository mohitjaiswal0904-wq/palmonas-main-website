'use client';

import { useRef } from 'react';

import { WishlistCategoryEmptyState } from '@/components/wishlist/WishlistCategoryEmptyState';
import { WishlistCategoryTabs } from '@/components/wishlist/WishlistCategoryTabs';
import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { getWishlistCategoryExploreCta } from '@/config/wishlist';
import { useSiteHeaderStickyOffset } from '@/hooks/layout/useSiteHeaderStickyOffset';
import { useStickyPinState } from '@/hooks/layout/useStickyPinState';
import { cn } from '@/lib/utils/cn';
import type { WishlistCategoryFilter, WishlistItem } from '@/types/wishlist';

const WISHLIST_GRID_CLASS =
  'tab:grid-cols-3 laptop:grid-cols-5 grid grid-cols-2 gap-[2px] border-t border-l border-[#0000001A]';

interface WishlistCategoryPanelProps {
  /** Items belonging to the active category pill. */
  items: WishlistItem[];
  activeFilter: WishlistCategoryFilter;
  /** Category pills to render (demifine, gold, all). */
  availableFilters: readonly WishlistCategoryFilter[];
  onFilterChange: (filter: WishlistCategoryFilter) => void;
  onRemoveRequest: (item: WishlistItem) => void;
  variant?: 'default' | 'account';
  className?: string;
}

/**
 * Renders wishlist products for the selected category pill.
 *
 * Each pill shows only its own product category — categories merge into one grid
 * only when the user picks the `all` pill. The pill bar pins below the site header.
 */
export function WishlistCategoryPanel({
  items,
  activeFilter,
  availableFilters,
  onFilterChange,
  onRemoveRequest,
  variant = 'default',
  className,
}: WishlistCategoryPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickySentinelRef = useRef<HTMLDivElement>(null);
  const headerOffset = useSiteHeaderStickyOffset();
  const isChipBarPinned = useStickyPinState({
    sentinelRef: stickySentinelRef,
    stickyTop: headerOffset,
    enabled: true,
  });
  const exploreCta = items.length === 0 ? getWishlistCategoryExploreCta(activeFilter) : null;

  /** Switches category and brings the first row of the new category into view. */
  const handleFilterChange = (filter: WishlistCategoryFilter): void => {
    if (filter === activeFilter) {
      return;
    }

    onFilterChange(filter);

    const container = containerRef.current;
    if (container && container.getBoundingClientRect().top < headerOffset) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div ref={containerRef} className={cn('w-full min-w-0', className)}>
      <div ref={stickySentinelRef} className="pointer-events-none h-px w-full" aria-hidden="true" />
      <div
        className={cn(
          'sticky z-[1010] bg-white py-2',
          isChipBarPinned ? 'border-b border-[#EFEFEF] shadow-sm' : '',
        )}
        style={{ top: headerOffset > 0 ? headerOffset : undefined }}
      >
        <div className="laptop:px-5 px-4">
          <WishlistCategoryTabs
            variant={variant}
            activeFilter={activeFilter}
            availableFilters={availableFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {exploreCta ? (
        <div className="laptop:px-5 mt-4 px-4">
          <WishlistCategoryEmptyState cta={exploreCta} />
        </div>
      ) : (
        <section className="mt-4" aria-label={`${activeFilter} wishlist items`}>
          <div className={WISHLIST_GRID_CLASS}>
            {items.map((item) => (
              <WishlistItemCard
                key={`${item.productId}-${item.variantId}`}
                item={item}
                onRemoveRequest={() => {
                  onRemoveRequest(item);
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
