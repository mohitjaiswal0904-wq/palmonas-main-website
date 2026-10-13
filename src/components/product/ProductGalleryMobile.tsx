'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ShareIcon } from '@/components/icons';
import { CarouselDots } from '@/components/product/CarouselDots';
import { ProductImageZoomOverlay } from '@/components/product/ProductImageZoomOverlay';
import { productMessages, productTheme } from '@/config/product/product.config';
import { trackPDPMediaInteracted } from '@/lib/analytics/analytics-trackers';
import { HORIZONTAL_SCROLL_PASS_VERTICAL } from '@/lib/layout/horizontal-scroll';
import { galleryImageAlt } from '@/lib/product/gallery-image-alt';
import { cn } from '@/lib/utils/cn';

interface ProductGalleryMobileProps {
  images: string[];
  productName: string;
  productHandle?: string;
}

/**
 * Shares the current page using the Web Share API, falling back to copying the
 * URL to the clipboard. Errors (including a user-cancelled share) are ignored.
 */
async function shareCurrentPage(title: string): Promise<void> {
  const shareData = { title, url: window.location.href };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
  } catch {
    // User cancelled share or clipboard unavailable.
  }
}

/**
 * Mobile: horizontal snap carousel. Laptop+: 2-col grid (no horizontal scroll).
 * The grid keeps its natural height here; `ProductGallery` owns the laptop scroll box so
 * frames are never squashed or clipped mid-image (PW-643).
 */
export function ProductGalleryMobile({
  images,
  productName,
  productHandle,
}: ProductGalleryMobileProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastTrackedIndexRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const productId = productHandle ?? 'unknown';

  /** Recomputes the active slide from the container's scroll position. */
  const updateActiveIndex = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.clientWidth === 0) {
      return;
    }

    setActiveIndex(Math.round(container.scrollLeft / container.clientWidth));
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.addEventListener('scroll', updateActiveIndex, { passive: true });
    return () => {
      container.removeEventListener('scroll', updateActiveIndex);
    };
  }, [updateActiveIndex]);

  // One named swipe event per slide change; skip the initial mount index.
  useEffect(() => {
    if (lastTrackedIndexRef.current === null) {
      lastTrackedIndexRef.current = activeIndex;
      return;
    }

    if (lastTrackedIndexRef.current === activeIndex) {
      return;
    }

    lastTrackedIndexRef.current = activeIndex;
    trackPDPMediaInteracted({
      product_id: productId,
      action: 'swipe',
      media_index: activeIndex,
    });
  }, [activeIndex, productId]);

  /** Smoothly scrolls the carousel to the slide at the given index. */
  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(index, images.length - 1));
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({
        left: nextIndex * container.clientWidth,
        behavior: 'smooth',
      });
    }
    setActiveIndex(nextIndex);
  };

  const closeZoom = useCallback(() => {
    setZoomIndex(null);
  }, []);

  const handleShare = () => {
    shareCurrentPage(productName).catch(() => {
      // Sharing failed or was cancelled; nothing else to do.
    });
  };

  return (
    <div className="relative bg-white">
      {/* Media plane — share overlays the image; dots sit below (Figma 963:75550). */}
      <div className="relative">
        <div
          ref={scrollRef}
          className={cn(
            'flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
            HORIZONTAL_SCROLL_PASS_VERTICAL,
            'laptop:grid laptop:grid-cols-2 laptop:items-start laptop:gap-5 laptop:overflow-x-visible laptop:overflow-y-visible laptop:snap-none',
          )}
          aria-label={`${productName} image gallery`}
          tabIndex={0}
        >
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              className={cn(
                'relative aspect-square w-full shrink-0 cursor-zoom-in snap-start snap-always bg-white',
                'laptop:w-auto laptop:shrink laptop:snap-align-none',
              )}
              aria-label={productMessages.a11y.formatOpenImageFullScreen(
                galleryImageAlt(productName, index),
              )}
              onClick={() => setZoomIndex(index)}
            >
              <Image
                src={url}
                alt={galleryImageAlt(productName, index)}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="laptop:object-contain object-cover"
                priority={index === 0}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="laptop:hidden absolute right-3 bottom-1.5 z-[2] flex size-6 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm"
          style={{ color: productTheme.ink }}
          aria-label={productMessages.a11y.shareProduct}
          onClick={handleShare}
        >
          <ShareIcon className="size-6" />
        </button>
      </div>

      {/* Figma 963:75551 — below image: 12px top, ~24px to info via mb-2 + layout pt-4 */}
      <CarouselDots
        count={images.length}
        activeIndex={activeIndex}
        onSelect={scrollToIndex}
        getLabel={(index, total) => `View image ${index + 1} of ${total}`}
        className="laptop:hidden mt-3 mb-2 flex items-center justify-center gap-2"
      />

      {zoomIndex !== null ? (
        <ProductImageZoomOverlay
          images={images}
          initialIndex={zoomIndex}
          productName={productName}
          productHandle={productHandle}
          onClose={closeZoom}
        />
      ) : null}
    </div>
  );
}
