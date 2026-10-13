import { z } from 'zod';

/** Zod schema for add-to-cart line input sent to v2 API. */
export const CartLineInputSchema = z.object({
  merchandiseId: z.string(),
  quantity: z.number().int().positive(),
  attributes: z.array(z.record(z.unknown())).optional(),
});

/** Zod schema for cart line quantity/update payload. */
export const CartLineUpdateInputSchema = z.object({
  id: z.string(),
  quantity: z.number().int().min(0),
  merchandiseId: z.string().optional(),
  attributes: z.array(z.record(z.unknown())).optional(),
});

/** Zod schema for header badge stats API response. */
export const CartStatsApiResponseSchema = z.object({
  cart_id: z.string().optional(),
  cart_item_count: z.number(),
  wishlist_item_count: z.number(),
  total_items: z.number().optional(),
});
