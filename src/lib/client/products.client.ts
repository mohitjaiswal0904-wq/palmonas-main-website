import { apiFetch } from "./base";
import type { ApiResponse } from "@/types/api";
import type { SearchResultData, SearchParams } from "@/types/search";
import type { ProductDetailData } from "@/types/product-detail";

/** Search / list products. Pass an empty object to get the default listing. */
export function fetchProducts(params: SearchParams = {}): Promise<ApiResponse<SearchResultData>> {
  const qs = new URLSearchParams();
  // The backend expects the search term under `query` (not `q`).
  if (params.q) qs.set("query", params.q);
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<SearchResultData>(`/products/search${query ? `?${query}` : ""}`);
}

/** Fetch full detail for a single product by numeric Shopify product ID. */
export function fetchProduct(productId: string): Promise<ApiResponse<ProductDetailData>> {
  return apiFetch<ProductDetailData>(`/product/${productId}`);
}
