'use client';

import { BannerSlideCarousel } from '@/components/cms/shared/BannerSlideCarousel';
import { CmsCardGrid } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { getBannerSlides } from '@/lib/utils/cms-banner-slides';
import { getSectionContentRecord, getVisibleButtons } from '@/lib/utils/cms-content';
import type { CmsSection } from '@/types/cms';

interface BannerSectionProps {
  section: CmsSection;
}

export function BannerSection({ section }: BannerSectionProps) {
  const content = getSectionContentRecord(section);
  const slides = getBannerSlides(section);
  const buttons = getVisibleButtons(content);

  if (slides.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <BannerSlideCarousel slides={slides} buttons={buttons} />
      <CmsCardGrid content={content} />
    </CmsSectionShell>
  );
}
