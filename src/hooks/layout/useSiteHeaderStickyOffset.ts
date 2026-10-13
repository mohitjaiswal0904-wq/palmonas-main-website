'use client';

import { useEffect, useState } from 'react';

const SITE_HEADER_SELECTOR = 'header[aria-label="Site header"]';

/**
 * Tracks the live bottom edge of the sticky site header (updates as mobile search collapses).
 */
export function useSiteHeaderStickyOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const header = document.querySelector(SITE_HEADER_SELECTOR);

    if (!header) {
      return undefined;
    }

    let animationFrameId = 0;

    const updateOffset = (): void => {
      setOffset(Math.max(0, Math.ceil(header.getBoundingClientRect().bottom)));
    };

    const scheduleUpdate = (): void => {
      if (animationFrameId !== 0) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        updateOffset();
      });
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(header);
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    return () => {
      if (animationFrameId !== 0) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate);
    };
  }, []);

  return offset;
}
