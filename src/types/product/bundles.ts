import type { ApiResponse } from '@/types/api';
import type { Product, ProductApiResponse } from '@/types/product';

/** Known PDP bundle rail keys from `/api/v2/shopify/product/{handle}/bundles`. */
export const PRODUCT_BUNDLE_KEYS = {
  COMPLETE_LOOK: 'complete_look_product',
  SHOP_THE_LOOK: 'shop_the_look',
  SAVE_WITH_THE_SET: 'save_with_the_set',
} as const;

export type ProductBundleKey = (typeof PRODUCT_BUNDLE_KEYS)[keyof typeof PRODUCT_BUNDLE_KEYS];

/** Raw bundle group from the product bundles API. */
export interface ProductBundleApiItem {
  key: string;
  title: string;
  count?: number;
  products?: ProductApiResponse[];
}

/** Raw product bundles payload (unwrapped). */
export interface ProductBundlesApiResponse {
  product_id?: string;
  handle?: string;
  bundles?: ProductBundleApiItem[];
}

export type ProductBundlesEnvelopeApiResponse = ApiResponse<ProductBundlesApiResponse> &
  ProductBundlesApiResponse;

/** Domain rail shown below similar products on the PDP. */
export interface ProductBundle {
  key: string;
  title: string;
  products: Product[];
}
