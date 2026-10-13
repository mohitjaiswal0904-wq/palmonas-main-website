/** Minimum pointer travel before a drag counts (avoids eating clicks). */
const DRAG_THRESHOLD_PX = 4;

/**
 * Whether a horizontal rail can scroll further in the given delta direction.
 *
 * @param el - Overflow scroll container
 * @param delta - Positive scrolls right; negative scrolls left
 */
export function canScrollHorizontally(el: HTMLElement, delta: number): boolean {
  if (el.scrollWidth <= el.clientWidth + 1) {
    return false;
  }

  if (delta < 0) {
    return el.scrollLeft > 0;
  }

  if (delta > 0) {
    return el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
  }

  return false;
}

/**
 * Resolve a wheel delta that should move a horizontal rail.
 * Never maps plain vertical wheel to horizontal — that traps page scroll (PW-567).
 *
 * @param event - Wheel event
 * @returns Horizontal delta, or `null` when the event must pass through for page scroll
 */
export function resolveHorizontalWheelDelta(
  event: Pick<WheelEvent, 'deltaX' | 'deltaY' | 'shiftKey'>,
): number | null {
  if (event.shiftKey && event.deltaY !== 0) {
    return event.deltaY;
  }

  if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && event.deltaX !== 0) {
    return event.deltaX;
  }

  return null;
}

/**
 * Scroll the page by a vertical wheel delta (pixel/line/page).
 *
 * @param event - Wheel event whose vertical axis should move the document
 */
function scrollPageByWheel(event: Pick<WheelEvent, 'deltaY' | 'deltaMode'>): void {
  const lineHeight = 16;
  if (event.deltaMode === 1) {
    window.scrollBy(0, event.deltaY * lineHeight);
    return;
  }

  if (event.deltaMode === 2) {
    window.scrollBy(0, event.deltaY * window.innerHeight);
    return;
  }

  window.scrollBy(0, event.deltaY);
}

/**
 * Attach mouse click-drag (and intentional horizontal wheel) scrolling to a rail.
 * Plain vertical wheel is never prevented so the page keeps scrolling.
 * Touch pointers are left alone so native swipe (PW-567) keeps working.
 *
 * @param el - Overflow scroll container
 * @returns Cleanup that removes listeners
 */
export function attachHorizontalMouseScroll(el: HTMLElement): () => void {
  let dragging = false;
  let pointerId: number | null = null;
  let startX = 0;
  let startScrollLeft = 0;
  let didDrag = false;
  let savedScrollSnapType = '';
  let savedScrollBehavior = '';
  let snapTimeout: number | null = null;

  const onWheel = (event: WheelEvent) => {
    const delta = resolveHorizontalWheelDelta(event);
    if (delta !== null && canScrollHorizontally(el, delta)) {
      event.preventDefault();
      el.scrollLeft += delta;
      return;
    }

    // overflow-x-auto computes overflow-y to auto and eats vertical wheel. Forward it.
    if (
      Math.abs(event.deltaY) >= Math.abs(event.deltaX) &&
      event.deltaY !== 0 &&
      event.cancelable
    ) {
      event.preventDefault();
      scrollPageByWheel(event);
    }
  };

  /** Block native image/link drag so mouse swipe can own the gesture. */
  const onDragStart = (event: DragEvent) => {
    event.preventDefault();
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }
    if (el.scrollWidth <= el.clientWidth + 1) {
      return;
    }

    dragging = true;
    didDrag = false;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = el.scrollLeft;
    // ponytail: do not capture until the drag threshold — capture on down steals card/button clicks
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) {
      return;
    }

    const dx = event.clientX - startX;
    if (!didDrag && Math.abs(dx) < DRAG_THRESHOLD_PX) {
      return;
    }

    if (!didDrag) {
      didDrag = true;
      el.classList.add('cursor-grabbing');
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        // ponytail: setPointerCapture can throw if the pointer is already released
      }
      // Snap + smooth scroll fight programmatic drag on CMS carousels.
      savedScrollSnapType = el.style.scrollSnapType;
      savedScrollBehavior = el.style.scrollBehavior;
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
    }

    el.scrollLeft = startScrollLeft - dx;
  };

  const endDrag = (event: PointerEvent) => {
    if (!dragging || event.pointerId !== pointerId) {
      return;
    }

    const wasDragging = didDrag;
    dragging = false;
    pointerId = null;
    el.classList.remove('cursor-grabbing');

    if (el.hasPointerCapture?.(event.pointerId)) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        // ponytail: release is best-effort after pointercancel
      }
    }

    if (wasDragging) {
      const left = el.scrollLeft;
      el.style.scrollSnapType = savedScrollSnapType;
      el.style.scrollBehavior = 'smooth';
      savedScrollSnapType = '';
      el.scrollTo({ left });
      if (snapTimeout !== null) {
        window.clearTimeout(snapTimeout);
      }
      snapTimeout = window.setTimeout(() => {
        el.style.scrollBehavior = savedScrollBehavior;
        savedScrollBehavior = '';
        snapTimeout = null;
      }, 320);
    }
  };

  const onClickCapture = (event: MouseEvent) => {
    if (!didDrag) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    didDrag = false;
  };

  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('dragstart', onDragStart, true);
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('click', onClickCapture, true);

  return () => {
    if (snapTimeout !== null) {
      window.clearTimeout(snapTimeout);
    }
    el.classList.remove('cursor-grabbing');
    el.style.scrollSnapType = savedScrollSnapType;
    el.style.scrollBehavior = savedScrollBehavior;
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('dragstart', onDragStart, true);
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', endDrag);
    el.removeEventListener('pointercancel', endDrag);
    el.removeEventListener('click', onClickCapture, true);
  };
}
