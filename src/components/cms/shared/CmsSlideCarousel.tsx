'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CmsMedia } from '@/components/cms/shared/CmsMedia';
import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { useNamedHorizontalScroll } from '@/hooks/analytics/useNamedHorizontalScroll';
import { useCmsAction } from '@/hooks/useCmsAction';
import { useHorizontalMouseScroll } from '@/hooks/useHorizontalMouseScroll';
import { HORIZONTAL_SCROLL_MOUSE } from '@/lib/layout/horizontal-scroll';
import { resolveMediaUrl } from '@/lib/utils/cms-media';
import { cn } from '@/lib/utils/cn';
import type { CmsAction, CmsMediaItem } from '@/types/cms-section';

interface CmsSlideCarouselProps {
  slides: CmsMediaItem[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
  slideClassName?: string;
  showDots?: boolean;
}

const SCROLL_ANIMATION_FALLBACK_MS = 600;

/**
 * Scroll-snap media carousel — swipe on mobile, arrow navigation on tab+.
 */
export function CmsSlideCarousel({
  slides,
  autoPlay = false,
  interval = 5000,
  className,
  slideClassName,
  showDots = true,
}: CmsSlideCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const animationFallbackRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const runAction = useCmsAction();
  const hasMultipleSlides = slides.length > 1;

  useNamedHorizontalScroll(
    scrollRef,
    {
      eventName: analyticsCanonicalEvents.carouselScrolled,
      sectionName: 'cms_slide_carousel',
    },
    hasMultipleSlides,
  );
  useHorizontalMouseScroll(scrollRef, hasMultipleSlides);

  const pauseAutoPlay = useCallback(() => {
    pausedUntilRef.current = Date.now() + interval * 2;
  }, [interval]);

  const clearAnimationFallback = useCallback(() => {
    if (animationFallbackRef.current !== null) {
      window.clearTimeout(animationFallbackRef.current);
      animationFallbackRef.current = null;
    }
  }, []);

  const markScrollAnimating = useCallback(
    (behavior: ScrollBehavior) => {
      isAnimatingRef.current = true;
      clearAnimationFallback();

      if (behavior === 'smooth') {
        animationFallbackRef.current = window.setTimeout(() => {
          isAnimatingRef.current = false;
          animationFallbackRef.current = null;
        }, SCROLL_ANIMATION_FALLBACK_MS);
      } else {
        isAnimatingRef.current = false;
      }
    },
    [clearAnimationFallback],
  );

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const node = scrollRef.current;
      if (!node) {
        return;
      }

      markScrollAnimating(behavior);
      node.scrollTo({ left: index * node.clientWidth, behavior });
    },
    [markScrollAnimating],
  );

  const goToUserSlide = useCallback(
    (index: number) => {
      pauseAutoPlay();
      scrollToIndex(index, 'smooth');
    },
    [pauseAutoPlay, scrollToIndex],
  );

  const scrollBySlide = useCallback(
    (direction: 'prev' | 'next') => {
      const node = scrollRef.current;
      if (!node) {
        return;
      }

      pauseAutoPlay();
      const currentIndex = Math.round(node.scrollLeft / node.clientWidth);
      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % slides.length
          : (currentIndex - 1 + slides.length) % slides.length;
      scrollToIndex(nextIndex, 'smooth');
    },
    [pauseAutoPlay, scrollToIndex, slides.length],
  );

  // Start on the first slide after remount (e.g. back to Home) so dots and track stay aligned.
  useEffect(() => {
    if (!hasMultipleSlides) {
      return undefined;
    }

    const node = scrollRef.current;
    if (!node) {
      return undefined;
    }

    const resetToFirstSlide = (): boolean => {
      if (node.clientWidth === 0) {
        return false;
      }

      markScrollAnimating('auto');
      node.scrollTo({ left: 0, behavior: 'auto' });
      setActiveIndex(0);
      return true;
    };

    if (resetToFirstSlide()) {
      // Re-run after layout — browser scroll restoration can land after the first paint.
      const rafId = window.requestAnimationFrame(() => {
        resetToFirstSlide();
      });
      return () => {
        window.cancelAnimationFrame(rafId);
      };
    }

    // Width not ready yet (soft-nav / first paint) — snap once layout assigns a width.
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (resetToFirstSlide()) {
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [hasMultipleSlides, markScrollAnimating, slides.length]);

  // Sync dot highlight while the user swipes or scrolls.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !hasMultipleSlides) {
      return undefined;
    }

    const handleScroll = () => {
      if (node.clientWidth === 0) {
        return;
      }

      const index = Math.round(node.scrollLeft / node.clientWidth);
      setActiveIndex(index);
    };

    const handleScrollEnd = () => {
      isAnimatingRef.current = false;
      clearAnimationFallback();
    };

    node.addEventListener('scroll', handleScroll, { passive: true });
    node.addEventListener('scrollend', handleScrollEnd);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      node.removeEventListener('scrollend', handleScrollEnd);
      clearAnimationFallback();
    };
  }, [clearAnimationFallback, hasMultipleSlides]);

  // Auto-advance when idle — instant scroll so it never fights user smooth animation.
  useEffect(() => {
    if (!autoPlay || !hasMultipleSlides) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntilRef.current || isAnimatingRef.current) {
        return;
      }

      const node = scrollRef.current;
      if (!node) {
        return;
      }

      const currentIndex = Math.round(node.scrollLeft / node.clientWidth);
      const nextIndex = (currentIndex + 1) % slides.length;
      scrollToIndex(nextIndex, 'auto');
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoPlay, hasMultipleSlides, interval, scrollToIndex, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  function handleSlideClick(slide: CmsAction) {
    pauseAutoPlay();

    if (slide.action_type && slide.action_value) {
      runAction(slide);
    }
  }

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={autoPlay ? pauseAutoPlay : undefined}
    >
      {hasMultipleSlides ? (
        <>
          <button
            type="button"
            className="tab:inline-flex absolute top-1/2 left-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-md"
            aria-label="Previous slide"
            onClick={() => scrollBySlide('prev')}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="tab:inline-flex absolute top-1/2 right-3 z-30 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-stone-900 shadow-md"
            aria-label="Next slide"
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
        aria-label={hasMultipleSlides ? 'Hero banner carousel' : undefined}
        tabIndex={hasMultipleSlides ? 0 : undefined}
        onPointerDown={hasMultipleSlides ? pauseAutoPlay : undefined}
        onTouchStart={hasMultipleSlides ? pauseAutoPlay : undefined}
      >
        {slides.map((slide, index) => {
          const mediaUrl =
            resolveMediaUrl(slide) ?? resolveMediaUrl(slide.sources?.[0] ?? {}) ?? null;

          if (!mediaUrl) {
            return null;
          }

          const isClickable = Boolean(slide.action_type && slide.action_value);
          const media = (
            <CmsMedia
              url={mediaUrl}
              mediaType={slide.mediaType}
              alt={slide.alt ?? `Slide ${index + 1}`}
              sources={slide.sources}
              aspectRatio={slide.aspectRatio}
              poster={slide.thumbnailUrl}
              className={cn('tab:aspect-[16/9] laptop:aspect-[48/19] w-full', slideClassName)}
              autoPlay
            />
          );

          return (
            <div
              key={slide.mediaId ?? `${mediaUrl}-${index}`}
              className="w-full shrink-0 snap-start snap-always"
            >
              {isClickable ? (
                <button
                  type="button"
                  className={cn('block w-full cursor-pointer', slideClassName)}
                  onClick={() => handleSlideClick(slide)}
                  aria-label={`Slide ${index + 1}`}
                >
                  {media}
                </button>
              ) : (
                media
              )}
            </div>
          );
        })}
      </div>
      {showDots && hasMultipleSlides ? (
        <div className="inset-x-0 z-10 mt-2 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.mediaId ?? `dot-${index}`}
              type="button"
              className={cn(
                'h-2 w-2 cursor-pointer rounded-full transition-colors',
                index === activeIndex ? 'bg-[#FCCCCC]' : 'bg-[#EDEDED]',
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => goToUserSlide(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
