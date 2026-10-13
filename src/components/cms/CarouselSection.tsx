'use client';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { CmsSlideCarousel } from '@/components/cms/shared/CmsSlideCarousel';
import { getSectionContentRecord, getSectionDisplayTitle } from '@/lib/utils/cms-content';
import { parseMediaWidthSources, resolveMediaUrl } from '@/lib/utils/cms-media';
import { transformCollectionProducts } from '@/lib/utils/cms-products';
import type { CmsSection } from '@/types/cms';
import type { CmsMediaItem } from '@/types/cms-section';

interface CarouselSectionProps {
  section: CmsSection;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getCarouselSlides(content: Record<string, unknown>): CmsMediaItem[] {
  const media = content.media;

  if (!Array.isArray(media)) {
    return [];
  }

  return media
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => {
      const sources = parseMediaWidthSources(item.sources);
      const url = resolveMediaUrl(item) ?? resolveMediaUrl(sources[0]) ?? undefined;

      return {
        mediaId: typeof item.mediaId === 'string' ? item.mediaId : undefined,
        mediaType: typeof item.mediaType === 'string' ? item.mediaType : undefined,
        url,
        thumbnailUrl: typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : undefined,
        alt: typeof item.alt === 'string' ? item.alt : undefined,
        sources,
        action_type: typeof item.action_type === 'string' ? item.action_type : null,
        action_value: typeof item.action_value === 'string' ? item.action_value : null,
      };
    })
    .filter((item) => Boolean(item.url) || item.sources.length > 0);
}

export function CarouselSection({ section }: CarouselSectionProps) {
  const content = getSectionContentRecord(section);
  const slides = getCarouselSlides(content);
  const title = getSectionDisplayTitle(section);
  const products = transformCollectionProducts(content.products);
  const collectionHandle =
    typeof content.collectionHandle === 'string'
      ? content.collectionHandle
      : typeof content.handle === 'string'
        ? content.handle
        : undefined;
  const autoplay = content.autoplay === true;
  const interval = typeof content.interval === 'number' ? content.interval : 5000;
  const showDots = content.showDots !== false && slides.length > 1;

  if (slides.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      <CmsSectionHeader title={title} />
      <CmsSlideCarousel
        slides={slides}
        autoPlay={autoplay}
        interval={interval}
        showDots={showDots}
      />
      <CmsProductGrid
        products={products}
        collectionHandle={collectionHandle}
        viewAllHref={collectionHandle ? `/collections/${collectionHandle}` : undefined}
        className="mt-0"
      />
      <CmsEmbeddedExtras content={content} />
    </CmsSectionShell>
  );
}
