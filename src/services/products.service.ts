import { fetchProducts, fetchProduct } from "@/lib/client/products.client";
import type { SearchResultData, SearchParams } from "@/types/search";
import type { ProductDetailData } from "@/types/product-detail";

export const productsService = {
  /** Search or list products. Returns the full result envelope. */
  async search(params: SearchParams = {}): Promise<SearchResultData> {
    const res = await fetchProducts(params);
    return res.data;
  },

  /** Fetch the full detail of one product by its numeric Shopify ID. */
  async getById(productId: string): Promise<ProductDetailData> {
    const res = await fetchProduct(productId);
    return res.data;
  },
};
