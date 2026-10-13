'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CartHeader } from '@/components/cart/CartHeader';
import { ProductReviewsFeed } from '@/components/product/ProductReviewsFeed';
import { ProductReviewsInfiniteScrollTrigger } from '@/components/product/ProductReviewsInfiniteScrollTrigger';
import { ProductReviewsListSkeleton } from '@/components/product/ProductReviewsListSkeleton';
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
import { buildProductReviewsPath } from '@/lib/product/product-reviews-path';
import type { Product } from '@/types/product';
import type { ProductReviewsFilter } from '@/types/product/reviews';

interface ProductReviewsPageContentProps {
  product: Product;
  initialFilter: ProductReviewsFilter;
}

/**
 * All Reviews page — cart-style header + feed (Figma 1043:51786 mobile; desktop list).
 */
export function ProductReviewsPageContent({
  product,
  initialFilter,
}: ProductReviewsPageContentProps) {
  const router = useRouter();
  const pageSize = productConfig.reviews.fullPageSize;
  const { guard } = useRequireAuth();
  const [filter, setFilter] = useState<ProductReviewsFilter>(initialFilter);
  const [writeOpen, setWriteOpen] = useState(false);

  const {
    reviews,
    hasMoreReviews,
    totalCount,
    isLoading,
    isFetchingReviews,
    isLoadingMoreReviews,
    loadMoreReviews,
    error,
  } = useProductReviews(product.id, pageSize, filter);

  // Keep URL in sync when filter changes so refresh/share preserves state.
  useEffect(() => {
    const nextPath = buildProductReviewsPath(product.handle, filter);
    router.replace(nextPath, { scroll: false });
  }, [filter, product.handle, router]);

  const handleFilterChange = useCallback((nextFilter: ProductReviewsFilter) => {
    setFilter(nextFilter);
  }, []);

  const writeReviewEnabled = isProductFeatureEnabled('writeProductReview');

  const handleWriteReview = useCallback(() => {
    openWriteReviewGuarded(() => setWriteOpen(true), guard);
  }, [guard]);

  if (!isProductFeatureEnabled('productReviews')) {
    return null;
  }

  const backHref = `/products/${product.handle}`;
  const displayCount = Math.max(totalCount, reviews.length);

  return (
    <div className="laptop:max-w-3xl mx-auto flex min-h-[70dvh] max-w-2xl flex-col px-4 pt-2 pb-8">
      <CartHeader title={productMessages.reviews.allReviewsTitle} backHref={backHref} />

      {isLoading && reviews.length === 0 ? (
        <ProductReviewsListSkeleton count={6} />
      ) : error ? (
        <p className="mt-6 text-center text-sm text-[#595959]">
          {productMessages.reviews.noMatchingReviews}
        </p>
      ) : (
        <>
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
          {writeReviewEnabled ? (
            <div className="sticky bottom-0 mt-auto border-t border-[#efefef] bg-white pt-6 pb-8">
              <button
                type="button"
                className="h-12 w-full rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: productTokens.ink }}
                aria-label={productMessages.reviews.writeReview}
                onClick={handleWriteReview}
              >
                {productMessages.reviews.writeReview}
              </button>
            </div>
          ) : null}
        </>
      )}

      {writeReviewEnabled && writeOpen ? (
        <WriteReviewOverlay
          open={writeOpen}
          productId={product.id}
          onClose={() => setWriteOpen(false)}
        />
      ) : null}
    </div>
  );
}
