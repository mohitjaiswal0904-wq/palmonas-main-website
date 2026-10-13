'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { productConfig, productMessages, productTheme } from '@/config/product/product.config';
import { trackPDPMediaInteracted } from '@/lib/analytics/analytics-trackers';
import {
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import { galleryImageAlt } from '@/lib/product/gallery-image-alt';
import {
  clampGalleryScale,
  pinchDistance,
  pinchMidpoint,
  scrollAfterZoomTowardPoint,
} from '@/lib/product/gallery-zoom';
import { cn } from '@/lib/utils/cn';

const { minScale, maxScale, wheelStepScale } = productConfig.gallery.zoom;

const controlClassName =
  'flex size-9 items-center justify-center rounded-full bg-white/15 text-white disabled:opacity-40';

interface ProductImageZoomOverlayProps {
  images: string[];
  /** Slide the viewer opens on — the image the shopper tapped. */
  initialIndex: number;
  productName: string;
  productHandle?: string;
  onClose: () => void;
}

interface ZoomFocus {
  fromScale: number;
  toScale: number;
  pointerOffsetX: number;
  pointerOffsetY: number;
}

/**
 * Full-screen PDP image viewer: snap-paged slides with pinch, wheel, and button zoom.
 *
 * Two nested scroll boxes keep paging and panning from fighting each other. The
 * pager snaps one image per swipe; a slide only becomes a scroll box once zoomed,
 * so at fit-to-screen the swipe always reaches the pager. Zoom grows the frame
 * instead of transforming the image, so panning stays native (plus drag on desktop).
 */
export function ProductImageZoomOverlay({
  images,
  initialIndex,
  productName,
  productHandle,
  onClose,
}: ProductImageZoomOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pagerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [scale, setScale] = useState(minScale);
  const [isPanning, setIsPanning] = useState(false);
  const scaleRef = useRef(scale);
  const activeIndexRef = useRef(activeIndex);
  const zoomFocusRef = useRef<ZoomFocus | null>(null);
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(null);
  const lastTrackedIndexRef = useRef(initialIndex);
  const productId = productHandle ?? 'unknown';
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  useLayoutEffect(() => {
    scaleRef.current = scale;
    activeIndexRef.current = activeIndex;
  }, [activeIndex, scale]);

  /** Returns the currently paged slide, if it is mounted. */
  const activeSlide = useCallback((): HTMLElement | null => {
    const slide = pagerRef.current?.children[activeIndexRef.current];
    return slide instanceof HTMLElement ? slide : null;
  }, []);

  /** Applies a clamped scale and optionally keeps the pointer's content point in place. */
  const applyScale = useCallback(
    (nextScale: number, focus?: { clientX: number; clientY: number }) => {
      const fromScale = scaleRef.current;
      const toScale = clampGalleryScale(nextScale, minScale, maxScale);
      if (toScale === fromScale) {
        return;
      }

      const slide = activeSlide();
      if (focus && slide) {
        const rect = slide.getBoundingClientRect();
        zoomFocusRef.current = {
          fromScale,
          toScale,
          pointerOffsetX: focus.clientX - rect.left,
          pointerOffsetY: focus.clientY - rect.top,
        };
      } else {
        zoomFocusRef.current = null;
      }

      setScale(toScale);
    },
    [activeSlide],
  );

  // The viewer owns the whole screen while mounted, so freeze background scroll.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Jump to the tapped slide before the first paint, so image one never flashes.
  useLayoutEffect(() => {
    const pager = pagerRef.current;
    if (!pager) {
      return;
    }

    pager.scrollLeft = initialIndex * pager.clientWidth;
  }, [initialIndex]);

  // Keep the pinch/wheel origin stable; button zoom recentres the slide.
  useLayoutEffect(() => {
    const slide = activeSlide();
    if (!slide) {
      return;
    }

    const focus = zoomFocusRef.current;
    zoomFocusRef.current = null;

    if (focus) {
      const next = scrollAfterZoomTowardPoint({
        fromScale: focus.fromScale,
        toScale: focus.toScale,
        viewport: slide,
        pointerOffsetX: focus.pointerOffsetX,
        pointerOffsetY: focus.pointerOffsetY,
      });
      slide.scrollLeft = next.scrollLeft;
      slide.scrollTop = next.scrollTop;
      return;
    }

    slide.scrollLeft = (slide.scrollWidth - slide.clientWidth) / 2;
    slide.scrollTop = (slide.scrollHeight - slide.clientHeight) / 2;
  }, [activeIndex, activeSlide, scale]);

  /** Reads the paged slide back from scroll position so the counter follows the swipe. */
  const handlePagerScroll = useCallback(() => {
    const pager = pagerRef.current;
    if (!pager || pager.clientWidth === 0) {
      return;
    }

    const nextIndex = Math.round(pager.scrollLeft / pager.clientWidth);

    if (nextIndex !== lastTrackedIndexRef.current) {
      lastTrackedIndexRef.current = nextIndex;
      trackPDPMediaInteracted({
        product_id: productId,
        action: 'swipe',
        media_index: nextIndex,
      });
    }

    setActiveIndex(nextIndex);
  }, [productId]);

  /** Pages the track to a slide, clamped to the ends, mirroring a swipe. */
  const goToSlide = useCallback(
    (index: number) => {
      const pager = pagerRef.current;
      if (!pager) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(index, images.length - 1));
      if (typeof pager.scrollTo === 'function') {
        pager.scrollTo({ left: nextIndex * pager.clientWidth, behavior: 'smooth' });
      }
      setActiveIndex(nextIndex);
    },
    [images.length],
  );

  // Arrow keys page the track for shoppers on a keyboard or a mouse-only desktop.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'ArrowRight') {
        goToSlide(activeIndex + 1);
        return;
      }

      if (event.key === 'ArrowLeft') {
        goToSlide(activeIndex - 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, goToSlide, onClose]);

  // Wheel and pinch must be non-passive so we can stop the browser's page zoom.
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('button, [data-testid="product-image-zoom-dock"]')
      ) {
        return;
      }

      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      applyScale(scaleRef.current + direction * wheelStepScale, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };

    const handleTouchStart = (event: TouchEvent) => {
      const first = event.touches[0];
      const second = event.touches[1];
      if (!first || !second) {
        return;
      }

      event.preventDefault();
      pinchRef.current = {
        startDistance: pinchDistance(first, second),
        startScale: scaleRef.current,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const pinch = pinchRef.current;
      const first = event.touches[0];
      const second = event.touches[1];
      if (!pinch || !first || !second) {
        return;
      }

      event.preventDefault();
      const distance = pinchDistance(first, second);
      if (pinch.startDistance <= 0) {
        return;
      }

      applyScale(pinch.startScale * (distance / pinch.startDistance), pinchMidpoint(first, second));
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const pinch = pinchRef.current;

      if (event.touches.length < 2) {
        if (pinch && Math.abs(scaleRef.current - pinch.startScale) > 0.01) {
          trackPDPMediaInteracted({
            product_id: productId,
            action: 'zoom',
            media_index: activeIndexRef.current,
          });
        }

        pinchRef.current = null;
      }
    };

    overlay.addEventListener('wheel', handleWheel, { passive: false });
    overlay.addEventListener('touchstart', handleTouchStart, { passive: false });
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false });
    overlay.addEventListener('touchend', handleTouchEnd);
    overlay.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      overlay.removeEventListener('wheel', handleWheel);
      overlay.removeEventListener('touchstart', handleTouchStart);
      overlay.removeEventListener('touchmove', handleTouchMove);
      overlay.removeEventListener('touchend', handleTouchEnd);
      overlay.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [applyScale, productId]);

  /** Starts a desktop drag-pan once the slide is larger than the viewport. */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scaleRef.current <= minScale || event.button !== 0) {
      return;
    }

    const slide = event.currentTarget;
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: slide.scrollLeft,
      scrollTop: slide.scrollTop,
    };
    slide.setPointerCapture(event.pointerId);
    setIsPanning(true);
  };

  /** Pans the zoomed slide with the pointer instead of relying on scrollbars. */
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const slide = event.currentTarget;
    slide.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    slide.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  };

  /** Releases a desktop drag-pan. */
  const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (panRef.current?.pointerId !== event.pointerId) {
      return;
    }

    panRef.current = null;
    setIsPanning(false);
  };

  if (typeof document === 'undefined') {
    return null;
  }

  const framePercent = `${scale * 100}%`;
  const isZoomed = scale > minScale;

  return createPortal(
    <div
      ref={overlayRef}
      className="z-modal fixed inset-0 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={productMessages.a11y.formatFullScreenGallery(productName)}
      data-testid="product-image-zoom-overlay"
    >
      <div className="flex shrink-0 justify-end p-3">
        <button
          type="button"
          className={controlClassName}
          aria-label={productMessages.a11y.closeImageFullScreen}
          onClick={onClose}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* min-h-0/min-w-0: without them the flex track grows to the zoomed frame instead of scrolling. */}
      <div
        ref={pagerRef}
        className={cn(
          'flex min-h-0 min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden',
          HORIZONTAL_SCROLL_PASS_VERTICAL,
          HORIZONTAL_SCROLLBAR_HIDDEN,
        )}
        onScroll={handlePagerScroll}
        data-testid="product-image-zoom-pager"
      >
        {images.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={cn(
              'h-full w-full shrink-0 snap-start snap-always',
              // Only a zoomed slide may capture the drag; at fit-to-screen the swipe
              // has to reach the pager, or `overscroll-contain` would eat the gesture.
              isZoomed ? 'overflow-auto overscroll-contain' : 'overflow-hidden',
              isZoomed && (isPanning ? 'cursor-grabbing' : 'cursor-grab'),
            )}
            data-testid="product-image-zoom-viewport"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endPan}
            onPointerCancel={endPan}
          >
            <div
              className="relative"
              style={{ width: framePercent, height: framePercent }}
              data-testid="product-image-zoom-frame"
            >
              <Image
                src={url}
                alt={galleryImageAlt(productName, index)}
                fill
                sizes="100vw"
                className="pointer-events-none object-contain"
                draggable={false}
                priority={index === initialIndex}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className={productTheme.pdpRhythm.galleryZoomDockClass}
        data-testid="product-image-zoom-dock"
      >
        <div
          className={cn(
            productTheme.pdpRhythm.galleryZoomThumbsClass,
            HORIZONTAL_SCROLL_PASS_VERTICAL,
            HORIZONTAL_SCROLLBAR_HIDDEN,
          )}
        >
          {images.map((url, index) => (
            <button
              key={`${url}-${index}-thumb`}
              type="button"
              className={cn(
                productTheme.pdpRhythm.galleryZoomThumbClass,
                index === activeIndex && productTheme.pdpRhythm.galleryZoomThumbActiveClass,
              )}
              aria-label={galleryImageAlt(productName, index)}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goToSlide(index)}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
