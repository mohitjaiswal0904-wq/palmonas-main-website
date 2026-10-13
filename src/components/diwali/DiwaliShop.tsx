'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import { DiwaliSectionHeading } from '@/components/diwali/DiwaliSectionHeading';
import {
  DIWALI_OUTLINE_BUTTON_CLASS,
  DIWALI_SECTION_CLASS,
  DIWALI_SHOP_SECTION_ID,
} from '@/components/diwali/diwali-constants';
import { diwaliMessages, diwaliShopTabs } from '@/config/diwali/diwali.config';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';
import type { Product } from '@/types/product';

interface DiwaliShopProps {
  productsByTabId: Record<string, Product[]>;
}

/**
 * Offer tabs and one horizontal product rail for the active tab.
 */
export function DiwaliShop({ productsByTabId }: DiwaliShopProps) {
  const [activeTabId, setActiveTabId] = useState(diwaliShopTabs[0]?.id ?? '');
  const activeTab = useMemo(
    () => diwaliShopTabs.find((tab) => tab.id === activeTabId) ?? diwaliShopTabs[0],
    [activeTabId],
  );
  const products = activeTab ? (productsByTabId[activeTab.id] ?? []) : [];

  if (!activeTab) {
    return null;
  }

  return (
    <section
      id={DIWALI_SHOP_SECTION_ID}
      aria-labelledby="diwali-shop-heading"
      className={DIWALI_SECTION_CLASS}
    >
      <DiwaliSectionHeading
        eyebrow={diwaliMessages.shop.eyebrow}
        title={diwaliMessages.shop.title}
        titleId="diwali-shop-heading"
      />

      <div
        className={cn(
          'laptop:justify-center mt-4 flex gap-2 overflow-x-auto pb-1',
          HORIZONTAL_SCROLL_PASS_VERTICAL,
          '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        )}
        role="tablist"
        aria-label={diwaliMessages.a11y.shopTabs}
      >
        {diwaliShopTabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="diwali-shop-products"
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm',
                isActive
                  ? 'bg-[#7A1F2B] font-medium text-[#F6D38A]'
                  : 'border border-[#E8B84A] bg-white text-[#7A1F2B]',
              )}
              onClick={() => setActiveTabId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div id="diwali-shop-products" role="tabpanel" className="tab:-mx-6 laptop:-mx-8 -mx-4">
        {products.length > 0 ? (
          <CmsProductGrid
            products={products}
            collectionHandle={activeTab.handle}
            trackClassName="gap-2"
          />
        ) : null}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href={resolveCollectionPagePath(activeTab.handle)}
          className={DIWALI_OUTLINE_BUTTON_CLASS}
          aria-label={activeTab.viewAllLabel}
        >
          {activeTab.viewAllLabel}
        </Link>
      </div>
    </section>
  );
}
