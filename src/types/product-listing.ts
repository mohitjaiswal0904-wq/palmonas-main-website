import type { ProductFilterApiInput } from '@/types/product-filters';

export const PRODUCT_SORT_OPTIONS = [
  { value: 'featured', label: 'Popular' },
  { value: 'new-arrivals', label: 'New Arrivals' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-desc', label: 'Price High To Low' },
  { value: 'price-asc', label: 'Price Low To High' },
  { value: 'name-asc', label: 'Alphabetically A - Z' },
  { value: 'name-desc', label: 'Alphabetically Z - A' },
] as const;

export type ProductSortOption = (typeof PRODUCT_SORT_OPTIONS)[number]['value'];

/**
 * Alternate sort values accepted from legacy links and external clients.
 *
 * These are kept separate from `PRODUCT_SORT_OPTIONS` so the sort dropdown
 * does not render duplicate choices for the same backend order.
 */
export const PRODUCT_SORT_ALIASES = [
  'price-low-high',
  'price_asc',
  'price-high-low',
  'price_desc',
  'a-z',
  'name_asc',
  'z-a',
  'name_desc',
  'newest',
  'just_launched',
  'best-sellers',
  'best_selling',
  'trending',
  'rating',
] as const;

export type ProductSortAlias = (typeof PRODUCT_SORT_ALIASES)[number];

export interface ProductFilterGroup {
  id: string;
  label: string;
  options: ProductFilterOption[];
  min?: number;
  max?: number;
}

export interface ProductFilterOption {
  id: string;
  label: string;
  value?: string;
  count?: number;
  min?: number;
  max?: number;
  input?: ProductFilterApiInput;
}

export const DEFAULT_PRODUCT_FILTER_GROUPS: ProductFilterGroup[] = [
  {
    id: 'category',
    label: 'Category',
    options: [
      { id: 'rings', label: 'Rings' },
      { id: 'earrings', label: 'Earrings' },
      { id: 'necklaces', label: 'Necklaces' },
      { id: 'bracelets', label: 'Bracelets' },
    ],
  },
  {
    id: 'price',
    label: 'Price',
    options: [
      { id: 'under-2000', label: 'Under ₹2,000' },
      { id: '2000-5000', label: '₹2,000 – ₹5,000' },
      { id: 'over-5000', label: 'Over ₹5,000' },
    ],
  },
];

export type ProductFilters = Record<string, string[]>;

export function countActiveFilters(filters: ProductFilters): number {
  return Object.values(filters).reduce((total, values) => total + values.length, 0);
}

export function createEmptyProductFilters(groups: ProductFilterGroup[]): ProductFilters {
  return Object.fromEntries(groups.map((group) => [group.id, []]));
}
