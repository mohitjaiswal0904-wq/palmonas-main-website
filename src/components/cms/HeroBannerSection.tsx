'use client';

import { useRef } from 'react';

import { CmsEmbeddedExtras } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { CmsSectionHeader, CmsSectionShell } from '@/components/cms/shared/CmsSectionShell';
import { CmsSlideCarousel } from '@/components/cms/shared/CmsSlideCarousel';
import { useCmsAction } from '@/hooks/useCmsAction';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import {
  HORIZONTAL_SCROLL_MOUSE,
  HORIZONTAL_SCROLL_PASS_VERTICAL,
} from '@/lib/layout/horizontal-scroll';
import { getSectionContentRecord, getSectionDisplayTitle } from '@/lib/utils/cms-content';
import { parseMediaWidthSources, resolveMediaUrl } from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import type { CmsSection } from '@/types/cms';
import type { CmsHeroCategory, CmsHeroSlide, CmsMediaItem } from '@/types/cms-section';

interface HeroBannerSectionProps {
  section: CmsSection;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapHeroSlides(slides: unknown): CmsMediaItem[] {
  if (!Array.isArray(slides)) {
    return [];
  }

  return slides
    .filter((slide): slide is CmsHeroSlide => isRecord(slide) && typeof slide.id === 'string')
    .map((slide) => {
      const sources = parseMediaWidthSources(slide.sources);
      const url = slide.imageUrl ?? slide.url ?? resolveMediaUrl(sources[0]) ?? undefined;

      return {
        mediaId: slide.mediaId ?? slide.id,
        mediaType: slide.mediaType,
        url: url ?? undefined,
        sources,
        action_type: slide.action_type,
        action_value: slide.action_value,
      };
    })
    .filter((slide) => Boolean(slide.url) || slide.sources.length > 0);
}

function mapHeroCategories(categories: unknown): CmsHeroCategory[] {
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories
    .filter(
      (category): category is CmsHeroCategory =>
        isRecord(category) && typeof category.id === 'string' && typeof category.name === 'string',
    )
    .map((category) => ({
      ...category,
      sources: parseMediaWidthSources(category.sources),
    }));
}

export function HeroBannerSection({ section }: HeroBannerSectionProps) {
  const content = getSectionContentRecord(section);
  const slides = mapHeroSlides(content.slides);
  const categories = mapHeroCategories(content.categories);
  const title = getSectionDisplayTitle(section);
  const autoPlay = content.autoPlay !== false;
  const autoPlayInterval =
    typeof content.autoPlayInterval === 'number' ? content.autoPlayInterval : 5000;
  const runAction = useCmsAction();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  useHorizontalMouseScroll(categoryScrollRef, categories.length > 0);

  if (slides.length === 0 && categories.length === 0) {
    return null;
  }

  return (
    <CmsSectionShell section={section}>
      {title ? <CmsSectionHeader title={title} /> : null}
      {slides.length > 0 ? (
        <CmsSlideCarousel
          slides={slides}
          autoPlay={autoPlay}
          interval={autoPlayInterval}
          className="w-full"
        />
      ) : null}
      <CmsEmbeddedExtras content={content} className="mt-0" />
      {categories.length > 0 ? (
        <div className="rounded-[32px] bg-white shadow-md">
          <div
            ref={categoryScrollRef}
            className={cn(
              'scrollbar-hide flex gap-4 overflow-x-auto',
              HORIZONTAL_SCROLL_PASS_VERTICAL,
              HORIZONTAL_SCROLL_MOUSE,
            )}
          >
            {categories.map((category) => {
              const categoryUrl =
                category.imageUrl ?? category.url ?? resolveMediaUrl(category.sources?.[0] ?? {});

              return (
                <button
                  key={category.id}
                  type="button"
                  className="flex w-24 shrink-0 flex-col items-center gap-2"
                  onClick={() => {
                    if (category.action_type && category.action_value) {
                      runAction(category);
                      return;
                    }

                    runAction({
                      action_type: 'collection',
                      action_value: category.handle,
                    });
                  }}
                  aria-label={category.name}
                >
                  {categoryUrl || (category.sources?.length ?? 0) > 0 ? (
                    <CmsMedia
                      url={categoryUrl ?? resolveMediaUrl(category.sources?.[0] ?? {}) ?? ''}
                      sources={category.sources}
                      alt=""
                      className="aspect-[4/5] w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full rounded-xl bg-stone-100" />
                  )}
                  <span className="text-center text-xs font-medium text-stone-800">
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </CmsSectionShell>
  );
}
