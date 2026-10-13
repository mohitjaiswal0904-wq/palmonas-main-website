import type { PaginationMeta } from "./api";

/* ---------- sub-shapes ---------- */

export interface DiscountPlaceholder {
  text: string;
  style: "normal" | "bold";
}

export interface Discount {
  key: string;
  name: string;
  description: string;
  code: string;
  type: "PERCENTAGE" | "FREEBIE" | "DISCOUNT";
  discount_value: number | null;
  placeholder: DiscountPlaceholder[];
}

export interface SearchVariant {
  id: string;
  sku: string;
  name: string;
  title: string;
  color: string | string[];
  price: number;
  compareAtPrice: number;
  availableForSale: boolean;
  isSelected: boolean;
  selectedOptions: { name: string; value: string }[];
}

export interface SearchProductBanner {
  text: string;
  backgroundColor: string;
  textColor: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface SearchProductBadge {
  backgroundColor: string;
  textColor: string;
  starColor?: string;
  moreOffersTextColor?: string;
  position?: string;
}

/** Product shape as returned by /products/search. */
export interface SearchProduct {
  id: string;
  name: string;
  imageUrl: string;
  product_type: string;
  product_category: string;
  price: number;
  originalPrice: number;
  color: string[];
  discounts: Discount[];
  rating: number;
  reviews: { avg_rating: number; review_count: number };
  variants: SearchVariant[];
  productType: string;
  banner?: SearchProductBanner;
  discountBadge?: SearchProductBadge;
  ratingBadge?: SearchProductBadge;
  delivery: {
    text: string;
    buttonText: string;
    buttonBackgroundColor: string;
    buttonTextColor: string;
    textColor: string;
  };
  priceStyle: {
    currentPriceColor: string;
    originalPriceColor: string;
    currencySymbolColor: string;
  };
  titleStyle: { textColor: string; fontWeight: string };
  cart: { is_in_cart: boolean; quantity: number };
  in_wishlist: boolean;
}

export interface SearchFilters {
  [key: string]: string | string[] | undefined;
}

export interface SearchResultData extends PaginationMeta {
  query: string | null;
  products: SearchProduct[];
  current_filters: SearchFilters;
  available_filters: { filters: unknown[] };
}

export interface SearchParams {
  q?: string;
  cursor?: string;
  limit?: number;
}
