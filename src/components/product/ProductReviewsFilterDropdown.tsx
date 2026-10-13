'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { ReviewSortChevronIcon } from '@/components/icons/review-icons';
import { ProductReviewsRatingFilter } from '@/components/product/ProductReviewsRatingFilter';
import { productMessages } from '@/config/product/product.config';
import { DEFAULT_PRODUCT_REVIEWS_FILTER } from '@/lib/product/product-reviews-path';
import type {
  ProductReviewPeriod,
  ProductReviewStarRating,
  ProductReviewsFilter,
} from '@/types/product/reviews';

const PERIOD_OPTIONS: ProductReviewPeriod[] = [
  'most_recent',
  'last_3_months',
  'last_6_months',
  'all',
];

interface ProductReviewsFilterDropdownProps {
  filter: ProductReviewsFilter;
  onFilterChange: (filter: ProductReviewsFilter) => void;
}

/**
 * Combined period + star-rating filters in one dropdown; only one mode is active at a time.
 */
export const ProductReviewsFilterDropdown = forwardRef<
  HTMLDivElement,
  ProductReviewsFilterDropdownProps
>(function ProductReviewsFilterDropdown({ filter, onFilterChange }, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  // Close on outside click so the panel behaves like a standard dropdown.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /** Switch to the default Most Relevant filter (5-star reviews). */
  const handleRelevantSelect = useCallback(() => {
    onFilterChange({ kind: 'relevant' });
    setIsOpen(false);
  }, [onFilterChange]);

  /** Switch to a time-period filter and drop any star-rating filter. */
  const handlePeriodSelect = useCallback(
    (period: ProductReviewPeriod) => {
      onFilterChange({ kind: 'period', period });
      setIsOpen(false);
    },
    [onFilterChange],
  );

  /** Switch to a star-rating filter and drop any time-period filter. */
  const handleRatingSelect = useCallback(
    (rating: ProductReviewStarRating | undefined) => {
      if (rating === undefined) {
        onFilterChange(DEFAULT_PRODUCT_REVIEWS_FILTER);
        setIsOpen(false);
        return;
      }

      onFilterChange({ kind: 'rating', rating });
      setIsOpen(false);
    },
    [onFilterChange],
  );

  const triggerLabel =
    filter.kind === 'rating'
      ? productMessages.reviews.formatRatingFilterTrigger(filter.rating)
      : filter.kind === 'relevant'
        ? productMessages.reviews.mostRelevant
        : productMessages.reviews.periods[filter.period];

  const activeRating = filter.kind === 'rating' ? filter.rating : undefined;

  return (
    <div ref={setContainerRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm text-[#151515]"
        aria-label={productMessages.reviews.a11y.filterDropdown}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{triggerLabel}</span>
        <ReviewSortChevronIcon
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label={productMessages.reviews.a11y.filterDropdown}
          className="z-dropdown absolute top-[calc(100%+4px)] right-0 w-[min(100vw-2rem,18rem)] rounded-lg border border-[#e0e0e0] bg-white p-3 shadow-md"
        >
          <p className="text-xs font-semibold tracking-wide text-[#595959] uppercase">
            {productMessages.reviews.periodSectionLabel}
          </p>
          <ul
            className="mt-2 list-none"
            role="listbox"
            aria-label={productMessages.reviews.a11y.periodFilter}
          >
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={filter.kind === 'relevant'}
                className={`flex w-full rounded-md px-2 py-2 text-left text-sm text-[#151515] ${
                  filter.kind === 'relevant' ? 'bg-[#faf7f4] font-semibold' : 'font-normal'
                }`}
                onClick={handleRelevantSelect}
              >
                {productMessages.reviews.mostRelevant}
              </button>
            </li>
            {PERIOD_OPTIONS.map((option) => {
              const isSelected = filter.kind === 'period' && filter.period === option;

              return (
                <li key={option} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`flex w-full rounded-md px-2 py-2 text-left text-sm text-[#151515] ${
                      isSelected ? 'bg-[#faf7f4] font-semibold' : 'font-normal'
                    }`}
                    onClick={() => handlePeriodSelect(option)}
                  >
                    {productMessages.reviews.periods[option]}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 text-xs font-semibold tracking-wide text-[#595959] uppercase">
            {productMessages.reviews.ratingSectionLabel}
          </p>
          <div className="mt-2">
            <ProductReviewsRatingFilter value={activeRating} onChange={handleRatingSelect} />
          </div>
        </div>
      ) : null}
    </div>
  );
});
