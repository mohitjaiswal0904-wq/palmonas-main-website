'use client';

import { useCallback, useState } from 'react';

import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton';
import { WishlistCategoryPanel } from '@/components/wishlist/WishlistCategoryPanel';
import { WishlistEmptyState } from '@/components/wishlist/WishlistEmptyState';
import { WishlistRemoveConfirmModal } from '@/components/wishlist/WishlistRemoveConfirmModal';
import { useWishlistPage } from '@/hooks/useWishlistPage';
import { cn } from '@/lib/utils/cn';
import { formatWishlistItemCount } from '@/lib/utils/wishlist-filters';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import type { WishlistItem } from '@/types/wishlist';

export function WishlistContent() {
  const {
    filteredItems,
    itemCount,
    activeFilter,
    availableFilters,
    setActiveFilter,
    isLoading,
    removingProductId,
    error,
    isAuthenticated,
    openLogin,
    removeItem,
    refetch,
  } = useWishlistPage();

  const [pendingRemoveItem, setPendingRemoveItem] = useState<WishlistItem | null>(null);

  const handleConfirmRemove = useCallback(() => {
    if (!pendingRemoveItem) {
      return;
    }

    void removeItem(pendingRemoveItem.productId)
      .then(() => {
        setPendingRemoveItem(null);
      })
      .catch(() => undefined);
  }, [pendingRemoveItem, removeItem]);

  if (!isAuthenticated) {
    return (
      <div className="laptop:px-5 px-4 py-6">
        <WishlistEmptyState
          title="Sign in to view your wishlist"
          description="Save your favourite pieces and access them anytime after signing in."
          showLoginCta
          onLogin={openLogin}
        />
      </div>
    );
  }

  const pendingProductName = pendingRemoveItem?.product.name ?? 'this item';
  const isPendingItemRemoving =
    pendingRemoveItem !== null &&
    removingProductId === normalizeWishlistProductId(pendingRemoveItem.productId);

  return (
    <>
      <div className="flex w-full min-w-0 flex-col">
        <div className="laptop:block laptop:px-5 hidden border-b border-[#E2E8F0] px-4 pt-6 pb-6">
          <h1 className="font-nunito-sans text-[30px] leading-9 font-bold tracking-[-0.75px] text-[#151515]">
            My Wishlist
          </h1>
          <p className="mt-1 text-sm leading-5 text-[#62748E]">
            {formatWishlistItemCount(itemCount)}
          </p>
        </div>

        {!isLoading && !error ? (
          <WishlistCategoryPanel
            items={filteredItems}
            activeFilter={activeFilter}
            availableFilters={availableFilters}
            onFilterChange={setActiveFilter}
            onRemoveRequest={setPendingRemoveItem}
          />
        ) : null}

        {isLoading ? (
          <section
            className={cn(
              'tab:grid-cols-3 laptop:grid-cols-5 grid grid-cols-2 gap-[2px] border-t border-l border-[#0000001A]',
            )}
            aria-label="Loading wishlist"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </section>
        ) : null}

        {!isLoading && error ? (
          <div className="laptop:px-5 rounded-palmonas-lg mx-4 mt-6 border border-stone-200 px-6 py-10 text-center">
            <p className="text-sm text-stone-600">{error.message}</p>
            <button
              type="button"
              className="mt-4 text-sm font-medium underline"
              aria-label="Retry loading wishlist"
              onClick={refetch}
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>

      <WishlistRemoveConfirmModal
        open={pendingRemoveItem !== null}
        productName={pendingProductName}
        isRemoving={isPendingItemRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setPendingRemoveItem(null);
        }}
      />
    </>
  );
}
