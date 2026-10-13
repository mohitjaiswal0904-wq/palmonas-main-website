'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ProductAllReviewsOverlay } from '@/components/product/ProductAllReviewsOverlay';
import { ProductReviewSummary } from '@/components/product/ProductReviewSummary';
import { ProductReviewsFeed } from '@/components/product/ProductReviewsFeed';
import { ProductReviewsSectionSkeleton } from '@/components/product/ProductReviewsListSkeleton';
import {
  WriteReviewOverlay,
  openWriteReviewGuarded,
} from '@/components/product/WriteReviewOverlay';
import {
  isProductFeatureEnabled,
  productConfig,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useProductReviews } from '@/hooks/product/useProductReviews';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  buildProductReviewsPath,
  DEFAULT_PRODUCT_REVIEWS_FILTER,
} from '@/lib/product/product-reviews-path';
import type { ProductReviewStarRating, ProductReviewsFilter } from '@/types/product/reviews';

interface ProductReviewsSectionProps {
  productId: string;
  productHandle: string;
}

/**
 * Full-width PDP ratings & reviews block (Figma desktop layout, stacked on mobile).
 */
export function ProductReviewsSection({ productId, productHandle }: ProductReviewsSectionProps) {
  const router = useRouter();
  const isLaptop = useMediaQuery('laptop');
  const pageSize = productConfig.reviews.pageSize;
  const { guard } = useRequireAuth();
  const [filter, setFilter] = useState<ProductReviewsFilter>(DEFAULT_PRODUCT_REVIEWS_FILTER);
  const [allReviewsOpen, setAllReviewsOpen] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);

  const { reviews, stats, hasMoreReviews, isLoading, isFetchingReviews, error } = useProductReviews(
    productId,
    pageSize,
    filter,
  );
  const handleFilterChange = useCallback((nextFilter: ProductReviewsFilter) => {
    setFilter(nextFilter);
  }, []);

  const handleSummaryRatingSelect = useCallback((rating: ProductReviewStarRating | undefined) => {
    if (rating === undefined) {
      setFilter(DEFAULT_PRODUCT_REVIEWS_FILTER);
      return;
    }

    setFilter({ kind: 'rating', rating });
  }, []);

  const writeReviewEnabled = isProductFeatureEnabled('writeProductReview');

  const handleWriteReview = useCallback(() => {
    openWriteReviewGuarded(() => setWriteOpen(true), guard);
  }, [guard]);

  /** Desktop → modal; mobile → dedicated All Reviews page (Figma 1043:51786). */
  const handleViewAll = useCallback(() => {
    if (isLaptop) {
      setAllReviewsOpen(true);
      return;
    }

    router.push(buildProductReviewsPath(productHandle, filter));
  }, [filter, isLaptop, productHandle, router]);

  // Restore document scroll when review overlays close (avoids stuck body lock on mobile).
  useEffect(() => {
    if (allReviewsOpen || writeOpen) {
      return undefined;
    }

    if (document.body.style.overflow === 'hidden') {
      document.body.style.removeProperty('overflow');
    }

    return undefined;
  }, [allReviewsOpen, writeOpen]);

  if (!isProductFeatureEnabled('productReviews')) {
    return null;
  }

  if (isLoading && !stats) {
    return <ProductReviewsSectionSkeleton />;
  }

  if (error || !stats || stats.reviewsCount <= 0) {
    return null;
  }

  const displayCount = stats.reviewsCount;
  const showViewAllLink =
    hasMoreReviews || stats.reviewsCount > reviews.length || stats.reviewsCount > pageSize;
  const activeRating = filter.kind === 'rating' ? filter.rating : undefined;

  return (
    <section
      className={productTheme.pdpRhythm.reviewsSectionClass}
      aria-labelledby="product-reviews-heading"
    >
      <h2
        id="product-reviews-heading-desktop"
        className={`laptop:block hidden ${productTokens.reviews.desktopSectionTitle}`}
        style={{ color: productTheme.ink }}
      >
        {productMessages.reviews.sectionTitle}
      </h2>
      <div className="laptop:mt-8 laptop:flex laptop:gap-14 mt-0">
        <ProductReviewSummary
          stats={stats}
          selectedRating={activeRating}
          onRatingSelect={handleSummaryRatingSelect}
          onWriteReview={writeReviewEnabled ? handleWriteReview : undefined}
        />
        <ProductReviewsFeed
          filter={filter}
          onFilterChange={handleFilterChange}
          displayCount={displayCount}
          reviews={reviews}
          isFetchingReviews={isFetchingReviews}
          skeletonCount={pageSize}
          footer={
            showViewAllLink ? (
              <div className="flex justify-center pt-6">
                <button
                  type="button"
                  className="rounded-full border border-[#d4d4d4] px-6 py-2.5 text-sm font-medium text-[#151515]"
                  aria-label={productMessages.reviews.viewAll}
                  onClick={handleViewAll}
                >
                  {productMessages.reviews.viewAll}
                </button>
              </div>
            ) : null
          }
        />
      </div>

      {allReviewsOpen ? (
        <ProductAllReviewsOverlay
          open={allReviewsOpen}
          productId={productId}
          initialFilter={filter}
          onClose={() => setAllReviewsOpen(false)}
        />
      ) : null}
      {writeReviewEnabled && writeOpen ? (
        <WriteReviewOverlay
          open={writeOpen}
          productId={productId}
          onClose={() => setWriteOpen(false)}
        />
      ) : null}
    </section>
  );
}
