'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef } from 'react';

import { CmsButtonRow } from '@/components/cms/shared/CmsEmbeddedExtras';
import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { useNamedHorizontalScroll } from '@/hooks/analytics/useNamedHorizontalScroll';
import { useCmsAction } from '@/hooks/useCmsAction';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import { HORIZONTAL_SCROLL_MOUSE } from '@/lib/layout/horizontal-scroll';
import type { CmsBannerSlide } from '@/lib/utils/cms-banner-slides';
import { cn } from '@/lib/utils/cn';
import type { CmsSectionButton } from '@/types/cms-section';

interface BannerSlideCarouselProps {
  slides: CmsBannerSlide[];
  buttons?: CmsSectionButton[];
}

interface BannerSlidePanelProps {
  slide: CmsBannerSlide;
  onNavigate: (action: { action_type: string; action_value: string }) => void;
}

function BannerSlidePanel({ slide, onNavigate }: BannerSlidePanelProps) {
  const { mediaUrl, mediaType, title, subtitle, cta, sources } = slide;

  return (
    <div className="relative min-h-48 w-full shrink-0 snap-start snap-always overflow-hidden">
      {mediaUrl ? (
        <CmsMedia
          url={mediaUrl}
          mediaType={mediaType}
          sources={sources}
          alt={title}
          className="absolute inset-0 min-h-48"
          autoPlay
        />
      ) : null}
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center text-white">
        {title ? <h2 className="font-display text-3xl">{title}</h2> : null}
        {subtitle ? <p className="mt-2 max-w-xl text-sm text-white/90">{subtitle}</p> : null}
        {cta ? (
          <button
            type="button"
            className="rounded-palmonas-md mt-4 bg-white px-5 py-2 text-sm font-medium text-stone-900"
            onClick={() => onNavigate({ action_type: 'navigate', action_value: cta.link })}
          >
            {cta.text}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Banner carousel — swipe scroll on mobile, arrow-controlled scroll on tab+.
 */
export function BannerSlideCarousel({ slides, buttons = [] }: BannerSlideCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const runAction = useCmsAction();
  const hasMultipleSlides = slides.length > 1;

  useNamedHorizontalScroll(
    scrollRef,
    {
      eventName: analyticsCanonicalEvents.carouselScrolled,
      sectionName: 'banner_carousel',
    },
    hasMultipleSlides,
  );
  useHorizontalMouseScroll(scrollRef, hasMultipleSlides);

  const scrollBySlide = useCallback((direction: 'prev' | 'next') => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const offset = direction === 'next' ? node.clientWidth : -node.clientWidth;
    node.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            className="tab:inline-flex absolute top-1/2 left-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-md"
            aria-label="Previous banner"
            onClick={() => scrollBySlide('prev')}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tab:inline-flex absolute top-1/2 right-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-md"
            aria-label="Next banner"
            onClick={() => scrollBySlide('next')}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}
      <div
        ref={scrollRef}
        className={cn(
          'flex w-full',
          hasMultipleSlides &&
            // No touch-pan-x — that blocks vertical page scroll when finger is on the banner (PW-567).
            cn(
              'snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden',
              HORIZONTAL_SCROLL_MOUSE,
            ),
        )}
        role={hasMultipleSlides ? 'region' : undefined}
        aria-label={hasMultipleSlides ? 'Banner carousel' : undefined}
        tabIndex={hasMultipleSlides ? 0 : undefined}
      >
        {slides.map((slide) => (
          <BannerSlidePanel
            key={slide.id}
            slide={slide}
            onNavigate={(action) => runAction(action)}
          />
        ))}
      </div>
      {buttons.length > 0 ? (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <CmsButtonRow buttons={buttons} />
        </div>
      ) : null}
    </div>
  );
}
