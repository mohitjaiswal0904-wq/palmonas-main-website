'use client';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { goldPriceSectionConfig, homeMessages } from '@/config/home/home.config';
import {
  getButtonGridColumns,
  getSectionContentRecord,
  getSectionDisplayTitle,
  getVisibleButtons,
} from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface ButtonGridSectionProps {
  section: CmsSection;
}

/**
 * Identify the gold homepage price shortcuts without relying on section order.
 *
 * @param title - Resolved CMS section title
 * @param actionValues - Collection paths attached to the section buttons
 * @returns Whether this is the gold Shop By Price section
 */
function isGoldShopByPriceSection(title: string, actionValues: Array<string | null | undefined>) {
  return (
    title.trim().toLocaleLowerCase('en-IN') ===
      goldPriceSectionConfig.sourceTitle.toLocaleLowerCase('en-IN') &&
    actionValues.some((value) => value?.startsWith(goldPriceSectionConfig.collectionPathPrefix))
  );
}

export function ButtonGridSection({ section }: ButtonGridSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const buttons = getVisibleButtons(content);
  const columns = getButtonGridColumns(content);
  const isGoldShopByPrice = isGoldShopByPriceSection(
    title,
    buttons.map((button) => button.action_value),
  );
  const displayTitle = isGoldShopByPrice ? homeMessages.labels.shopByPrice : title;
  const displayContent = isGoldShopByPrice
    ? {
        ...content,
        buttons: buttons.map((button) => ({
          ...button,
          background_color: 'transparent',
        })),
      }
    : content;

  if (buttons.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section} className="tab:px-0 container p-2">
      <CmsSectionHeader title={displayTitle} className="" />
      <CmsEmbeddedExtras
        content={{
          ...displayContent,
          columns,
        }}
        className="mt-0"
        buttonRowClassName="mx-0"
      />
    </CmsSectionShell>
  );
}
