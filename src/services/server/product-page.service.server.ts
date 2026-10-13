import 'server-only';

import { hasGoldPriceBreakup } from '@/lib/product/gold-price-breakup';
import { toClientProps } from '@/lib/utils/to-client-props';
import { getDefaultVariant } from '@/lib/utils/variant-options';
import { getMtoPrice } from '@/services/server/mto-price.service.server';
import { getProductByHandle } from '@/services/server/product.service.server';
import type { MtoPrice } from '@/types/mto-price';
import { PRODUCT_CATEGORY, type Product } from '@/types/product';

const DEFAULT_GOLD_PURITY = '9kt';

export interface ProductPageServerData {
  product: Product;
  initialGoldPrice?: MtoPrice;
  initialGoldPriceSku?: string;
}

/**
 * Loads PDP-critical SSR data only — product detail and default-variant gold price.
 * Related products and extra variant MTO prices load client-side after paint.
 *
 * @param handle - Product handle from the route.
 */
export async function getProductPageServerData(handle: string): Promise<ProductPageServerData> {
  const product = await getProductByHandle(handle);

  if (product.productCategory !== PRODUCT_CATEGORY.GOLD) {
    return toClientProps({ product });
  }

  const defaultVariant = getDefaultVariant(product.variants);
  const initialGoldPriceSku = defaultVariant?.sku || product.variants[0]?.sku;

  if (!initialGoldPriceSku) {
    return toClientProps({ product });
  }

  try {
    const initialGoldPrice = await getMtoPrice({
      sku: initialGoldPriceSku,
      purity: DEFAULT_GOLD_PURITY,
    });

    if (!hasGoldPriceBreakup(initialGoldPrice)) {
      return toClientProps({ product, initialGoldPriceSku });
    }

    return toClientProps({ product, initialGoldPrice, initialGoldPriceSku });
  } catch {
    return toClientProps({ product, initialGoldPriceSku });
  }
}
