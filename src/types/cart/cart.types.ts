/** Shopify discount application attached to a line allocation. */
export interface ShopifyCartLineDiscountApplication {
  type?: string;
  title?: string;
  value_type?: string;
  value?: number;
  target_type?: string;
  total_allocated_amount?: number;
}

/** Discount actually allocated to a cart line (`line_level_discount_allocations`). */
export interface ShopifyCartLineDiscountAllocation {
  amount: number;
  discount_application?: ShopifyCartLineDiscountApplication;
}

/** Raw line-level offer from cart GET `applicable_discounts`. */
export interface ShopifyCartLineApplicableDiscount {
  key?: string;
  name?: string;
  description?: string;
  code?: string;
  type?: string;
  discount_value?: number | null;
  discount_category?: string;
  collections?: string[];
  freebie_image_url?: string | null;
  freebie_route?: string | null;
}

/** Raw Shopify cart line from backend API. */
export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost?: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    amountPerQuantity?: {
      amount: string;
      currencyCode: string;
    };
  };
  tags?: string[];
  price_calculations?: {
    selling_price_per_unit?: number;
    selling_price_total?: number;
    mrp_per_unit?: number | null;
    mrp_total?: number | null;
    discount_per_unit?: number | null;
    discount_total?: number | null;
    currency_code?: string;
    is_free?: boolean;
  };
  /** Line-level offer savings from cart GET (paise or rupees per API). */
  line_level_total_discount?: number;
  /** Discounts actually allocated to this line from cart GET. */
  line_level_discount_allocations?: ShopifyCartLineDiscountAllocation[];
  /** Offers applicable to this line from cart GET. */
  applicable_discounts?: ShopifyCartLineApplicableDiscount[];
  merchandise: {
    id: string;
    title: string;
    priceV2?: {
      amount: string;
      currencyCode: string;
    };
    compareAtPriceV2?: {
      amount: string;
      currencyCode: string;
    };
    price?: { amount: string; currencyCode?: string } | number;
    availableForSale?: boolean;
    quantityAvailable?: number;
    product: {
      id?: string;
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
      };
      product_category?: string;
    };
  };
}

/** Raw Shopify cart from backend API. */
export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  lines: ShopifyCartLine[];
  banner?: string[];
  coupon_codes?: string[];
  discount_codes?: string[];
  coupon_code?: string;
  price_calculations?: {
    total_mrp?: number;
    total_selling_price?: number;
    total_discount?: number;
    mrp_discount?: number;
    subtotal_before_coupon?: number;
    coupon_discount?: number;
    payable_total?: number;
    currency_code?: string;
  };
}

/** UI offer badge for a cart line (from line `applicable_discounts`). */
export interface CartItemApplicableDiscount {
  /** Stable key from API (`key` or `code`). */
  key: string;
  /** Badge label — prefer API `name`. */
  label: string;
  /** Coupon / offer code when present. */
  code?: string;
}

/** Applied line discount from `line_level_discount_allocations`. */
export interface CartItemLineDiscountAllocation {
  /** Stable key — discount title/code. */
  key: string;
  /** Raw application title (often the coupon code). */
  title: string;
  /** Allocated amount from API (paise or rupees per payload). */
  amount: number;
  /** Shopify `value_type` when present (`percentage` | `fixed_amount`). */
  valueType?: string;
  /** Numeric discount value when the API sends one (percent or amount). */
  value?: number;
}

/** UI-friendly cart line item. */
export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    primaryImage: string;
    handle: string;
    variantId: string;
    variantTitle: string;
    product_category: string;
  };
  quantity: number;
  price: number;
  originalPrice?: number;
  product_category: string;
  totalPrice: number;
  isAvailable: boolean;
  /** True when line is a promotional freebie (B1G1, etc.). */
  isFree?: boolean;
  size?: string;
  color?: string;
  material?: string;
  /** Offer badges from line `applicable_discounts`. */
  applicableDiscounts?: CartItemApplicableDiscount[];
  /** Applied discounts from line `line_level_discount_allocations`. */
  lineDiscountAllocations?: CartItemLineDiscountAllocation[];
  /** Line-level discount total from API when present. */
  lineLevelTotalDiscount?: number;
}

/** Planned mutation for a clubbed cart display row (same SKU). */
export type ClubbedCartMutation =
  | { action: 'remove'; lineId: string }
  | { action: 'update'; lineId: string; quantity: number };

/** UI-friendly cart. */
export interface Cart {
  id: string;
  checkoutUrl: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  /** Cart MRP from API `price_calculations.total_mrp`. */
  totalMrp?: number;
  /** Product savings from API `price_calculations.mrp_discount`. */
  mrpDiscount?: number;
  /** Pre-coupon selling total from API `price_calculations.subtotal_before_coupon`. */
  sellingPrice?: number;
  /** Coupon savings from API `price_calculations.coupon_discount`. */
  couponDiscount?: number;
  /** Amount due from API `price_calculations.payable_total`. */
  payableTotal?: number;
  currency: string;
  banner?: string[];
  /** Coupon codes already applied on the cart (from GET cart). */
  appliedCouponCodes?: string[];
  coupon?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
  };
}

/** Aggregated price totals for cart summary UI. */
export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  totalItems: number;
  /** API `total_mrp`. */
  totalMrp: number;
  /** API `mrp_discount`. */
  mrpDiscount: number;
  /** API `subtotal_before_coupon`. */
  sellingPrice: number;
  /** API `coupon_discount`. */
  couponDiscount: number;
  /** API `payable_total`. */
  payableTotal: number;
}

/** Payload for adding a line via v2 cart add API. */
export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<Record<string, unknown>>;
}

/** Payload for updating an existing cart line quantity. */
export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  merchandiseId?: string;
  attributes?: Array<Record<string, unknown>>;
}

export interface PreCheckoutItem {
  line_id: string;
  variant_id: string;
  variant_title: string;
  product_title: string;
  quantity_in_cart: number;
  quantity_available: number;
  available_for_sale: boolean;
  stock_status: string;
  is_in_stock: boolean;
  max_available_quantity: number;
  message: string;
}

/** Result of checkout preparation — authoritative cart id for GoKwik. */
export interface CheckoutPrepareResult {
  cartId: string;
  isValid: boolean;
  preCheckout: PreCheckoutResponse;
  cart: Cart;
}

/** Pre-checkout stock validation response from v2 API. */
export interface PreCheckoutResponse {
  cart_id: string;
  is_valid: boolean;
  all_in_stock?: boolean;
  items: PreCheckoutItem[];
  out_of_stock_count?: number;
  low_stock_count?: number;
  total_items?: number;
  valid_items_count?: number;
  invalid_items_count?: number;
}

export interface BuyNowCartResponse {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: ShopifyCart['cost'];
  lines: ShopifyCartLine[];
  cartKey?: string;
  idWithKey: string;
  cart_type?: string;
  expires_at?: string;
  expires_in_minutes?: number;
}

export interface CartStatsApiResponse {
  cart_id?: string;
  cart_item_count: number;
  wishlist_item_count: number;
  total_items?: number;
}

export interface CartStats {
  cartCount: number;
  wishlistCount: number;
}

export interface CheckItemInCartResponse {
  is_in_cart: boolean;
  quantity: number;
}

/** Shared body fields for discount list/apply POSTs. */
export interface CartDiscountRequestBase {
  cart_id: string;
  platform_source: string;
  utm_details: string;
  request_id: string;
}

/** Body for listing cart discounts. */
export type CartDiscountListRequest = CartDiscountRequestBase;

/** Body for applying and/or removing cart discount codes. */
export interface CartDiscountApplyRequest extends CartDiscountRequestBase {
  /** Codes to apply. */
  coupon_codes?: string[];
  /** Codes to remove. */
  remove_coupon_codes?: string[];
}

/** Failure details for an unavailable store offer. */
export interface CartDiscountFailureData {
  reason?: string;
  productMissing?: boolean;
  amountMissing?: number | null;
  itemCountMissing?: number | null;
  missingEntitledDetails?: {
    collectionIds?: number[];
    itemCountMissing?: number;
  };
  missingPrerequisiteDetails?: {
    collectionIds?: number[];
    itemCountMissing?: number;
  };
}

/** Collection attached to an unavailable store offer (discount list API). */
export interface CartDiscountCollection {
  id: string;
  title: string;
  handle: string;
  image?: {
    id?: string | null;
    url?: string | null;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

/** Store coupon/offer from discount list/apply APIs. */
export interface CartStoreDiscount {
  offerType: 'store_offer';
  discountCode: string;
  discountDetail: string;
  additionalDetails?: Record<string, unknown>;
  sortOrder?: number;
  userType?: string;
  amountSaved?: number;
  discountType?: string[];
  highlighted?: boolean;
  kwikFlowsAbGroup?: string | null;
  utmData?: unknown;
  entitledProductHandles?: string[];
  entitledVariantHandles?: string[];
  entitledCollectionHandles?: string[];
  /** Entitled collections for unlock CTAs (unavailable offers). */
  collections?: CartDiscountCollection[];
  failure_data?: CartDiscountFailureData;
}

/** Payment/cashback offer from discount list/apply APIs. */
export interface CartPaymentDiscount {
  offerType: 'payment_offer';
  offerId?: string;
  discountCode: string;
  discountDetail: string;
  amountSaved?: number;
  cashbackAmount?: number;
  autoApply?: boolean;
  paymentMethod?: string[];
  tnc?: string;
  viewInListing?: boolean;
  paymentOfferTitle?: string;
  paymentOfferSubTitle?: string;
  offerCategory?: string;
  offerPartner?: string;
  offerTitle?: string;
  allowedInstruments?: string[];
  overrideBadgeText?: boolean;
  logoUrl?: string;
  validBanks?: string[] | null;
}

/** Available or unavailable discount entry (store or payment). */
export type CartDiscountOffer = CartStoreDiscount | CartPaymentDiscount;

/** `data` payload from discount list API. */
export interface CartDiscountsData {
  availableDiscounts: CartDiscountOffer[];
  unavailableDiscounts: CartDiscountOffer[];
}

/** Applied coupon entry from discount apply API. */
export interface CartAppliedDiscount {
  title: string;
  discount_amount: number;
  gwp_amount?: number;
  value_type?: string;
  discount_type?: string;
}

/** Failed coupon apply/remove entry from discount apply API. */
export interface CartDiscountApplyFailure {
  discount_code?: string;
  error_message?: string;
}

/** Totals block from discount apply API (`discountData`). */
export interface CartDiscountDataTotals {
  total_discount: number;
  total_price: number;
  cashback_data?: unknown;
  offer_type?: string;
  is_stackable?: boolean;
}

/** Legacy Shopify ajax cart line from discount apply `updatedCart`. */
export interface CartDiscountApplyUpdatedCartItem {
  id: number | string;
  key?: string;
  quantity: number;
  variant_id?: number | string;
  title?: string;
  product_title?: string;
  variant_title?: string;
  handle?: string;
  image?: string;
  featured_image?: { url?: string };
  product_id?: number | string;
  product_type?: string;
  price?: number;
  original_price?: number;
  discounted_price?: number;
  final_price?: number;
  line_price?: number;
  original_line_price?: number;
  final_line_price?: number;
  total_discount?: number;
  properties?: Record<string, unknown>;
  tags?: string[];
}

/** Legacy Shopify ajax cart from discount apply `updatedCart`. */
export interface CartDiscountApplyUpdatedCart {
  token?: string;
  item_count?: number;
  original_total_price?: number;
  total_price?: number;
  total_discount?: number;
  items?: CartDiscountApplyUpdatedCartItem[];
  discount?: {
    title?: string;
    total_discount?: number;
    order_discount?: number;
    total_price?: number;
    value_type?: string;
  };
}

/**
 * `data` payload from discount apply/clear API.
 * Shape differs from list — do not treat as available/unavailable lists.
 */
export interface CartDiscountApplyResult {
  appliedDiscounts: CartAppliedDiscount[];
  applyFailures: CartDiscountApplyFailure[];
  removedDiscounts: unknown[];
  removeFailures: CartDiscountApplyFailure[];
  discountData: CartDiscountDataTotals | null;
  /** Raw cart payload returned by apply/remove API. */
  updatedCart?: CartDiscountApplyUpdatedCart | null;
  /** UI cart transformed from `updatedCart` when present. */
  cart?: Cart | null;
}

/** Client-cached discount list plus applied store coupon state. */
export interface CartDiscountsState {
  availableDiscounts: CartDiscountOffer[];
  unavailableDiscounts: CartDiscountOffer[];
  /** Currently applied store coupon code, if any. */
  appliedCode: string | null;
  /** Coupon savings from apply `discountData.total_discount`. */
  appliedAmountSaved: number;
  /** Payable after coupon from apply `discountData.total_price`; null when none. */
  payableAfterDiscount: number | null;
}

/** Zustand/query loading state for cart mutations and fetches. */
export type CartStatus = 'idle' | 'loading' | 'refreshing' | 'error';

/** Cart mutation and refresh actions exposed by `useCart`. */
export interface CartActions {
  /** Adds variant to cart with optimistic UI and stats bump. */
  addItem: (
    variantId: string,
    quantity?: number,
    options?: { attributes?: Array<Record<string, unknown>> },
  ) => Promise<void>;
  /** Removes line by id; optimistic UI only (does not replace full cart from API). */
  removeItem: (lineId: string) => Promise<void>;
  /** Updates line quantity; delegates to remove when quantity is zero. */
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  /** Applies batched remove/update steps for clubbed same-SKU rows. */
  applyClubbedCartMutations: (mutations: ClubbedCartMutation[]) => Promise<void>;
  /** Clears all lines via API and resets stats. */
  clearCart: () => Promise<void>;
  /** Validates stock before checkout via pre-checkout API. */
  validateStock: () => Promise<PreCheckoutResponse>;
  /** Force-fetches cart, validates stock, and returns normalized GoKwik cart id. */
  prepareCheckout: () => Promise<CheckoutPrepareResult>;
  /** Force-refreshes cart from API with loading state. */
  refreshCart: () => Promise<void>;
  /** Refreshes cart without surfacing errors (background sync). */
  refreshCartSilent?: () => Promise<void>;
  /** Applies a store coupon code via discount apply API. */
  applyDiscount: (code: string, options?: { silent?: boolean }) => Promise<void>;
  /** Clears applied store coupon via discount apply API with empty codes. */
  removeDiscount: () => Promise<void>;
}

/** Return shape of `useCart` hook (Zustand + TanStack Query hybrid). */
export interface UseCartReturn {
  /** Display cart: Zustand optimistic state ?? query cache. */
  cart: Cart | null;
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  actions: CartActions;
  summary: CartSummary;
  isEmpty: boolean;
  /** False while refetching after auth when cart previously had items (avoids empty flash). */
  showEmpty: boolean;
  /** True while any line-item add/remove/update is in flight. */
  isMutating: boolean;
  checkoutUrl: string | null;
  /** Line id currently having quantity updated (stepper disabled). */
  updatingLineId: string | null;
  /** Line id currently being removed (stepper disabled). */
  removingLineId: string | null;
  /** True while guest→authenticated cart merge is in flight. */
  cartMergeInProgress: boolean;
  /** Discount list for cart/offers UI (null while not yet loaded). */
  discounts: CartDiscountsState | null;
  /** True while discount list is loading, or cart id is still resolving on cart routes. */
  discountsLoading: boolean;
  /** Discount list/apply error message. */
  discountsError: string | null;
  /** True while apply/remove discount mutation is in flight. */
  isDiscountMutating: boolean;
}
