import { resolveCartPriceBreakdown } from '@/lib/cart/cart-price-breakdown';
import type {
  Cart,
  CartDiscountApplyFailure,
  CartDiscountApplyUpdatedCart,
  CartDiscountApplyUpdatedCartItem,
  CartItem,
  CartItemApplicableDiscount,
  CartItemLineDiscountAllocation,
  CartStats,
  CartStatsApiResponse,
  CartSummary,
  ShopifyCart,
  ShopifyCartLineApplicableDiscount,
  ShopifyCartLineDiscountAllocation,
} from '@/types/cart/cart.types';

/**
 * Returns true when a cart line is a promotional freebie.
 *
 * @param line - Raw Shopify cart line.
 */
export function isCartLineFreebie(line: ShopifyCart['lines'][number]): boolean {
  if (line.price_calculations?.is_free === true) {
    return true;
  }

  return (line.tags ?? []).some((tag) => tag.toLowerCase() === 'freenie');
}

/**
 * Maps line `applicable_discounts` into UI badge models (label from `name`).
 *
 * @param discounts - Raw applicable discounts from cart GET line.
 * @returns Deduped badges with stable keys; empty when none.
 */
export function transformLineApplicableDiscounts(
  discounts: ShopifyCartLineApplicableDiscount[] | undefined,
): CartItemApplicableDiscount[] {
  if (!discounts?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: CartItemApplicableDiscount[] = [];

  for (const discount of discounts) {
    const key = (discount.key ?? discount.code ?? '').trim();
    const label = (discount.name ?? discount.code ?? discount.key ?? '').trim();
    if (!key || !label || seen.has(key)) {
      continue;
    }
    seen.add(key);
    const code = discount.code?.trim();
    result.push({
      key,
      label,
      ...(code ? { code } : {}),
    });
  }

  return result;
}

/**
 * Maps line `line_level_discount_allocations` into UI models.
 *
 * @param allocations - Raw allocations from cart GET line.
 * @returns Deduped allocations with titles; empty when none.
 */
export function transformLineDiscountAllocations(
  allocations: ShopifyCartLineDiscountAllocation[] | undefined,
): CartItemLineDiscountAllocation[] {
  if (!allocations?.length) {
    return [];
  }

  const seen = new Set<string>();
  const result: CartItemLineDiscountAllocation[] = [];

  for (const allocation of allocations) {
    const title = (allocation.discount_application?.title ?? '').trim();
    if (!title || seen.has(title.toUpperCase())) {
      continue;
    }
    seen.add(title.toUpperCase());
    const valueType = allocation.discount_application?.value_type?.trim();
    const value = allocation.discount_application?.value;
    result.push({
      key: title,
      title,
      amount: allocation.amount,
      ...(valueType ? { valueType } : {}),
      ...(typeof value === 'number' ? { value } : {}),
    });
  }

  return result;
}

/**
 * Collects unique pre-applied coupon codes from GET cart payload.
 *
 * @param shopifyCart - Raw cart from v2 cart API.
 */
export function extractAppliedCouponCodes(shopifyCart: ShopifyCart): string[] {
  const codes = [
    ...(shopifyCart.coupon_codes ?? []),
    ...(shopifyCart.discount_codes ?? []),
    ...(shopifyCart.coupon_code ? [shopifyCart.coupon_code] : []),
  ]
    .map((code) => code.trim())
    .filter(Boolean);

  return [...new Set(codes)];
}

/**
 * Normalises a variant id to a Shopify ProductVariant GID for add-to-cart API calls.
 *
 * @param variantId - Numeric id or existing GID string.
 * @returns Shopify GID (`gid://shopify/ProductVariant/...`).
 */
export function formatVariantId(variantId: string): string {
  if (variantId.startsWith('gid://shopify/ProductVariant/')) {
    return variantId;
  }
  return `gid://shopify/ProductVariant/${variantId}`;
}

/**
 * Normalises cart id to Shopify Cart GID required by GoKwik checkout.
 *
 * @param cartId - Raw cart id or GID (may include `?key=` for buy-now carts).
 * @returns Cart GID in `gid://shopify/Cart/...` form.
 */
export function toShopifyCartGid(cartId: string): string {
  if (!cartId) return cartId;
  if (cartId.startsWith('gid://shopify/Cart/')) return cartId;
  return `gid://shopify/Cart/${cartId}`;
}

/**
 * Normalises cart id for GoKwik Scenario 2 checkout (`gid://shopify/Cart/...`).
 */
export function normalizeCartIdForGokwikCheckout(cartId: string): string {
  return toShopifyCartGid(extractCartId(cartId));
}

/**
 * @deprecated Use {@link normalizeCartIdForGokwikCheckout} — kept for backward compatibility.
 */
export function formatCartIdForGokwik(cartId: string, options?: { includeKey?: boolean }): string {
  if (!cartId) return cartId;
  const includeKey = options?.includeKey ?? false;
  const baseId = includeKey ? cartId : extractCartId(cartId);
  return toShopifyCartGid(baseId);
}

/**
 * Extracts the trailing numeric id from a Shopify GID.
 *
 * @param gid - Shopify global id string.
 * @returns Numeric id or original string when no match.
 */
export function extractNumericId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match?.[1] ?? gid;
}

/**
 * Strips query params from cart id (e.g. `?key=...`) returned by Shopify.
 *
 * @param cartId - Raw cart id from API.
 * @returns Cart id without query string.
 */
export function extractCartId(cartId: string): string {
  if (!cartId) return cartId;
  const index = cartId.indexOf('?');
  return index > 0 ? cartId.substring(0, index) : cartId;
}

/**
 * Maps cart stats API response to UI badge counts.
 *
 * @param api - Raw stats payload from `/api/v2/cart/stats`.
 * @returns Normalised cart and wishlist counts.
 */
export function transformCartStats(api: CartStatsApiResponse): CartStats {
  return {
    cartCount: api.cart_item_count ?? 0,
    wishlistCount: api.wishlist_item_count ?? 0,
  };
}

/**
 * Transforms raw Shopify cart DTO into UI-friendly `Cart` with computed line prices.
 *
 * @param shopifyCart - Raw cart from v2 cart API.
 * @returns Normalised cart for hooks and components.
 */
export function transformShopifyCart(shopifyCart: ShopifyCart): Cart {
  const subtotal = parseFloat(shopifyCart.cost.subtotalAmount.amount);
  const total = parseFloat(shopifyCart.cost.totalAmount.amount);
  const tax = shopifyCart.cost.totalTaxAmount
    ? parseFloat(shopifyCart.cost.totalTaxAmount.amount)
    : 0;
  const currency = shopifyCart.cost.totalAmount.currencyCode;
  const totalQuantity = shopifyCart.totalQuantity || 1;
  const fallbackUnitPrice = totalQuantity > 0 ? subtotal / totalQuantity : 0;

  const items: CartItem[] = shopifyCart.lines.map((line) => {
    const lineAny = line as {
      price_calculations?: {
        selling_price_total?: number;
        selling_price_per_unit?: number;
        mrp_per_unit?: number | null;
        mrp_total?: number | null;
        is_free?: boolean;
      };
      selling_price_total?: number;
      selling_price_per_unit?: number;
      unit_price?: number;
      tags?: string[];
    };
    const isFree = isCartLineFreebie(line);
    const merchAny = (line.merchandise || {}) as {
      price?: { amount?: string } | number;
      unit_price?: number;
    };

    let totalPrice = 0;
    if (isFree) {
      totalPrice = 0;
    } else if (line.cost?.totalAmount?.amount) {
      totalPrice = parseFloat(line.cost.totalAmount.amount);
    } else if (typeof lineAny.price_calculations?.selling_price_total === 'number') {
      totalPrice = lineAny.price_calculations.selling_price_total;
    } else if (typeof lineAny.selling_price_total === 'number') {
      totalPrice = lineAny.selling_price_total;
    }

    let price = 0;
    if (isFree) {
      price = 0;
    } else if (totalPrice > 0 && line.quantity > 0) {
      price = totalPrice / line.quantity;
    } else if (line.merchandise.priceV2?.amount) {
      price = parseFloat(line.merchandise.priceV2.amount);
      totalPrice = price * line.quantity;
    } else if (typeof lineAny.price_calculations?.selling_price_per_unit === 'number') {
      price = lineAny.price_calculations.selling_price_per_unit;
      totalPrice = price * line.quantity;
    } else if (typeof lineAny.selling_price_per_unit === 'number') {
      price = lineAny.selling_price_per_unit;
      totalPrice = price * line.quantity;
    } else if (typeof lineAny.unit_price === 'number') {
      price = lineAny.unit_price;
      totalPrice = price * line.quantity;
    } else if (typeof merchAny.price === 'number') {
      price = merchAny.price;
      totalPrice = price * line.quantity;
    } else if (typeof merchAny.price === 'object' && merchAny.price?.amount) {
      price = parseFloat(merchAny.price.amount);
      totalPrice = price * line.quantity;
    } else if (typeof merchAny.unit_price === 'number') {
      price = merchAny.unit_price;
      totalPrice = price * line.quantity;
    }

    let originalPrice: number | undefined;
    const pc = lineAny.price_calculations;
    if (pc?.mrp_per_unit != null) {
      originalPrice = pc.mrp_per_unit;
    } else if (pc?.mrp_total != null && line.quantity > 0) {
      originalPrice = pc.mrp_total / line.quantity;
    } else if (line.merchandise.compareAtPriceV2?.amount) {
      originalPrice = parseFloat(line.merchandise.compareAtPriceV2.amount);
    } else if (isFree && line.merchandise.priceV2?.amount) {
      originalPrice = parseFloat(line.merchandise.priceV2.amount);
    }

    if (!isFree && price <= 0 && fallbackUnitPrice > 0) {
      price = fallbackUnitPrice;
      totalPrice = price * line.quantity;
    }

    const productId = line.merchandise.product.id || line.merchandise.id || '';
    const productCategory =
      (line.merchandise.product.product_category || '').trim().toLowerCase() || 'product';

    return {
      id: line.id,
      product: {
        id: productId,
        name: line.merchandise.product.title || '',
        primaryImage: line.merchandise.product.featuredImage?.url || '',
        handle: line.merchandise.product.handle || '',
        variantId: line.merchandise.id,
        variantTitle: line.merchandise.title || '',
        product_category: productCategory,
      },
      product_category: productCategory,
      quantity: line.quantity,
      price,
      originalPrice,
      totalPrice,
      isAvailable: line.merchandise.availableForSale ?? true,
      isFree,
      applicableDiscounts: transformLineApplicableDiscounts(line.applicable_discounts),
      lineDiscountAllocations: transformLineDiscountAllocations(
        line.line_level_discount_allocations,
      ),
      ...(typeof line.line_level_total_discount === 'number'
        ? { lineLevelTotalDiscount: line.line_level_total_discount }
        : {}),
    };
  });

  const appliedCouponCodes = extractAppliedCouponCodes(shopifyCart);
  const breakdown = resolveCartPriceBreakdown(
    shopifyCart.price_calculations,
    {
      subtotal,
      total,
      discount: shopifyCart.price_calculations?.total_discount,
    },
    appliedCouponCodes[0],
  );

  return {
    id: extractCartId(shopifyCart.id),
    checkoutUrl: shopifyCart.checkoutUrl,
    items,
    totalItems: shopifyCart.totalQuantity,
    subtotal: breakdown.totalMrp,
    discount: breakdown.couponDiscount,
    shipping: 0,
    tax,
    total: breakdown.payableTotal,
    totalMrp: breakdown.totalMrp,
    mrpDiscount: breakdown.mrpDiscount,
    sellingPrice: breakdown.sellingPrice,
    couponDiscount: breakdown.couponDiscount,
    payableTotal: breakdown.payableTotal,
    currency,
    banner: shopifyCart.banner,
    appliedCouponCodes: appliedCouponCodes.length > 0 ? appliedCouponCodes : undefined,
    coupon:
      appliedCouponCodes[0] && breakdown.couponDiscount > 0
        ? {
            code: appliedCouponCodes[0],
            discount: breakdown.couponDiscount,
            type: 'fixed' as const,
          }
        : undefined,
  };
}

/**
 * Derives checkout summary totals from a cart (or zeroed defaults when null).
 *
 * @param cart - Current cart or null when empty/unloaded.
 * @returns Price breakdown for summary panel.
 */
export function cartToSummary(cart: Cart | null): CartSummary {
  if (!cart) {
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      totalItems: 0,
      totalMrp: 0,
      mrpDiscount: 0,
      sellingPrice: 0,
      couponDiscount: 0,
      payableTotal: 0,
    };
  }
  const lineSubtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotal = cart.subtotal > 0 ? cart.subtotal : lineSubtotal;
  const couponDiscount = cart.couponDiscount ?? 0;
  const payableTotal = cart.payableTotal ?? cart.total;
  const totalMrp = cart.totalMrp ?? subtotal;
  const sellingPrice = cart.sellingPrice ?? payableTotal + couponDiscount;
  const mrpDiscount = cart.mrpDiscount ?? Math.max(0, totalMrp - sellingPrice);
  return {
    subtotal,
    discount: cart.discount,
    shipping: cart.shipping,
    tax: cart.tax,
    total: cart.total,
    totalItems: cart.totalItems,
    totalMrp,
    mrpDiscount,
    sellingPrice,
    couponDiscount,
    payableTotal,
  };
}

/**
 * Reads the first user-facing message from discount apply failures.
 *
 * @param failures - `applyFailures` entries from discount apply API.
 * @returns Trimmed error message or null when none.
 */
export function resolveCartDiscountApplyFailureMessage(
  failures: ReadonlyArray<CartDiscountApplyFailure>,
): string | null {
  for (const failure of failures) {
    const message = failure.error_message?.trim();
    if (message) {
      return message;
    }
  }

  return null;
}

/** Converts legacy ajax-cart paise amounts to rupees. */
function paiseToRupees(amount: number): number {
  return amount / 100;
}

/**
 * Returns true when an apply `updatedCart` line is a promotional freebie.
 *
 * @param item - Legacy ajax cart line from discount apply API.
 */
function isApplyUpdatedCartItemFree(item: CartDiscountApplyUpdatedCartItem): boolean {
  const finalPrice = item.final_price ?? item.discounted_price ?? item.price ?? 0;
  if (finalPrice === 0) {
    return true;
  }

  return (item.tags ?? []).some((tag) => tag.toLowerCase() === 'freenie');
}

/**
 * Resolves stable cart line id from legacy ajax cart item.
 *
 * @param item - Legacy ajax cart line.
 */
function resolveApplyUpdatedCartLineId(item: CartDiscountApplyUpdatedCartItem): string {
  const key = item.key?.trim();
  if (key) {
    const withoutQuery = key.split('?')[0];
    return withoutQuery || key;
  }

  return String(item.id);
}

/**
 * Maps discount apply `updatedCart` (legacy ajax shape) into UI `Cart`.
 *
 * @param updatedCart - Raw cart from discount apply/remove API.
 * @param options - Existing cart metadata to preserve id and checkout URL.
 * @returns Normalised cart for hooks and components.
 */
export function transformDiscountApplyUpdatedCart(
  updatedCart: CartDiscountApplyUpdatedCart,
  options?: { existingCart?: Cart | null; currency?: string },
): Cart {
  const currency = options?.currency ?? options?.existingCart?.currency ?? 'INR';
  const items: CartItem[] = (updatedCart.items ?? []).map((item) => {
    const isFree = isApplyUpdatedCartItemFree(item);
    const quantity = item.quantity > 0 ? item.quantity : 1;
    const unitPricePaise = item.final_price ?? item.discounted_price ?? item.price ?? 0;
    const lineTotalPaise = item.final_line_price ?? item.line_price ?? unitPricePaise * quantity;
    const price = isFree ? 0 : paiseToRupees(unitPricePaise);
    const totalPrice = isFree ? 0 : paiseToRupees(lineTotalPaise);
    const originalPaise = item.original_price ?? item.price ?? 0;
    const originalPrice = paiseToRupees(originalPaise);
    const variantId = String(item.variant_id ?? item.id);

    return {
      id: resolveApplyUpdatedCartLineId(item),
      product: {
        id: String(item.product_id ?? variantId),
        name: item.product_title ?? item.title ?? '',
        primaryImage: item.image ?? item.featured_image?.url ?? '',
        handle: item.handle ?? '',
        variantId: formatVariantId(variantId),
        variantTitle: item.variant_title ?? '',
        product_category: (item.product_type ?? 'product').trim().toLowerCase() || 'product',
      },
      product_category: (item.product_type ?? 'product').trim().toLowerCase() || 'product',
      quantity,
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      totalPrice,
      isAvailable: true,
      isFree,
    };
  });

  const couponDiscount =
    updatedCart.discount?.order_discount ??
    updatedCart.discount?.total_discount ??
    (updatedCart.total_discount != null ? paiseToRupees(updatedCart.total_discount) : 0);
  const subtotal =
    updatedCart.original_total_price != null
      ? paiseToRupees(updatedCart.original_total_price)
      : items.reduce((sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity, 0);
  const total =
    updatedCart.discount?.total_price ??
    (updatedCart.total_price != null ? paiseToRupees(updatedCart.total_price) : undefined) ??
    Math.max(subtotal - couponDiscount, 0);
  const appliedCode = updatedCart.discount?.title?.trim();
  const breakdown = resolveCartPriceBreakdown(
    {
      total_mrp: subtotal,
      coupon_discount: couponDiscount,
      subtotal_before_coupon: total + couponDiscount,
      payable_total: total,
    },
    { subtotal, total, discount: couponDiscount },
    appliedCode,
  );

  return {
    id: options?.existingCart?.id ?? updatedCart.token ?? '',
    checkoutUrl: options?.existingCart?.checkoutUrl ?? '',
    items,
    totalItems: updatedCart.item_count ?? items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: breakdown.totalMrp,
    discount: breakdown.couponDiscount,
    shipping: 0,
    tax: 0,
    total: breakdown.payableTotal,
    totalMrp: breakdown.totalMrp,
    mrpDiscount: breakdown.mrpDiscount,
    sellingPrice: breakdown.sellingPrice,
    couponDiscount: breakdown.couponDiscount,
    payableTotal: breakdown.payableTotal,
    currency,
    appliedCouponCodes: appliedCode ? [appliedCode] : undefined,
    coupon:
      appliedCode && couponDiscount > 0
        ? {
            code: appliedCode,
            discount: couponDiscount,
            type: 'fixed' as const,
          }
        : undefined,
  };
}
