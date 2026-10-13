import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';

const SCROLL_BURST_MS = 500;
const MIN_DELTA_PX = 8;

export interface NamedHorizontalScrollOptions {
  eventName: string;
  sectionName: string;
  pageName?: string;
}

/**
 * Listens for horizontal rail scroll and fires one named event per user swipe burst.
 * Programmatic scrolls (autoplay, layout reset) are ignored until a user gesture.
 *
 * @param el - Overflow-x scroll container.
 * @param options - Event name and identifiers for Mixpanel.
 * @returns Cleanup that removes the listeners.
 */
export function attachNamedHorizontalScrollTracking(
  el: HTMLElement,
  options: NamedHorizontalScrollOptions,
): () => void {
  let lastLeft = el.scrollLeft;
  let burstTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingDirection: 'left' | 'right' | null = null;
  /** True after pointer/wheel/key on the rail or its parent (arrow controls). */
  let userGestureArmed = false;

  const armUserGesture = (): void => {
    userGestureArmed = true;
  };

  const flush = (): void => {
    if (!pendingDirection || !userGestureArmed) {
      pendingDirection = null;
      return;
    }

    const direction = pendingDirection;
    pendingDirection = null;
    userGestureArmed = false;

    void trackAnalyticsEvent({
      name: options.eventName,
      properties: {
        section_name: options.sectionName,
        direction,
        ...(options.pageName ? { page_name: options.pageName } : {}),
      },
    }).catch(() => {
      // ponytail: scroll tracking must not affect the rail.
    });
  };

  const onScroll = (): void => {
    const next = el.scrollLeft;
    const delta = next - lastLeft;
    lastLeft = next;

    if (!userGestureArmed || Math.abs(delta) < MIN_DELTA_PX) {
      return;
    }

    pendingDirection = delta > 0 ? 'right' : 'left';

    if (burstTimer) {
      clearTimeout(burstTimer);
    }

    burstTimer = setTimeout(flush, SCROLL_BURST_MS);
  };

  // Parent capture covers sibling arrow buttons (CMS / banner carousels).
  const gestureRoot = el.parentElement ?? el;
  const gestureOpts: AddEventListenerOptions = { passive: true, capture: true };

  gestureRoot.addEventListener('pointerdown', armUserGesture, gestureOpts);
  gestureRoot.addEventListener('touchstart', armUserGesture, gestureOpts);
  gestureRoot.addEventListener('wheel', armUserGesture, gestureOpts);
  el.addEventListener('keydown', armUserGesture);
  el.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    gestureRoot.removeEventListener('pointerdown', armUserGesture, gestureOpts);
    gestureRoot.removeEventListener('touchstart', armUserGesture, gestureOpts);
    gestureRoot.removeEventListener('wheel', armUserGesture, gestureOpts);
    el.removeEventListener('keydown', armUserGesture);
    el.removeEventListener('scroll', onScroll);

    if (burstTimer) {
      clearTimeout(burstTimer);
    }
  };
}
