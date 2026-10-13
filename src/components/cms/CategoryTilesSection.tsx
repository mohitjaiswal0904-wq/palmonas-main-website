'use client';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import {
  getSectionContentRecord,
  getSectionDisplayTitle,
  getVisibleButtons,
  getVisibleCards,
} from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface CategoryTilesSectionProps {
  section: CmsSection;
}

export function CategoryTilesSection({ section }: CategoryTilesSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const buttons = getVisibleButtons(content);
  const cards = getVisibleCards(content);

  if (buttons.length === 0 && cards.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} />
      <CmsEmbeddedExtras content={content} className="mt-0" />
    </CmsSectionShell>
  );
}
