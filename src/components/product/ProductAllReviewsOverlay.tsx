'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ProductReviewsFeed } from '@/components/product/ProductReviewsFeed';
import { ProductReviewsInfiniteScrollTrigger } from '@/components/product/ProductReviewsInfiniteScrollTrigger';
import {
  WriteReviewOverlay,
  openWriteReviewGuarded,
} from '@/components/product/WriteReviewOverlay';
import {
  isProductFeatureEnabled,
  productConfig,
  productMessages,
} from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useProductReviews } from '@/hooks/product/useProductReviews';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { ProductReviewsFilter } from '@/types/product/reviews';

interface ProductAllReviewsOverlayProps {
  open: boolean;
  productId: string;
  initialFilter: ProductReviewsFilter;
  onClose: () => void;
}

/**
 * Full reviews list overlay (desktop dialog) opened from View All on laptop.
 */
export function ProductAllReviewsOverlay({
  open,
  productId,
  initialFilter,
  onClose,
}: ProductAllReviewsOverlayProps) {
  const isLaptop = useMediaQuery('laptop');
  const { guard } = useRequireAuth();
  const [filter, setFilter] = useState<ProductReviewsFilter>(initialFilter);
  const [prevOpen, setPrevOpen] = useState(open);
  const [writeOpen, setWriteOpen] = useState(false);
  const pageSize = productConfig.reviews.fullPageSize;

  // Reset filters when overlay opens (React render-time sync — avoid setState-in-effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setFilter(initialFilter);
    }
  }

  const {
    reviews,
    hasMoreReviews,
    totalCount,
    isFetchingReviews,
    isLoadingMoreReviews,
    loadMoreReviews,
  } = useProductReviews(productId, pageSize, filter, { enabled: open });

  // Lock scroll + Escape for desktop dialog.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !writeOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open, writeOpen]);

  const handleFilterChange = useCallback((next: ProductReviewsFilter) => {
    setFilter(next);
  }, []);

  const writeReviewEnabled = isProductFeatureEnabled('writeProductReview');

  const handleWrite = useCallback(() => {
    openWriteReviewGuarded(() => setWriteOpen(true), guard);
  }, [guard]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  // Mobile View All navigates to `/reviews` page — overlay is desktop-only.
  if (!isLaptop) {
    return null;
  }

  const displayCount = Math.max(totalCount, reviews.length);

  const body = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
        <ProductReviewsFeed
          filter={filter}
          onFilterChange={handleFilterChange}
          displayCount={displayCount}
          reviews={reviews}
          isFetchingReviews={isFetchingReviews}
          skeletonCount={pageSize}
          footer={
            <ProductReviewsInfiniteScrollTrigger
              hasMoreReviews={hasMoreReviews}
              isLoadingMoreReviews={isLoadingMoreReviews}
              onLoadMoreReviews={loadMoreReviews}
            />
          }
        />
      </div>
      {writeReviewEnabled ? (
        <div className="shrink-0 border-t border-[#efefef] px-6 pt-6 pb-8">
          <button
            type="button"
            className="h-12 w-full rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: productTokens.ink }}
            aria-label={productMessages.reviews.writeReview}
            onClick={handleWrite}
          >
            {productMessages.reviews.writeReview}
          </button>
        </div>
      ) : null}
    </>
  );

  const header = (
    <div className="flex shrink-0 items-center gap-3 border-b border-[#efefef] px-6 pt-8 pb-5">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center text-[#151515]"
        aria-label={productMessages.reviews.a11y.closeAllReviews}
        onClick={onClose}
      >
        ←
      </button>
      <h2 id="all-reviews-dialog-title" className="text-base font-semibold text-[#151515]">
        {productMessages.reviews.allReviewsTitle}
      </h2>
    </div>
  );

  // Fixed min height so filter loading skeletons don't shrink the dialog.
  const shellClass =
    'z-modal relative flex h-[min(720px,90dvh)] max-h-[90dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl bg-white';

  return createPortal(
    <>
      <div className="z-modal-backdrop fixed inset-0 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          aria-label={productMessages.reviews.a11y.closeAllReviews}
          onClick={onClose}
        />
        <div
          className={shellClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="all-reviews-dialog-title"
        >
          {header}
          {body}
        </div>
      </div>
      {writeReviewEnabled ? (
        <WriteReviewOverlay
          open={writeOpen}
          productId={productId}
          onClose={() => setWriteOpen(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
