import type { ProductListResponse } from '@/types/product';
import type {
  ProductFilterGroup,
  ProductFilters,
  ProductSortOption,
} from '@/types/product-listing';

export interface SearchResultsData {
  query: string;
  productsPages: ProductListResponse[];
  productsPageSize: number;
  /** Highest API page number included in this batch response. */
  loadedPageCount: number;
  /** 1-based batch index from the URL `page` param (each batch loads up to 5 API pages). */
  loadedBatchIndex: number;
  hasMoreProducts: boolean;
  nextCursor?: string;
  filters: ProductFilters;
  sort: ProductSortOption;
  filterGroups: ProductFilterGroup[];
  totalResults: number;
}
