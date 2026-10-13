import { CART_CACHE_MS } from '@/config/cart/cart.config';
import { readGuestCartSnapshot } from '@/lib/cart/guest-cart.local-data-source';
import {
  addCartLines,
  applyCartDiscountApi,
  checkItemInCartApi,
  clearCartApi,
  createBuyNowCartApi,
  fetchCartDiscountsApi,
  fetchCartStatsApi,
  getCurrentCart,
  removeCartLines,
  updateCartLines,
  validatePreCheckoutApi,
} from '@/services/cart/cart.service';
import { useCartStore } from '@/store/cart/cart.store';
import type { LoginType } from '@/types/auth/auth.types';
import {
  extractNumericId,
  formatVariantId,
  transformShopifyCart,
  type BuyNowCartResponse,
  type Cart,
  type CartDiscountApplyRequest,
  type CartDiscountApplyResult,
  type CartDiscountListRequest,
  type CartDiscountsData,
  type CartLineInput,
  type CartStats,
  type CheckItemInCartResponse,
  type PreCheckoutResponse,
  type ShopifyCart,
} from '@/types/cart';

let cachedShopifyCart: ShopifyCart | null = null;
let cachedAt = 0;
let cartLoadPromise: Promise<ShopifyCart> | null = null;

/** Clears in-memory cart cache (e.g. on logout or after mutations). */
export function invalidateCartCache(): void {
  cachedShopifyCart = null;
  cachedAt = 0;
  cartLoadPromise = null;
}

/**
 * Loads current cart with in-memory cache and in-flight deduplication.
 *
 * @param options - Optional cart type, or `force` to bypass cache.
 * @returns UI-friendly cart.
 */
export async function fetchCurrentCart(options?: {
  cartType?: string;
  force?: boolean;
}): Promise<Cart> {
  const cartType = options?.cartType ?? 'long_term';
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && cachedShopifyCart && now - cachedAt < CART_CACHE_MS) {
    return transformShopifyCart(cachedShopifyCart);
  }

  if (!force && cartLoadPromise) {
    const shopify = await cartLoadPromise;
    return transformShopifyCart(shopify);
  }

  cartLoadPromise = getCurrentCart(cartType).finally(() => {
    cartLoadPromise = null;
  });

  const shopifyCart = await cartLoadPromise;
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/** Options for repository cart-add helpers. */
export interface AddItemsOptions {
  attributes?: Array<Record<string, unknown>>;
  formatGid?: boolean;
  /** Pass `wait_for_shopify=true` on cart page adds. */
  waitForShopify?: boolean;
}

/**
 * Adds a single variant to cart and updates cache.
 *
 * @param variantId - Numeric or GID variant id (formatted unless `formatGid: false`).
 * @param quantity - Quantity to add.
 * @param options - Optional line attributes, GID formatting, and Shopify wait flag.
 * @returns Updated UI cart.
 */
export async function addItems(
  variantId: string,
  quantity = 1,
  options?: AddItemsOptions,
): Promise<Cart> {
  invalidateCartCache();
  const merchandiseId = options?.formatGid === false ? variantId : formatVariantId(variantId);
  const lines: CartLineInput[] = [
    {
      merchandiseId,
      quantity,
      attributes: options?.attributes?.length ? options.attributes : [{}],
    },
  ];
  const shopifyCart = await addCartLines(lines, {
    waitForShopify: options?.waitForShopify,
  });
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/**
 * Adds multiple lines in one API call.
 *
 * @param lines - Merchandise lines to add.
 * @param options - Optional Shopify wait flag.
 * @returns Updated UI cart.
 */
export async function addItemsBatch(
  lines: CartLineInput[],
  options?: Pick<AddItemsOptions, 'waitForShopify'>,
): Promise<Cart> {
  invalidateCartCache();
  const formatted = lines.map((line) => ({
    ...line,
    merchandiseId: line.merchandiseId.startsWith('gid://')
      ? line.merchandiseId
      : formatVariantId(line.merchandiseId),
    attributes: line.attributes?.length ? line.attributes : [{}],
  }));
  const shopifyCart = await addCartLines(formatted, {
    waitForShopify: options?.waitForShopify,
  });
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/** Single cart line mutation for batch apply. */
export type CartLineMutation =
  | { type: 'remove'; lineId: string }
  | { type: 'update'; lineId: string; quantity: number };

/** Updates a single line quantity and refreshes cache. */
export async function updateLineQuantity(lineId: string, quantity: number): Promise<Cart> {
  invalidateCartCache();
  const shopifyCart = await updateCartLines([{ id: lineId, quantity }], {
    waitForShopify: true,
  });
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/**
 * Applies batched line removes and updates (removes first, then updates).
 *
 * @param mutations - Ordered remove/update steps from clubbed cart planning.
 * @returns Updated UI cart after all mutations.
 */
export async function applyCartLineMutations(mutations: CartLineMutation[]): Promise<Cart> {
  if (mutations.length === 0) {
    return fetchCurrentCart({ force: true });
  }

  invalidateCartCache();

  const removeIds = mutations.filter((m) => m.type === 'remove').map((m) => m.lineId);
  const updates = mutations
    .filter((m): m is Extract<CartLineMutation, { type: 'update' }> => m.type === 'update')
    .map((m) => ({ id: m.lineId, quantity: m.quantity }));

  let shopifyCart: ShopifyCart;

  if (removeIds.length > 0) {
    shopifyCart = await removeCartLines(removeIds);
  } else {
    shopifyCart = await getCurrentCart();
  }

  if (updates.length > 0) {
    shopifyCart = await updateCartLines(updates, { waitForShopify: true });
  }

  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/**
 * Removes lines via API and returns updated cart.
 *
 * @param lineIds - Cart line ids to remove.
 */
export async function removeLines(lineIds: string[]): Promise<Cart> {
  invalidateCartCache();
  const shopifyCart = await removeCartLines(lineIds);
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/** Clears all cart lines and returns empty cart. */
export async function clearCart(): Promise<Cart> {
  invalidateCartCache();
  const shopifyCart = await clearCartApi();
  cachedShopifyCart = shopifyCart;
  cachedAt = Date.now();
  return transformShopifyCart(shopifyCart);
}

/** Delegates to pre-checkout stock validation API. */
export async function validatePreCheckout(): Promise<PreCheckoutResponse> {
  return validatePreCheckoutApi();
}

/**
 * Creates ephemeral buy-now cart (uses raw variant id, not GID).
 *
 * @param variantId - Variant id as required by buy-now API.
 * @param quantity - Quantity for buy-now line.
 */
export async function createBuyNowCart(
  variantId: string,
  quantity = 1,
  options?: { attributes?: Array<Record<string, unknown>> },
): Promise<BuyNowCartResponse> {
  const lines: CartLineInput[] = [
    {
      merchandiseId: variantId,
      quantity,
      attributes: options?.attributes?.length ? options.attributes : [{}],
    },
  ];
  return createBuyNowCartApi(lines);
}

/** Fetches header badge stats from API. */
export async function fetchCartStats(): Promise<CartStats> {
  return fetchCartStatsApi();
}

/** Checks if variant is in cart (PLP/PDP enrichment). */
export async function checkItemInCart(
  productId: string,
  variantId: string,
): Promise<CheckItemInCartResponse> {
  return checkItemInCartApi(productId, variantId);
}

/**
 * Lists cart discounts for the given cart id.
 *
 * @param payload - Discount list request body.
 * @returns Available and unavailable discounts.
 */
export async function fetchCartDiscounts(
  payload: CartDiscountListRequest,
): Promise<CartDiscountsData> {
  return fetchCartDiscountsApi(payload);
}

/**
 * Applies or removes coupon codes on the cart.
 *
 * @param payload - Discount apply body (`coupon_codes` to apply, `remove_coupon_codes` to remove).
 * @returns Apply result with appliedDiscounts and discountData totals.
 */
export async function applyCartDiscount(
  payload: CartDiscountApplyRequest,
  options?: { existingCart?: Cart | null },
): Promise<CartDiscountApplyResult> {
  const result = await applyCartDiscountApi(payload, options);
  if (result.cart) {
    invalidateCartCache();
  }
  return result;
}

/**
 * Resolves cart id for guest→user merge on KwikPass login.
 *
 * @param cart - Current Zustand cart or null.
 * @returns Cart id sent as `cart_id` in login body.
 */
export function resolveCartIdForLogin(cart: Cart | null | undefined): string | undefined {
  return cart?.id || undefined;
}

function guestCartHasItems(cart: Cart | null | undefined): boolean {
  return (cart?.items.length ?? 0) > 0;
}

function findMissingGuestLines(guestSnapshot: Cart, mergedCart: Cart): CartLineInput[] {
  const mergedVariantIds = new Set(
    mergedCart.items.map((item) => extractNumericId(item.product.variantId)),
  );

  return guestSnapshot.items
    .filter((item) => !mergedVariantIds.has(extractNumericId(item.product.variantId)))
    .map((item) => ({
      merchandiseId: item.product.variantId,
      quantity: item.quantity,
      attributes: [{}],
    }));
}

/**
 * Syncs cart after guest→authenticated login: GET merged cart, POST /add fallback, GET again.
 *
 * @param guestSnapshot - Guest cart captured before login (Zustand or localStorage).
 * @returns Authoritative user cart after backend merge and optional client replay.
 */
export async function mergeGuestCartAfterLogin(guestSnapshot: Cart | null): Promise<Cart> {
  invalidateCartCache();
  let cart = await fetchCurrentCart({ force: true });

  if (guestCartHasItems(guestSnapshot) && guestSnapshot) {
    const missingLines = findMissingGuestLines(guestSnapshot, cart);
    if (missingLines.length > 0) {
      cart = await addItemsBatch(missingLines);
      invalidateCartCache();
      cart = await fetchCurrentCart({ force: true });
    }
  }

  return cart;
}

/**
 * Resolves cart id for guest→user merge on login.
 *
 * When the guest had items, returns the pre-login guest cart id (snapshot preferred)
 * so the backend can merge — never pre-fetches a user cart before login completes.
 *
 * @param loginType - `checkout` may fetch when guest cart is empty.
 * @returns Cart id for login body, or undefined.
 */
export async function resolveCartIdForLoginFlow(
  loginType: LoginType = 'normal',
): Promise<string | undefined> {
  const storeCart = useCartStore.getState().cart;
  const snapshot = readGuestCartSnapshot();
  const guestHadItems = guestCartHasItems(storeCart) || guestCartHasItems(snapshot);

  if (guestHadItems) {
    return resolveCartIdForLogin(snapshot) ?? resolveCartIdForLogin(storeCart);
  }

  let cartId = resolveCartIdForLogin(storeCart);
  if (!cartId && loginType === 'checkout') {
    try {
      const cart = await fetchCurrentCart({ force: true });
      cartId = resolveCartIdForLogin(cart);
      useCartStore.getState().setCart(cart);
    } catch {
      // proceed without cart_id — backend falls back to Bearer + device_id
    }
  }

  return cartId;
}

/** Applies optimistic remove to local cart totals (UI-only until API confirms). */
export function applyOptimisticRemove(cart: Cart, lineId: string): Cart {
  const nextItems = cart.items.filter((item) => item.id !== lineId);
  const newSubtotal = nextItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const newTotalItems = nextItems.reduce((sum, item) => sum + item.quantity, 0);
  return {
    ...cart,
    items: nextItems,
    totalItems: newTotalItems,
    subtotal: newSubtotal,
    total: newSubtotal + cart.tax + cart.shipping - cart.discount,
  };
}

/** Applies optimistic quantity change and recalculates subtotal. */
export function applyOptimisticQuantity(cart: Cart, lineId: string, quantity: number): Cart {
  const updatedItems = cart.items.map((item) =>
    item.id === lineId ? { ...item, quantity, totalPrice: item.price * quantity } : item,
  );
  const newSubtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
  return {
    ...cart,
    items: updatedItems,
    totalItems: newTotalItems,
    subtotal: newSubtotal,
    total: newSubtotal + cart.tax + cart.shipping - cart.discount,
  };
}

/**
 * Applies optimistic add — merges quantity if variant exists, else adds placeholder line.
 *
 * @param cart - Current cart or null for first item.
 * @param variantId - Formatted variant GID.
 * @param quantity - Quantity to add.
 * @param productMeta - Optional product display fields for new line.
 */
export function applyOptimisticAdd(
  cart: Cart | null,
  variantId: string,
  quantity: number,
  productMeta?: Partial<Cart['items'][0]['product']>,
): Cart {
  const existing = cart?.items.find((item) => item.product.variantId === variantId);
  if (existing && cart) {
    return applyOptimisticQuantity(cart, existing.id, existing.quantity + quantity);
  }
  const lineId = `optimistic-${variantId}-${Date.now()}`;
  // Price unknown until API responds — never invent a line total here.
  const price = 0;
  const newItem: Cart['items'][0] = {
    id: lineId,
    product: {
      id: productMeta?.id ?? '',
      name: productMeta?.name ?? 'Product',
      primaryImage: productMeta?.primaryImage ?? '',
      handle: productMeta?.handle ?? '',
      variantId,
      variantTitle: productMeta?.variantTitle ?? '',
      product_category: productMeta?.product_category ?? 'product',
    },
    product_category: productMeta?.product_category ?? 'product',
    quantity,
    price,
    totalPrice: price * quantity,
    isAvailable: true,
  };
  const items = [...(cart?.items ?? []), newItem];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Keep prior cart-level totals. Recalculating from lines flashes ₹0 when pricing lives
  // on cart `price_calculations` (line totalPrice may be 0) or the placeholder adds nothing.
  if (cart) {
    return {
      ...cart,
      items,
      totalItems,
    };
  }

  return {
    id: '',
    checkoutUrl: '',
    items,
    totalItems,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    currency: 'INR',
  };
}
