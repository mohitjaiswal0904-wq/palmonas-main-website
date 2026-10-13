'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { productListingMessages } from '@/config/product-listing/product-listing.config';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils/cn';
import { isFilterApplyCommit } from '@/lib/utils/filter-apply-commit';
import {
  clampPriceRange,
  clampPriceRangeExact,
  formatFilterCurrency,
  getFilterPriceBounds,
  getPriceRangeStepForGroup,
  isCustomPriceRangeOptionId,
  isFullPriceRange,
  parseCustomPriceRangeOptionId,
} from '@/lib/utils/product-filters';
import type { ProductFilterGroup } from '@/types/product-listing';

interface ProductPriceRangeFilterProps {
  group: ProductFilterGroup;
  selectedOptionIds: string[];
  onRangeChange: (min: number, max: number) => void;
  onRangeClear: () => void;
  onBucketToggle: (optionId: string) => void;
  optionLabelClassName?: string;
}

function getPriceInputClassName(sheetTypography: boolean): string {
  return cn(
    'border-palmonas-border bg-palmonas-surface text-palmonas-ink h-8 min-w-0 flex-1 rounded-full border text-center font-normal outline-none',
    sheetTypography
      ? 'font-nunito-sans px-2 text-xs'
      : 'mobile:h-9 mobile:px-2 mobile:text-xs tab:px-3 tab:text-sm px-2 text-[11px]',
  );
}

function parseCurrencyInput(value: string): number | undefined {
  const digits = value.replace(/[^\d]/g, '');

  if (!digits) {
    return undefined;
  }

  const parsed = Number.parseInt(digits, 10);

  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Keep the ₹ prefix visible while the user types digits (PW-622). */
function formatCurrencyInputDraft(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length > 0 ? `₹${digits}` : '₹';
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

/**
 * Positions the active track fill between the current min/max thumbs.
 *
 * @param minValue - Selected minimum price.
 * @param maxValue - Selected maximum price.
 * @param bounds - Filter group price bounds.
 * @returns Left/right percentages for the active fill bar.
 */
function getSliderActiveFillStyle(
  minValue: number,
  maxValue: number,
  bounds: { min: number; max: number },
): { left: string; right: string } {
  const rangeSpan = bounds.max - bounds.min;
  const minPercent = rangeSpan > 0 ? ((minValue - bounds.min) / rangeSpan) * 100 : 0;
  const maxPercent = rangeSpan > 0 ? ((maxValue - bounds.min) / rangeSpan) * 100 : 100;
  const left = Math.max(0, Math.min(100, minPercent));
  const right = Math.max(0, Math.min(100, 100 - maxPercent));

  return {
    left: `${left}%`,
    right: `${right}%`,
  };
}

/** Dual-thumb styles matching the filter design (white fill, taupe border). */
const SLIDER_INPUT_CLASS_NAME = [
  'pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent',
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4',
  '[&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-palmonas-filter',
  '[&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-none',
  '[&::-moz-range-track]:h-1 [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent',
  '[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent',
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:-mt-1.5',
  '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2',
  '[&::-webkit-slider-thumb]:border-palmonas-filter [&::-webkit-slider-thumb]:bg-white',
  '[&::-webkit-slider-thumb]:shadow-none',
].join(' ');

export function ProductPriceRangeFilter({
  group,
  selectedOptionIds,
  onRangeChange,
  onRangeClear,
  onBucketToggle,
  optionLabelClassName,
}: ProductPriceRangeFilterProps) {
  const { showError } = useToast();
  const bounds = useMemo(() => getFilterPriceBounds(group), [group]);
  const step = useMemo(() => getPriceRangeStepForGroup(group), [group]);
  const hasCustomRange = selectedOptionIds.some(isCustomPriceRangeOptionId);
  const selectedBucketId = selectedOptionIds.find(
    (optionId) => !isCustomPriceRangeOptionId(optionId),
  );
  const selectedBucket = selectedBucketId
    ? group.options.find((option) => option.id === selectedBucketId)
    : undefined;
  const selectedRange = useMemo(() => {
    if (hasCustomRange) {
      const customOptionId = selectedOptionIds.find(isCustomPriceRangeOptionId);
      const customRange = customOptionId
        ? parseCustomPriceRangeOptionId(customOptionId)
        : undefined;

      if (customRange) {
        return customRange;
      }
    }

    if (selectedBucket && typeof selectedBucket.min === 'number') {
      return {
        min: selectedBucket.min,
        max: selectedBucket.max ?? bounds.max,
      };
    }

    return bounds;
  }, [bounds, hasCustomRange, selectedBucket, selectedOptionIds]);
  const [minValue, setMinValue] = useState(selectedRange.min);
  const [maxValue, setMaxValue] = useState(selectedRange.max);
  const [minInput, setMinInput] = useState(formatFilterCurrency(selectedRange.min));
  const [maxInput, setMaxInput] = useState(formatFilterCurrency(selectedRange.max));
  const minValueRef = useRef(minValue);
  const maxValueRef = useRef(maxValue);

  useEffect(() => {
    minValueRef.current = minValue;
    maxValueRef.current = maxValue;
  }, [maxValue, minValue]);

  const revertEqualRangeInputs = useCallback(() => {
    setMinInput(formatFilterCurrency(minValueRef.current));
    setMaxInput(formatFilterCurrency(maxValueRef.current));
  }, []);

  const rejectEqualRange = useCallback(() => {
    showError(productListingMessages.filters.samePriceToast);
    revertEqualRangeInputs();
  }, [revertEqualRangeInputs, showError]);

  const applyRange = useCallback(
    (nextMin: number, nextMax: number, options?: { snap?: boolean; notifyEqual?: boolean }) => {
      if (nextMin === nextMax) {
        // Toast only on intentional input commit — not slider release or Apply blur (PW-623).
        if (options?.notifyEqual && !isFilterApplyCommit()) {
          rejectEqualRange();
        } else {
          revertEqualRangeInputs();
        }
        return;
      }

      const snap = options?.snap ?? true;
      const clamped = snap
        ? clampPriceRange(nextMin, nextMax, bounds, step)
        : clampPriceRangeExact(nextMin, nextMax, bounds);

      setMinValue(clamped.min);
      setMaxValue(clamped.max);
      setMinInput(formatFilterCurrency(clamped.min));
      setMaxInput(formatFilterCurrency(clamped.max));

      if (isFullPriceRange(clamped.min, clamped.max, bounds)) {
        onRangeClear();
        return;
      }

      onRangeChange(clamped.min, clamped.max);
    },
    [bounds, onRangeChange, onRangeClear, rejectEqualRange, revertEqualRangeInputs, step],
  );

  const handleMinChange = useCallback(
    (value: number) => {
      const clamped = clampPriceRange(value, maxValue, bounds, step);

      setMinValue(clamped.min);
      setMaxValue(clamped.max);
      setMinInput(formatFilterCurrency(clamped.min));
      setMaxInput(formatFilterCurrency(clamped.max));
    },
    [bounds, maxValue, step],
  );

  const handleMaxChange = useCallback(
    (value: number) => {
      const clamped = clampPriceRange(minValue, value, bounds, step);

      setMinValue(clamped.min);
      setMaxValue(clamped.max);
      setMinInput(formatFilterCurrency(clamped.min));
      setMaxInput(formatFilterCurrency(clamped.max));
    },
    [bounds, minValue, step],
  );

  const commitMinInput = useCallback(() => {
    const parsed = parseCurrencyInput(minInput);

    if (parsed === undefined) {
      setMinInput(formatFilterCurrency(minValue));
      return;
    }

    applyRange(parsed, maxValue, { snap: false, notifyEqual: true });
  }, [applyRange, maxValue, minInput, minValue]);

  const commitMaxInput = useCallback(() => {
    const parsed = parseCurrencyInput(maxInput);

    if (parsed === undefined) {
      setMaxInput(formatFilterCurrency(maxValue));
      return;
    }

    applyRange(minValue, parsed, { snap: false, notifyEqual: true });
  }, [applyRange, maxInput, maxValue, minValue]);

  const activeFillStyle = getSliderActiveFillStyle(minValue, maxValue, bounds);
  const sheetTypography = Boolean(optionLabelClassName);
  const priceInputClassName = getPriceInputClassName(sheetTypography);
  // Whole-number spacing: 8px sheet / 12px desktop sidebar.
  const sectionPadClassName = sheetTypography ? 'px-2' : 'tab:px-3 px-2';

  return (
    <div
      className={cn('box-border w-full max-w-full min-w-0', sheetTypography && 'font-nunito-sans')}
    >
      <div className={cn('box-border w-full max-w-full min-w-0 pt-4', sectionPadClassName)}>
        <div className="flex w-full max-w-full min-w-0 items-center gap-1.5">
          <label className="sr-only" htmlFor={`${group.id}-min-input`}>
            Minimum price for {group.label}
          </label>
          <input
            id={`${group.id}-min-input`}
            type="text"
            inputMode="numeric"
            value={minInput}
            onChange={(event) => setMinInput(formatCurrencyInputDraft(event.target.value))}
            onBlur={commitMinInput}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitMinInput();
              }
            }}
            className={priceInputClassName}
            aria-label={`Minimum price ${minInput}`}
          />
          <span
            className={cn(
              'text-palmonas-ink shrink-0 font-normal',
              sheetTypography
                ? 'font-nunito-sans text-xs'
                : 'mobile:text-xs tab:text-sm text-[11px]',
            )}
            aria-hidden="true"
          >
            -
          </span>
          <label className="sr-only" htmlFor={`${group.id}-max-input`}>
            Maximum price for {group.label}
          </label>
          <input
            id={`${group.id}-max-input`}
            type="text"
            inputMode="numeric"
            value={maxInput}
            onChange={(event) => setMaxInput(formatCurrencyInputDraft(event.target.value))}
            onBlur={commitMaxInput}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                commitMaxInput();
              }
            }}
            className={priceInputClassName}
            aria-label={`Maximum price ${maxInput}`}
          />
        </div>
      </div>

      {/*
        Full panel width. Native range thumbs sit with centers ~8px inset; a full-bleed
        track ends at the thumb outer edges so the bar reads end-to-end.
      */}
      <div
        className={cn(
          'relative mx-2 mt-5 mb-2 box-border h-4 max-w-full min-w-0 overflow-visible',
          !sheetTypography && 'tab:mt-6',
        )}
      >
        <div
          className="bg-palmonas-border absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
          aria-hidden="true"
        />
        <div
          className="bg-palmonas-filter absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={activeFillStyle}
          aria-hidden="true"
        />
        <label className="sr-only" htmlFor={`${group.id}-min-range`}>
          Minimum price slider for {group.label}
        </label>
        <input
          id={`${group.id}-min-range`}
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={minValue}
          onChange={(event) => handleMinChange(Number(event.target.value))}
          onMouseUp={() => applyRange(minValueRef.current, maxValueRef.current)}
          onTouchEnd={() => applyRange(minValueRef.current, maxValueRef.current)}
          className={SLIDER_INPUT_CLASS_NAME}
          aria-valuemin={bounds.min}
          aria-valuemax={bounds.max}
          aria-valuenow={minValue}
        />
        <label className="sr-only" htmlFor={`${group.id}-max-range`}>
          Maximum price slider for {group.label}
        </label>
        <input
          id={`${group.id}-max-range`}
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={1}
          value={maxValue}
          onChange={(event) => handleMaxChange(Number(event.target.value))}
          onMouseUp={() => applyRange(minValueRef.current, maxValueRef.current)}
          onTouchEnd={() => applyRange(minValueRef.current, maxValueRef.current)}
          className={SLIDER_INPUT_CLASS_NAME}
          aria-valuemin={bounds.min}
          aria-valuemax={bounds.max}
          aria-valuenow={maxValue}
        />
      </div>

      <ul className="border-palmonas-divider border-t">
        {group.options.map((option) => {
          const isSelected = !hasCustomRange && selectedOptionIds.includes(option.id);

          return (
            <li key={option.id}>
              <label
                className={cn(
                  optionLabelClassName ??
                    'text-palmonas-muted mobile:gap-2.5 mobile:text-xs tab:gap-3 tab:px-3 tab:text-sm text-[11px] font-normal',
                  'relative flex h-11 min-w-0 cursor-pointer items-center gap-2 overflow-hidden',
                  sheetTypography ? 'px-2' : 'tab:gap-3 tab:px-3 px-2',
                  isSelected ? 'bg-palmonas-filterSoft text-palmonas-ink' : 'bg-white',
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onBucketToggle(option.id)}
                  className="sr-only"
                  aria-label={`Filter by ${option.label}`}
                />
                <span
                  className={cn(
                    'border-palmonas-divider flex h-4 w-4 shrink-0 items-center justify-center border',
                    optionLabelClassName ? 'rounded' : 'rounded-sm',
                    isSelected && 'border-palmonas-filter bg-palmonas-filter text-palmonas-surface',
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? <SelectedCheckIcon /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate whitespace-nowrap">{option.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        Price range updated
      </p>
    </div>
  );
}
