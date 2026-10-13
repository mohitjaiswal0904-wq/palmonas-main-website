'use client';

import { useCallback, useState } from 'react';

import { AccountBackHeader } from '@/components/account/common/AccountBackHeader';
import { AccountPanelSkeleton } from '@/components/account/common/AccountPanelSkeleton';
import { ACCOUNT_DETAIL_PAGE_WIDE_CLASS } from '@/components/account/common/account-layout';
import { ResourceNotFound } from '@/components/ui/ResourceNotFound';
import { WishlistCategoryPanel } from '@/components/wishlist/WishlistCategoryPanel';
import { WishlistRemoveConfirmModal } from '@/components/wishlist/WishlistRemoveConfirmModal';
import { useWishlistPage } from '@/hooks/useWishlistPage';
import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';
import type { WishlistItem } from '@/types/wishlist';

export function AccountWishlistView() {
  const {
    filteredItems,
    activeFilter,
    availableFilters,
    setActiveFilter,
    isLoading,
    removingProductId,
    error,
    removeItem,
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

  const pendingProductName = pendingRemoveItem?.product.name ?? 'this item';
  const isPendingItemRemoving =
    pendingRemoveItem !== null &&
    removingProductId === normalizeWishlistProductId(pendingRemoveItem.productId);

  if (isLoading) {
    return <AccountPanelSkeleton />;
  }

  if (error) {
    return (
      <ResourceNotFound
        title="Unable to load wishlist"
        description="Please sign in and try again."
        ctaHref="/account"
        ctaLabel="Back to account"
      />
    );
  }

  return (
    <div className={ACCOUNT_DETAIL_PAGE_WIDE_CLASS}>
      <AccountBackHeader title="Your Wishlist" />

      <WishlistCategoryPanel
        className="mt-6"
        variant="account"
        items={filteredItems}
        activeFilter={activeFilter}
        availableFilters={availableFilters}
        onFilterChange={setActiveFilter}
        onRemoveRequest={setPendingRemoveItem}
      />

      <WishlistRemoveConfirmModal
        open={pendingRemoveItem !== null}
        productName={pendingProductName}
        isRemoving={isPendingItemRemoving}
        onConfirm={handleConfirmRemove}
        onCancel={() => {
          setPendingRemoveItem(null);
        }}
      />
    </div>
  );
}
