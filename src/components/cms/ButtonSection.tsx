'use client';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import {
  getSectionContentRecord,
  getSectionDisplayTitle,
  getVisibleButtons,
} from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface ButtonSectionProps {
  section: CmsSection;
}

export function ButtonSection({ section }: ButtonSectionProps) {
  const content = getSectionContentRecord(section);
  const title = getSectionDisplayTitle(section);
  const buttons = getVisibleButtons(content);

  if (buttons.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} />
      <CmsEmbeddedExtras content={content} className="mt-0" />
    </CmsSectionShell>
  );
}
