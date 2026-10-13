'use client';

import { useEffect, useRef, useState } from 'react';

import {
  PRODUCT_FILTER_SHEET_CLOSE_BUTTON_CLASS,
  PRODUCT_FILTER_SHEET_HEADER_CLASS,
  PRODUCT_FILTER_SHEET_HEADER_ROW_CLASS,
  PRODUCT_FILTER_SHEET_OPTION_CLASS,
  PRODUCT_FILTER_SHEET_ROOT_CLASS,
  PRODUCT_FILTER_TEXT_CLASS,
} from '@/components/global/product-listing/product-listing-classes';
import { useProductListingControls } from '@/hooks/useProductListingControls';
import { cn } from '@/lib/utils/cn';
import { PRODUCT_SORT_OPTIONS } from '@/types/product-listing';

interface ProductSortSelectProps {
  className?: string;
  id?: string;
  variant?: 'select' | 'sheet';
  onClose?: () => void;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SortChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ProductSortSelect({
  className,
  id = 'product-sort',
  variant = 'select',
  onClose,
}: ProductSortSelectProps) {
  const { sort, setSort } = useProductListingControls();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedSortLabel =
    PRODUCT_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Popular';

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

  if (variant === 'sheet') {
    return (
      <section
        className={cn(
          PRODUCT_FILTER_SHEET_ROOT_CLASS,
          'w-full overflow-hidden rounded-t-[20px] bg-white',
          className,
        )}
        aria-label="Sort products"
      >
        <div className={cn(PRODUCT_FILTER_SHEET_HEADER_ROW_CLASS, 'rounded-t-[20px] bg-white')}>
          <h2 className={cn(PRODUCT_FILTER_SHEET_HEADER_CLASS, 'min-w-0 flex-1')}>Sort By</h2>
          {onClose ? (
            <button
              type="button"
              className={PRODUCT_FILTER_SHEET_CLOSE_BUTTON_CLASS}
              onClick={onClose}
              aria-label="Close sort"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>
        <div className="border-t border-[#d9d9d9]">
          {PRODUCT_SORT_OPTIONS.map((option) => {
            const isSelected = option.value === sort;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  PRODUCT_FILTER_SHEET_OPTION_CLASS,
                  'flex h-[58px] w-full items-center border-b border-[#d9d9d9] px-4 py-5 text-left',
                  isSelected && 'border-b-transparent bg-[#ece2df] font-bold',
                )}
                onClick={() => {
                  setSort(option.value);
                  onClose?.();
                }}
                aria-pressed={isSelected}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('font-nunito-sans relative inline-flex items-center', className)}
    >
      <button
        id={id}
        type="button"
        className="border-palmonas-border relative box-border flex cursor-pointer items-center rounded-[10px] border bg-[#F6F6F6] px-4 py-[7px]"
        aria-label="Sort products"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={cn(PRODUCT_FILTER_TEXT_CLASS, 'shrink-0')} aria-hidden="true">
          Sort By:
        </span>
        <span
          className={cn(PRODUCT_FILTER_TEXT_CLASS, 'ml-[10px] min-w-0 flex-1 truncate')}
          aria-hidden="true"
        >
          {selectedSortLabel}
        </span>
        <span className="ml-[10px] shrink-0" aria-hidden="true">
          <SortChevronIcon />
        </span>
      </button>
      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Sort products"
          className="border-palmonas-border z-dropdown absolute top-[calc(100%+4px)] right-0 w-[193px] overflow-hidden rounded-[10px] border bg-white shadow-md"
        >
          {PRODUCT_SORT_OPTIONS.map((option) => {
            const isSelected = option.value === sort;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    PRODUCT_FILTER_TEXT_CLASS,
                    'flex w-full items-center px-4 py-3 text-left',
                    isSelected && 'bg-palmonas-filterSoft font-bold',
                  )}
                  onClick={() => {
                    setSort(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
