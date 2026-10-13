'use client';

import { useRef, useState } from 'react';

import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import {
  HORIZONTAL_SCROLL_MOUSE,
  HORIZONTAL_SCROLL_PASS_VERTICAL,
} from '@/lib/layout/horizontal-scroll';
import {
  getSectionContentRecord,
  getSectionDisplayTitle,
  getVisibleButtons,
} from '@/lib/utils/cms-content';
import { transformCollectionProducts } from '@/lib/utils/cms-products';
import { cn } from '@/lib/utils/cn';
import type { CmsSection } from '@/types/cms';

interface ProductCollectionSectionProps {
  section: CmsSection;
}

export function ProductCollectionSection({ section }: ProductCollectionSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const maxProducts = typeof content.maxProducts === 'number' ? content.maxProducts : 20;
  const showViewAll = content.showViewAll === true;

  const tabs = getVisibleButtons(content).filter(
    (button) => button.action_type === 'collection' && Boolean(button.text),
  );

  const [activeTabId, setActiveTabId] = useState<string | undefined>(tabs[0]?.id);
  const tabScrollRef = useRef<HTMLDivElement>(null);
  useHorizontalMouseScroll(tabScrollRef, tabs.length > 0);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const products = transformCollectionProducts(activeTab?.products, maxProducts);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} />
      <div
        ref={tabScrollRef}
        className={cn(
          'scrollbar-hide tab:ml-0 tab:justify-center ml-[2vw] flex justify-start gap-2 overflow-x-auto',
          HORIZONTAL_SCROLL_PASS_VERTICAL,
          HORIZONTAL_SCROLL_MOUSE,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id ?? tab.text}
            type="button"
            aria-pressed={tab.id === activeTab?.id}
            className={cn(
              'mobile:py-2 mobile:text-sm shrink-0 rounded-full border-2 px-4 py-1.5 text-xs font-medium transition-colors',
              tab.id === activeTab?.id
                ? 'border-[#D3C8CA] bg-[#ECE2DF]'
                : 'border-[#E0E0E0] bg-[#FFFFFF] hover:bg-[#ECE2DF]',
            )}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.text}
          </button>
        ))}
      </div>
      <CmsProductGrid
        products={products}
        collectionHandle={activeTab?.action_value ?? undefined}
        viewAllHref={
          showViewAll && activeTab?.action_value
            ? `/collections/${activeTab.action_value}`
            : undefined
        }
      />
    </CmsSectionShell>
  );
}
