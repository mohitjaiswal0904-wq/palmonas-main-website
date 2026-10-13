import { z } from 'zod';

import { ProductSchema } from '@/types/product';

export const WishlistCategoryFilterSchema = z.enum(['demifine', 'gold', 'silver', 'all']);

export type WishlistCategoryFilter = z.infer<typeof WishlistCategoryFilterSchema>;

export const WishlistItemSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  product: ProductSchema,
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export interface WishlistItemInput {
  productId: string;
}

export interface WishlistItemApi {
  product_id?: string | number;
  variant_id?: string | number;
  product?: Record<string, unknown>;
  id?: string | number;
  name?: string;
  handle?: string;
  imageUrl?: string;
  image_url?: string;
  product_category?: string;
  price?: number;
  originalPrice?: number;
  variants?: unknown[];
}

export interface WishlistApiResponse {
  status?: number;
  message?: string;
  data?: {
    items?: WishlistItemApi[];
    products?: WishlistItemApi[];
  };
  items?: WishlistItemApi[];
  products?: WishlistItemApi[];
}
