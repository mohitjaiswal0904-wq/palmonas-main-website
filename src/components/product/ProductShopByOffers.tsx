'use client';

import { useMemo, useState } from 'react';

import { ProductCarousel } from '@/components/global/product-listing';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { useShopByOfferProducts } from '@/hooks/useProducts';
import {
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import { toSafeProductOffers } from '@/lib/product/safe-product-offers';
import { cn } from '@/lib/utils/cn';
import { getShopByOfferTabs } from '@/lib/utils/offer';
import type { Product } from '@/types/product';

interface ProductShopByOffersProps {
  product: Product;
}

const HEADING_ID = 'shop-by-offers-heading';
const PANEL_ID = 'shop-by-offers-products';

/**
 * PDP Shop By Offers band: one tab per discount that has a collection, then that collection's products.
 */
export function ProductShopByOffers({ product }: ProductShopByOffersProps) {
  const tabs = useMemo(
    () => getShopByOfferTabs(toSafeProductOffers(product.offers)),
    [product.offers],
  );
  const [selectedKey, setSelectedKey] = useState(() => tabs[0]?.key ?? '');
  const selectedTab = tabs.find((tab) => tab.key === selectedKey) ?? tabs[0];
  const { products } = useShopByOfferProducts(selectedTab?.handle, product.id);

  if (tabs.length === 0 || !selectedTab) {
    return null;
  }

  return (
    <section
      className={productTheme.pdpRhythm.shopByOffersSectionClass}
      style={{ backgroundColor: productTheme.shopByOffers.surface }}
      aria-labelledby={HEADING_ID}
    >
      <h2
        id={HEADING_ID}
        className={cn(productTheme.shopByOffers.headingClass, themeFonts.sans.className)}
        style={{ color: productTheme.ink }}
      >
        {productMessages.shopByOffers}
      </h2>

      <div
        className={cn(
          productTheme.shopByOffers.tabRowClass,
          HORIZONTAL_SCROLL_PASS_VERTICAL,
          HORIZONTAL_SCROLLBAR_HIDDEN,
        )}
        role="tablist"
        aria-label={productMessages.a11y.shopByOffersTabs}
      >
        {tabs.map((tab) => {
          const isSelected = tab.key === selectedTab.key;

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={PANEL_ID}
              className={cn(productTheme.shopByOffers.tabClass, themeFonts.sans.className)}
              style={
                isSelected
                  ? {
                      backgroundColor: productTheme.ink,
                      borderColor: productTheme.ink,
                      color: productTheme.surfaceWhite,
                    }
                  : {
                      backgroundColor: productTheme.surfaceWhite,
                      borderColor: productTheme.shopByOffers.tabIdleBorder,
                      color: productTheme.shopByOffers.tabIdleText,
                    }
              }
              onClick={() => {
                setSelectedKey(tab.key);
              }}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      <div id={PANEL_ID} role="tabpanel" aria-labelledby={HEADING_ID}>
        {products.length > 0 ? (
          <ProductCarousel
            key={selectedTab.handle}
            products={products}
            ariaLabel={productMessages.a11y.shopByOffersProducts}
            className={productTheme.shopByOffers.carouselClass}
            itemClassName={productTheme.shopByOffers.itemClassName}
          />
        ) : null}
      </div>
    </section>
  );
}
