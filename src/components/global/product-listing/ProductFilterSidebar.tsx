'use client';

import { useMemo, useState } from 'react';

import { ProductPriceRangeFilter } from '@/components/global/product-listing/ProductPriceRangeFilter';
import {
  PRODUCT_FILTER_CLEAR_ALL_CLASS,
  PRODUCT_FILTER_DESKTOP_TITLE_CLASS,
  PRODUCT_FILTER_GROUP_LABEL_CLASS,
  PRODUCT_FILTER_SHEET_CLOSE_BUTTON_CLASS,
  PRODUCT_FILTER_SHEET_COUNT_CLASS,
  PRODUCT_FILTER_SHEET_FOOTER_BUTTON_CLASS,
  PRODUCT_FILTER_SHEET_HEADER_CLASS,
  PRODUCT_FILTER_SHEET_HEADER_ROW_CLASS,
  PRODUCT_FILTER_SHEET_NAV_ACTIVE_CLASS,
  PRODUCT_FILTER_SHEET_NAV_INACTIVE_CLASS,
  PRODUCT_FILTER_SHEET_OPTION_CLASS,
  PRODUCT_FILTER_SHEET_ROOT_CLASS,
  PRODUCT_FILTER_TEXT_CLASS,
} from '@/components/global/product-listing/product-listing-classes';
import { productTokens } from '@/config/theme/product.tokens';
import { useProductListingControls } from '@/hooks/useProductListingControls';
import { cn } from '@/lib/utils/cn';
import { getFilterDisplayLabel, isPriceFilterGroup } from '@/lib/utils/product-filters';
import type { ProductFilterGroup, ProductFilterOption } from '@/types/product-listing';

interface ProductFilterSidebarProps {
  className?: string;
  variant?: 'sidebar' | 'sheet';
  showTitle?: boolean;
  onApply?: () => void;
  onClose?: () => void;
}

function SelectedCheckIcon() {
  return (
    <svg viewBox="0 0 12 8" className="h-2 w-3" aria-hidden="true">
      <path
        d="m1 3.8 3.1 3L11 1"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
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

function renderPriceRangeFilter(
  group: ProductFilterGroup,
  selectedOptions: string[],
  toggleFilter: (groupId: string, optionId: string) => void,
  setPriceRangeFilter: (groupId: string, min: number, max: number) => void,
  clearPriceRangeFilter: (groupId: string) => void,
  optionLabelClassName?: string,
) {
  return (
    <ProductPriceRangeFilter
      key={selectedOptions.join('|')}
      group={group}
      selectedOptionIds={selectedOptions}
      onRangeChange={(min, max) => setPriceRangeFilter(group.id, min, max)}
      onRangeClear={() => clearPriceRangeFilter(group.id)}
      onBucketToggle={(optionId) => toggleFilter(group.id, optionId)}
      optionLabelClassName={optionLabelClassName}
    />
  );
}

function getVisibleFilterGroups(
  groups: ProductFilterGroup[],
  variant: ProductFilterSidebarProps['variant'],
): ProductFilterGroup[] {
  if (variant === 'sheet') {
    return groups;
  }

  return groups.filter((group) => !isPriceFilterGroup(group));
}

function renderDesktopOptionChip(
  group: ProductFilterGroup,
  option: ProductFilterOption,
  selectedOptions: string[],
  toggleFilter: (groupId: string, optionId: string) => void,
) {
  const isSelected = selectedOptions.includes(option.id);

  return (
    <label key={option.id} className="relative inline-flex cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleFilter(group.id, option.id)}
        className="sr-only"
        aria-label={`Filter by ${getFilterDisplayLabel(option.label)}`}
      />
      <span
        className={cn(
          PRODUCT_FILTER_TEXT_CLASS,
          'border-palmonas-border bg-palmonas-surface inline-flex items-center rounded-full border px-3 py-1 whitespace-nowrap shadow-sm transition-colors',
          isSelected && cn(productTokens.offerFilterChip.selectedClass, 'shadow-none'),
        )}
      >
        {getFilterDisplayLabel(option.label)}
      </span>
    </label>
  );
}

function renderDesktopFilterGroup(
  group: ProductFilterGroup,
  selectedOptions: string[],
  toggleFilter: (groupId: string, optionId: string) => void,
) {
  return (
    <div key={group.id} className="flex w-full flex-col items-start gap-3">
      <p className={PRODUCT_FILTER_GROUP_LABEL_CLASS}>{getFilterDisplayLabel(group.label)}</p>
      <div className="flex w-full flex-wrap items-center gap-2">
        {group.options.map((option) =>
          renderDesktopOptionChip(group, option, selectedOptions, toggleFilter),
        )}
      </div>
    </div>
  );
}

export function ProductFilterSidebar({
  className,
  variant = 'sidebar',
  showTitle = true,
  onApply,
  onClose,
}: ProductFilterSidebarProps) {
  const {
    filterGroups,
    filters,
    toggleFilter,
    setPriceRangeFilter,
    clearPriceRangeFilter,
    clearFilters,
    activeFilterCount,
  } = useProductListingControls();
  const visibleFilterGroups = useMemo(
    () => getVisibleFilterGroups(filterGroups, variant),
    [filterGroups, variant],
  );
  const initialGroupId = visibleFilterGroups[0]?.id ?? '';
  const [activeGroupId, setActiveGroupId] = useState(initialGroupId);
  const resolvedActiveGroupId = visibleFilterGroups.some((group) => group.id === activeGroupId)
    ? activeGroupId
    : (visibleFilterGroups[0]?.id ?? '');
  const activeGroup = useMemo(
    () =>
      visibleFilterGroups.find((group) => group.id === resolvedActiveGroupId) ??
      visibleFilterGroups[0],
    [resolvedActiveGroupId, visibleFilterGroups],
  );

  if (visibleFilterGroups.length === 0) {
    return null;
  }

  if (variant === 'sheet') {
    return (
      <aside
        className={cn(
          PRODUCT_FILTER_SHEET_ROOT_CLASS,
          'bg-palmonas-surface flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-t-[20px]',
          className,
        )}
        aria-label="Filters"
      >
        <div className={cn(PRODUCT_FILTER_SHEET_HEADER_ROW_CLASS, 'bg-palmonas-surface')}>
          <h2 className={cn(PRODUCT_FILTER_SHEET_HEADER_CLASS, 'min-w-0 flex-1')}>Filter</h2>
          {onClose ? (
            <button
              type="button"
              className={PRODUCT_FILTER_SHEET_CLOSE_BUTTON_CLASS}
              onClick={onClose}
              aria-label="Close filters"
            >
              <CloseIcon />
            </button>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="border-palmonas-divider grid min-h-0 flex-1 grid-cols-[clamp(9rem,36vw,13rem)_minmax(0,1fr)] border-t">
            <nav
              className="h-full min-w-0 overflow-y-auto overscroll-contain"
              aria-label="Filter groups"
            >
              {visibleFilterGroups.map((group) => {
                const selectedCount = filters[group.id]?.length ?? 0;
                const isActive = group.id === activeGroup?.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={cn(
                      'border-palmonas-divider flex h-14 w-full items-center gap-1.5 overflow-hidden border-b bg-white px-3 text-left',
                      isActive
                        ? PRODUCT_FILTER_SHEET_NAV_ACTIVE_CLASS
                        : PRODUCT_FILTER_SHEET_NAV_INACTIVE_CLASS,
                    )}
                    onClick={() => setActiveGroupId(group.id)}
                    aria-pressed={isActive}
                  >
                    <span className="min-w-0 flex-1 whitespace-nowrap">
                      {getFilterDisplayLabel(group.label)}
                    </span>
                    {selectedCount > 0 ? (
                      <span className="bg-palmonas-filter text-palmonas-surface font-nunito-sans flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] leading-none font-bold">
                        {selectedCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>

            <div className="border-palmonas-divider box-border w-full max-w-full min-w-0 overflow-y-auto overscroll-contain border-l">
              {activeGroup ? (
                <fieldset className="w-full max-w-full min-w-0">
                  <legend className="sr-only">{getFilterDisplayLabel(activeGroup.label)}</legend>
                  {isPriceFilterGroup(activeGroup) ? (
                    renderPriceRangeFilter(
                      activeGroup,
                      filters[activeGroup.id] ?? [],
                      toggleFilter,
                      setPriceRangeFilter,
                      clearPriceRangeFilter,
                      PRODUCT_FILTER_SHEET_OPTION_CLASS,
                    )
                  ) : (
                    <ul>
                      {activeGroup.options.map((option) => {
                        const isSelected = filters[activeGroup.id]?.includes(option.id) ?? false;

                        return (
                          <li key={option.id}>
                            <label
                              className={cn(
                                PRODUCT_FILTER_SHEET_OPTION_CLASS,
                                // `relative` anchors the sr-only checkbox to its own row: without it
                                // focus-scroll drags the whole sheet out of view mid-list (PW-634).
                                'relative flex h-11 cursor-pointer items-center gap-2.5 overflow-hidden pr-3 pl-3',
                                isSelected ? 'bg-palmonas-filterSoft' : 'bg-white',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter(activeGroup.id, option.id)}
                                className="sr-only"
                                aria-label={`Filter by ${getFilterDisplayLabel(option.label)}`}
                              />
                              <span
                                className={cn(
                                  'border-palmonas-divider flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                  isSelected &&
                                    'border-palmonas-filter bg-palmonas-filter text-palmonas-surface',
                                )}
                                aria-hidden="true"
                              >
                                {isSelected ? <SelectedCheckIcon /> : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate whitespace-nowrap">
                                {getFilterDisplayLabel(option.label)}
                              </span>
                              {option.count !== undefined ? (
                                <span className={cn(PRODUCT_FILTER_SHEET_COUNT_CLASS, 'shrink-0')}>
                                  {option.count}
                                </span>
                              ) : null}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </fieldset>
              ) : null}
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2 px-4 pt-1 pb-4">
            <button
              type="button"
              className={cn(
                PRODUCT_FILTER_SHEET_FOOTER_BUTTON_CLASS,
                'border-palmonas-ink text-palmonas-ink flex h-11 items-center justify-center rounded-lg border',
              )}
              onClick={clearFilters}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
            <button
              type="button"
              className={cn(
                PRODUCT_FILTER_SHEET_FOOTER_BUTTON_CLASS,
                'bg-palmonas-ink text-palmonas-surface flex h-11 items-center justify-center rounded-lg',
              )}
              onClick={onApply}
              aria-label="Apply filters"
            >
              Apply
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        PRODUCT_FILTER_SHEET_ROOT_CLASS,
        'bg-palmonas-surface flex w-[350px] flex-col items-start gap-6',
        className,
      )}
      aria-label="Filters"
    >
      {showTitle ? (
        <div className="flex min-h-7 items-center justify-between gap-3 pb-5">
          <h2 className={PRODUCT_FILTER_DESKTOP_TITLE_CLASS}>Filters</h2>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              className={PRODUCT_FILTER_CLEAR_ALL_CLASS}
              onClick={clearFilters}
              aria-label="Clear all filters"
            >
              Clear All
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="flex w-full flex-col items-start gap-6">
        {visibleFilterGroups.map((group) =>
          renderDesktopFilterGroup(group, filters[group.id] ?? [], toggleFilter),
        )}
      </div>
    </aside>
  );
}
