/** Parameters passed to checkout provider when opening hosted checkout. */
export interface CheckoutOpenParams {
  /** Cart id (with key for buy-now ephemeral carts). */
  cartId: string;
  /** Checkout entry point for analytics and stub messaging. */
  source: 'cart' | 'buy_now';
  /** UTM params appended to checkout URL. */
  utmParams?: Record<string, string>;
  /** Shopify hosted checkout URL used for force/fallback redirect. */
  checkoutUrl?: string;
}

/** Vendor-agnostic checkout port (GoKwik or Shopify redirect). */
export interface CheckoutProviderPort {
  /**
   * Opens hosted checkout for the given cart.
   *
   * @param params - Cart id, source, optional UTM params, and optional Shopify checkout URL.
   */
  openCheckout: (params: CheckoutOpenParams) => Promise<void>;
}
