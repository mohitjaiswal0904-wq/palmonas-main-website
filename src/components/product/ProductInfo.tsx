'use client';

import { useCallback, useState } from 'react';

// import { DemifineCashbackBanner } from '@/components/product/DemifineCashbackBanner';
import { DemifinePreDealsSection } from '@/components/product/DemifinePreDealsSection';
import { OfferBadges } from '@/components/product/OfferBadges';
import { PincodeChecker } from '@/components/product/PincodeChecker';
import { ProductAccordion } from '@/components/product/ProductAccordion';
import { ProductHeader } from '@/components/product/ProductHeader';
import { ProductUsp } from '@/components/product/ProductUsp';
import { VariantSelector } from '@/components/product/VariantSelector';
import { productTheme } from '@/config/product/product.config';
import { toSafeProductOffers } from '@/lib/product/safe-product-offers';
import { getDefaultVariant, isVariantInStock } from '@/lib/utils/variant-options';
import type { Product, ProductVariant } from '@/types/product';

interface ProductInfoProps {
  product: Product;
  /** Notifies the PDP sticky bar when the shopper changes colour/size. */
  onVariantChange?: (variant: ProductVariant | undefined) => void;
}

export function ProductInfo({ product, onVariantChange }: ProductInfoProps) {
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
  const selectedPrice = selectedVariant?.price ?? product.price;
  const selectedCompareAtPrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const offers = toSafeProductOffers(product.offers);

  return (
    <section className={productTheme.pdpRhythm.stackClass}>
      <ProductHeader
        product={product}
        price={selectedPrice}
        compareAtPrice={selectedCompareAtPrice}
        showTags={false}
      />
      <DemifinePreDealsSection
        quantityOrdered30Days={product.quantityOrdered30Days}
        tags={product.productTags}
        usps={product.usps}
      >
        {offers.length > 0 ? <OfferBadges offers={offers} /> : null}
      </DemifinePreDealsSection>
      <VariantSelector
        variants={product.variants}
        productCategory={product.productCategory}
        onVariantChange={handleVariantChange}
      />
      {/* <DemifineCashbackBanner /> */}
      <PincodeChecker
        productCategory={product.productCategory}
        inStock={product.availableForSale === false ? false : isVariantInStock(selectedVariant)}
      />
      {product.productCategory === 'gold' ? (
        <ProductUsp productCategory={product.productCategory} />
      ) : null}
      <ProductAccordion product={product} />
    </section>
  );
}
