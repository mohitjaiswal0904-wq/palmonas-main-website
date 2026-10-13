/** Client-only — thin HTTP layer for cart v2 APIs. */
import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import {
  extractCartId,
  transformCartStats,
  type BuyNowCartResponse,
  type Cart,
  type CartDiscountApplyRequest,
  type CartDiscountApplyResult,
  type CartDiscountApplyUpdatedCart,
  type CartDiscountListRequest,
  type CartDiscountsData,
  type CartLineInput,
  type CartLineUpdateInput,
  type CartStats,
  type CartStatsApiResponse,
  type CheckItemInCartResponse,
  type PreCheckoutResponse,
  type ShopifyCart,
} from '@/types/cart';
import { transformDiscountApplyUpdatedCart } from '@/types/cart/cart.transforms';

interface BackendEnvelope<T> {
  status?: number;
  message?: string;
  data: T;
  timestamp?: string;
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as BackendEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return payload as T;
}

function normalizeShopifyCart(cart: ShopifyCart): ShopifyCart {
  return {
    ...cart,
    id: extractCartId(cart.id),
  };
}

/**
 * Fetches the current user's cart from v2 API.
 *
 * @param cartType - Cart persistence type (`long_term` default).
 * @returns Raw Shopify cart DTO.
 * @throws Normalised app error when the API request fails.
 */
export async function getCurrentCart(cartType = 'long_term'): Promise<ShopifyCart> {
  try {
    const { data } = await api.get<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.current, {
      params: { cart_type: cartType },
    });
    return normalizeShopifyCart(unwrapData<ShopifyCart>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/** Optional flags for cart add requests. */
export interface AddCartLinesOptions {
  /**
   * When true, asks the backend to wait for Shopify sync before responding
   * (`wait_for_shopify=true`). Use on the cart page so the returned cart is authoritative.
   */
  waitForShopify?: boolean;
}

/**
 * Adds one or more lines to the cart via v2 add API.
 *
 * @param lines - Variant GIDs and quantities.
 * @param options - Optional query flags (e.g. wait for Shopify on cart page).
 * @returns Updated raw Shopify cart.
 * @throws Normalised app error when the API request fails.
 */
export async function addCartLines(
  lines: CartLineInput[],
  options?: AddCartLinesOptions,
): Promise<ShopifyCart> {
  try {
    const body = lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      attributes: line.attributes?.length ? line.attributes : [{}],
    }));
    const { data } = await api.post<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.add, body, {
      params: options?.waitForShopify ? { wait_for_shopify: true } : undefined,
    });
    return normalizeShopifyCart(unwrapData<ShopifyCart>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/** Optional flags for cart update requests. */
export interface UpdateCartLinesOptions {
  /**
   * When true, asks the backend to wait for Shopify sync (`wait_for_shopify=true`),
   * same as storefront `/cart/update.js` completing before the response.
   */
  waitForShopify?: boolean;
}

/**
 * Updates cart line quantities via v2 update API.
 *
 * @param lines - Line ids and new quantities.
 * @param options - Optional query flags (wait for Shopify so checkout matches).
 * @returns Updated raw Shopify cart.
 * @throws Normalised app error when the API request fails.
 */
export async function updateCartLines(
  lines: CartLineUpdateInput[],
  options?: UpdateCartLinesOptions,
): Promise<ShopifyCart> {
  try {
    const { data } = await api.put<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.update, lines, {
      params: options?.waitForShopify ? { wait_for_shopify: true } : undefined,
    });
    return normalizeShopifyCart(unwrapData<ShopifyCart>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Removes cart lines by id via v2 remove API.
 *
 * @param lineIds - Shopify cart line ids to remove.
 * @returns Updated raw Shopify cart.
 * @throws Normalised app error when the API request fails.
 */
export async function removeCartLines(lineIds: string[]): Promise<ShopifyCart> {
  try {
    const { data } = await api.delete<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.remove, {
      data: lineIds,
    });
    return normalizeShopifyCart(unwrapData<ShopifyCart>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Clears all lines from the current cart.
 *
 * @returns Empty raw Shopify cart.
 * @throws Normalised app error when the API request fails.
 */
export async function clearCartApi(): Promise<ShopifyCart> {
  try {
    const { data } = await api.delete<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.clear);
    return normalizeShopifyCart(unwrapData<ShopifyCart>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Validates cart stock before checkout.
 *
 * @returns Pre-checkout validation result with per-line stock status.
 * @throws Normalised app error when the API request fails.
 */
export async function validatePreCheckoutApi(): Promise<PreCheckoutResponse> {
  try {
    const { data } = await api.get<BackendEnvelope<PreCheckoutResponse>>(
      ENDPOINTS.cart.preCheckout,
    );
    return unwrapData<PreCheckoutResponse>(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Creates an ephemeral buy-now cart for immediate checkout.
 *
 * @param lines - Variant ids (raw, not GID) and quantities.
 * @returns Buy-now cart with `idWithKey` for checkout provider.
 * @throws Normalised app error when the API request fails.
 */
export async function createBuyNowCartApi(lines: CartLineInput[]): Promise<BuyNowCartResponse> {
  try {
    const body = lines.map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: line.quantity,
      attributes: line.attributes?.length ? line.attributes : [{}],
    }));
    const { data } = await api.post<BackendEnvelope<BuyNowCartResponse>>(
      ENDPOINTS.cart.buyNow,
      body,
    );
    const cart = unwrapData<BuyNowCartResponse>(data);
    return {
      ...cart,
      id: extractCartId(cart.id),
    };
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches cart and wishlist item counts for header badge.
 *
 * @returns Transformed stats for `useCartStatsStore`.
 * @throws Normalised app error when the API request fails.
 */
export async function fetchCartStatsApi(): Promise<CartStats> {
  try {
    const { data } = await api.get<BackendEnvelope<CartStatsApiResponse>>(ENDPOINTS.cart.stats);
    return transformCartStats(unwrapData<CartStatsApiResponse>(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Checks whether a product variant is already in the user's cart.
 *
 * @param productId - Product id.
 * @param variantId - Variant id.
 * @returns In-cart flag and quantity.
 * @throws Normalised app error when the API request fails.
 */
export async function checkItemInCartApi(
  productId: string,
  variantId: string,
): Promise<CheckItemInCartResponse> {
  try {
    const { data } = await api.get<BackendEnvelope<CheckItemInCartResponse>>(
      ENDPOINTS.cart.checkItem,
      {
        params: { product_id: productId, variant_id: variantId },
      },
    );
    return unwrapData<CheckItemInCartResponse>(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches available and unavailable cart discounts for a cart.
 *
 * @param payload - Cart id and request metadata.
 * @returns Discount lists from the external discounts API.
 * @throws Normalised app error when the API request fails.
 */
export async function fetchCartDiscountsApi(
  payload: CartDiscountListRequest,
): Promise<CartDiscountsData> {
  try {
    const { data } = await api.post<BackendEnvelope<CartDiscountsData>>(
      ENDPOINTS.cart.discountList,
      payload,
    );
    const result = unwrapData<CartDiscountsData>(data);
    return {
      availableDiscounts: result.availableDiscounts ?? [],
      unavailableDiscounts: result.unavailableDiscounts ?? [],
    };
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Applies or removes coupon codes on a cart.
 *
 * @param payload - Cart id, `coupon_codes` and/or `remove_coupon_codes`, and request metadata.
 * @returns Applied coupon result with discountData totals (not list shape).
 * @throws Normalised app error when the API request fails.
 */
export async function applyCartDiscountApi(
  payload: CartDiscountApplyRequest,
  options?: { existingCart?: Cart | null },
): Promise<CartDiscountApplyResult> {
  try {
    const { data } = await api.post<
      BackendEnvelope<
        CartDiscountApplyResult & { updatedCart?: CartDiscountApplyUpdatedCart | null }
      >
    >(ENDPOINTS.cart.discountApply, payload);
    const result = unwrapData<
      CartDiscountApplyResult & { updatedCart?: CartDiscountApplyUpdatedCart | null }
    >(data);
    const updatedCart = result.updatedCart ?? null;
    return {
      appliedDiscounts: result.appliedDiscounts ?? [],
      applyFailures: result.applyFailures ?? [],
      removedDiscounts: result.removedDiscounts ?? [],
      removeFailures: result.removeFailures ?? [],
      discountData: result.discountData ?? null,
      updatedCart,
      cart: updatedCart
        ? transformDiscountApplyUpdatedCart(updatedCart, { existingCart: options?.existingCart })
        : null,
    };
  } catch (err) {
    throw normaliseError(err);
  }
}
