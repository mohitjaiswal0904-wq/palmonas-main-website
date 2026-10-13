import {
  trackAddToCart,
  trackAddToCartClicked,
  trackBuyNowClicked,
} from '@/lib/analytics/analytics-trackers';
import type { Product } from '@/types/product';

const DEFAULT_CURRENCY = 'INR';

type ProductCartIdentity = Pick<Product, 'handle' | 'price'>;
type ProductCartSource = Pick<Product, 'handle' | 'name' | 'price'>;

/**
 * Tracks add-to-cart click intent for a catalog product.
 *
 * @param product - Product identity used in analytics payloads.
 * @param quantity - Quantity the shopper is adding.
 */
export function trackProductAddToCartClicked(product: ProductCartIdentity, quantity = 1): void {
  trackAddToCartClicked({
    product_id: product.handle,
    price: product.price,
    quantity,
  });
}

/**
 * Tracks a successful add-to-cart conversion for ads and product analytics.
 *
 * @param product - Product shown on the CTA.
 * @param variantId - Merchandise variant added to cart.
 * @param quantity - Quantity added.
 */
export function trackProductAddedToCart(
  product: ProductCartSource,
  variantId: string,
  quantity = 1,
): void {
  trackAddToCart(
    {
      product_id: product.handle,
      product_name: product.name,
      variant_id: variantId,
      price: product.price,
      quantity,
      currency: DEFAULT_CURRENCY,
    },
    { value: product.price, currency: DEFAULT_CURRENCY },
  );
}

/**
 * Tracks buy-now click intent for a catalog product.
 *
 * @param product - Product identity used in analytics payloads.
 */
export function trackProductBuyNowClicked(product: ProductCartIdentity): void {
  trackBuyNowClicked({
    product_id: product.handle,
    price: product.price,
  });
}
