'use client';

import { CmsCardGrid } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import {
  getSectionContentRecord,
  getSectionDisplayTitle,
  getVisibleCards,
} from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface CardGridSectionProps {
  section: CmsSection;
}

export function CardGridSection({ section }: CardGridSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const cards = getVisibleCards(content);

  if (cards.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section} className="mt-4">
      {title ? <CmsSectionHeader title={title} /> : null}
      <CmsCardGrid content={content} className="tab:pt-8 pt-2" />
    </CmsSectionShell>
  );
}
