"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when a "hide on scroll" element should be hidden (i.e. the
 * user is scrolling down past the top), and `false` while scrolling up or near
 * the top.
 *
 * Uses directional hysteresis: it accumulates the scroll delta and only flips
 * after a deliberate movement of `downDelta` / `upDelta` pixels in one
 * direction, resetting when the direction reverses. This prevents flicker on
 * slow / jittery scrolling.
 */
export function useScrollDirection({
  revealOffset = 80,
  downDelta = 16,
  upDelta = 16,
}: { revealOffset?: number; downDelta?: number; upDelta?: number } = {}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let acc = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      // Always reveal while near the top of the page.
      if (y <= revealOffset) {
        acc = 0;
        setHidden(false);
        return;
      }

      // Reset the accumulator when the scroll direction reverses.
      if ((delta > 0 && acc < 0) || (delta < 0 && acc > 0)) acc = 0;
      acc += delta;

      if (acc > downDelta) {
        acc = 0;
        setHidden(true);
      } else if (acc < -upDelta) {
        acc = 0;
        setHidden(false);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealOffset, downDelta, upDelta]);

  return hidden;
}
