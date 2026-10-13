'use client';

import { useCallback, useMemo, useState } from 'react';

import { PincodeChecker } from '@/components/product/PincodeChecker';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductUsp } from '@/components/product/ProductUsp';
import { VariantSelector } from '@/components/product/VariantSelector';
import { GoldLimitedTimeOffer } from '@/components/product/gold/GoldLimitedTimeOffer';
import { Loader } from '@/components/ui/Loader';
import { productMessages, productTheme } from '@/config/product/product.config';
import { useMtoPrice } from '@/hooks/useMtoPrice';
import { resolveGoldShopperPrices } from '@/lib/product/gold-display-price';
import { resolveGoldLimitedTimeOffer } from '@/lib/product/gold-limited-time-offer';
import { hasGoldPriceBreakup } from '@/lib/product/gold-price-breakup';
import { resolveMakingChargesLabel } from '@/lib/product/making-charges-label';
import { buildGoldProductDetails } from '@/lib/utils/gold-product-details';
import { getDefaultVariant, isVariantInStock } from '@/lib/utils/variant-options';
import type { MtoPrice } from '@/types/mto-price';
import type { Product, ProductVariant } from '@/types/product';

const DEFAULT_GOLD_PURITY = '9k';

interface GoldProductInfoProps {
  product: Product;
  initialPrice?: MtoPrice;
  initialPriceSku?: string;
  /** Notifies the PDP sticky bar when the shopper changes colour/size. */
  onVariantChange?: (variant: ProductVariant | undefined) => void;
}

export function GoldProductInfo({
  product,
  initialPrice,
  initialPriceSku,
  onVariantChange,
}: GoldProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(() =>
    getDefaultVariant(product.variants),
  );

  const handleVariantChange = useCallback(
    (variant: ProductVariant | undefined) => {
      setSelectedVariant(variant);
      onVariantChange?.(variant);
    },
    [onVariantChange],
  );

  const sku = selectedVariant?.sku || product.variants[0]?.sku || undefined;
  const initialPriceForSku = sku && sku === initialPriceSku ? initialPrice : undefined;
  const { price, isLoading, error } = useMtoPrice(sku, DEFAULT_GOLD_PURITY, initialPriceForSku);
  const goldProductDetails = useMemo(
    () => buildGoldProductDetails(selectedVariant, price),
    [price, selectedVariant],
  );
  const makingChargesLabel = resolveMakingChargesLabel(price);
  const limitedOffer = resolveGoldLimitedTimeOffer(product.offers);
  const breakupPrice = error || !hasGoldPriceBreakup(price) ? undefined : price;
  const catalogPrice = selectedVariant?.price ?? product.price;
  const catalogCompareAt = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const shopperPrices = resolveGoldShopperPrices(price, catalogPrice, catalogCompareAt);

  return (
    <section className={productTheme.pdpRhythm.stackClass}>
      <ProductHeader
        product={product}
        price={shopperPrices.price}
        compareAtPrice={shopperPrices.compareAtPrice}
        makingChargesLabel={makingChargesLabel}
      />
      {limitedOffer ? <GoldLimitedTimeOffer offer={limitedOffer} /> : null}
      <VariantSelector
        variants={product.variants}
        productCategory={product.productCategory}
        onVariantChange={handleVariantChange}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {productMessages.goldPriceError}
        </p>
      ) : null}

      <PincodeChecker
        productCategory={product.productCategory}
        inStock={isVariantInStock(selectedVariant)}
      />
      <ProductUsp productCategory={product.productCategory} />
      <ProductAccordion
        product={product}
        goldProductDetails={goldProductDetails}
        mtoPrice={breakupPrice}
      />
    </section>
  );
}
