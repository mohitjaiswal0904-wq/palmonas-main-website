import { create } from "zustand";
import type { SearchProduct, SearchParams, SearchResultData } from "@/types/search";
import type { ProductDetailData } from "@/types/product-detail";
import { productsService } from "@/services/products.service";

interface ProductsState {
  results: SearchProduct[];
  meta: Omit<SearchResultData, "products"> | null;
  detail: Record<string, ProductDetailData>;
  loading: boolean;
  error: string | null;

  search: (params?: SearchParams) => Promise<void>;
  fetchDetail: (productId: string) => Promise<void>;
  reset: () => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  results: [],
  meta: null,
  detail: {},
  loading: false,
  error: null,

  async search(params = {}) {
    set({ loading: true, error: null });
    try {
      const data = await productsService.search(params);
      const { products, ...meta } = data;
      set({ results: products, meta, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async fetchDetail(productId) {
    if (get().detail[productId]) return;
    set({ loading: true, error: null });
    try {
      const data = await productsService.getById(productId);
      set((state) => ({
        detail: { ...state.detail, [productId]: data },
        loading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  reset() {
    set({ results: [], meta: null, error: null });
  },
}));
