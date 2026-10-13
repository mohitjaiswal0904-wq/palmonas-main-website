'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { createCustomPriceRangeOptionId, isPriceFilterGroup } from '@/lib/utils/product-filters';
import {
  countActiveFilters,
  createEmptyProductFilters,
  DEFAULT_PRODUCT_FILTER_GROUPS,
  type ProductFilterGroup,
  type ProductFilters,
  type ProductSortOption,
} from '@/types/product-listing';

interface ProductListingContextValue {
  sort: ProductSortOption;
  filters: ProductFilters;
  filterGroups: ProductFilterGroup[];
  activeFilterCount: number;
  setSort: (sort: ProductSortOption) => void;
  toggleFilter: (groupId: string, optionId: string) => void;
  setPriceRangeFilter: (groupId: string, min: number, max: number) => void;
  clearPriceRangeFilter: (groupId: string) => void;
  clearFilters: () => void;
  clearFilterGroup: (groupId: string) => void;
  commitFilters: (filters: ProductFilters) => void;
}

const ProductListingContext = createContext<ProductListingContextValue | null>(null);

interface ProductListingProviderProps {
  children: ReactNode;
  filterGroups?: ProductFilterGroup[];
  initialSort?: ProductSortOption;
  filters?: ProductFilters;
  sort?: ProductSortOption;
  onFiltersChange?: (filters: ProductFilters) => void;
  onSortChange?: (sort: ProductSortOption) => void;
}

export function ProductListingProvider({
  children,
  filterGroups = DEFAULT_PRODUCT_FILTER_GROUPS,
  initialSort = 'featured',
  filters: controlledFilters,
  sort: controlledSort,
  onFiltersChange,
  onSortChange,
}: ProductListingProviderProps) {
  const isFiltersControlled = controlledFilters !== undefined && onFiltersChange !== undefined;
  const isSortControlled = controlledSort !== undefined && onSortChange !== undefined;
  const [internalFilters, setInternalFilters] = useState<ProductFilters>(() =>
    createEmptyProductFilters(filterGroups),
  );
  const [internalSort, setInternalSort] = useState<ProductSortOption>(initialSort);
  const filters = isFiltersControlled ? controlledFilters : internalFilters;
  const sort = isSortControlled ? controlledSort : internalSort;

  const setFilters = useCallback(
    (nextFilters: ProductFilters) => {
      if (isFiltersControlled) {
        onFiltersChange(nextFilters);
        return;
      }

      setInternalFilters(nextFilters);
    },
    [isFiltersControlled, onFiltersChange],
  );

  const setSort = useCallback(
    (nextSort: ProductSortOption) => {
      if (isSortControlled) {
        onSortChange(nextSort);
        return;
      }

      setInternalSort(nextSort);
    },
    [isSortControlled, onSortChange],
  );

  const toggleFilter = useCallback(
    (groupId: string, optionId: string) => {
      const group = filterGroups.find((item) => item.id === groupId);
      const isPriceGroup = isPriceFilterGroup(group);
      const selected = filters[groupId] ?? [];

      if (isPriceGroup) {
        const nextSelected = selected.includes(optionId) ? [] : [optionId];

        setFilters({ ...filters, [groupId]: nextSelected });
        return;
      }

      const nextSelected = selected.includes(optionId)
        ? selected.filter((value) => value !== optionId)
        : [...selected, optionId];

      setFilters({ ...filters, [groupId]: nextSelected });
    },
    [filterGroups, filters, setFilters],
  );

  const setPriceRangeFilter = useCallback(
    (groupId: string, min: number, max: number) => {
      setFilters({
        ...filters,
        [groupId]: [createCustomPriceRangeOptionId(min, max)],
      });
    },
    [filters, setFilters],
  );

  const clearPriceRangeFilter = useCallback(
    (groupId: string) => {
      setFilters({ ...filters, [groupId]: [] });
    },
    [filters, setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters(createEmptyProductFilters(filterGroups));
  }, [filterGroups, setFilters]);

  const clearFilterGroup = useCallback(
    (groupId: string) => {
      setFilters({ ...filters, [groupId]: [] });
    },
    [filters, setFilters],
  );

  const commitFilters = useCallback(
    (nextFilters: ProductFilters) => {
      if (isFiltersControlled) {
        onFiltersChange(nextFilters);
        return;
      }

      setInternalFilters(nextFilters);
    },
    [isFiltersControlled, onFiltersChange],
  );

  const value = useMemo(
    () => ({
      sort,
      filters,
      filterGroups,
      activeFilterCount: countActiveFilters(filters),
      setSort,
      toggleFilter,
      setPriceRangeFilter,
      clearPriceRangeFilter,
      clearFilters,
      clearFilterGroup,
      commitFilters,
    }),
    [
      sort,
      filters,
      filterGroups,
      setSort,
      toggleFilter,
      setPriceRangeFilter,
      clearPriceRangeFilter,
      clearFilters,
      clearFilterGroup,
      commitFilters,
    ],
  );

  return <ProductListingContext.Provider value={value}>{children}</ProductListingContext.Provider>;
}

export function useProductListingControls(): ProductListingContextValue {
  const context = useContext(ProductListingContext);

  if (!context) {
    throw new Error('useProductListingControls must be used within ProductListingProvider');
  }

  return context;
}
