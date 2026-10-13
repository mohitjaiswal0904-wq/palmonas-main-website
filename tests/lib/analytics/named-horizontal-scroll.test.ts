/** @jest-environment jsdom */

import { attachNamedHorizontalScrollTracking } from '@/lib/analytics/named-horizontal-scroll';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

/**
 * Arms the rail as a user gesture, then scrolls and advances the burst timer.
 */
function userScroll(el: HTMLElement, nextLeft: number): void {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  el.scrollLeft = nextLeft;
  el.dispatchEvent(new Event('scroll'));
}

describe('attachNamedHorizontalScrollTracking', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires one named event per swipe burst', () => {
    const el = document.createElement('div');
    el.scrollLeft = 0;

    const cleanup = attachNamedHorizontalScrollTracking(el, {
      eventName: 'carousel_scrolled',
      sectionName: 'product_carousel',
      pageName: 'Home',
    });

    userScroll(el, 40);
    el.scrollLeft = 80;
    el.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(500);

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1);
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'carousel_scrolled',
      properties: {
        section_name: 'product_carousel',
        direction: 'right',
        page_name: 'Home',
      },
    });

    cleanup();
  });

  it('ignores programmatic scroll without a user gesture', () => {
    const el = document.createElement('div');
    el.scrollLeft = 0;

    attachNamedHorizontalScrollTracking(el, {
      eventName: 'carousel_scrolled',
      sectionName: 'cms_slide_carousel',
    });

    el.scrollLeft = 120;
    el.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(500);

    expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('requires a new user gesture for a second event', () => {
    const el = document.createElement('div');
    el.scrollLeft = 0;

    attachNamedHorizontalScrollTracking(el, {
      eventName: 'carousel_scrolled',
      sectionName: 'banner_carousel',
    });

    userScroll(el, 60);
    jest.advanceTimersByTime(500);
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1);

    // Autoplay / layout scroll after the first gesture must not fire again.
    el.scrollLeft = 120;
    el.dispatchEvent(new Event('scroll'));
    jest.advanceTimersByTime(500);
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1);

    userScroll(el, 180);
    jest.advanceTimersByTime(500);
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(2);
  });

  it('ignores tiny deltas and tracks left-direction bursts', () => {
    const el = document.createElement('div');
    el.scrollLeft = 80;

    attachNamedHorizontalScrollTracking(el, {
      eventName: 'offers_rail_scrolled',
      sectionName: 'offers_rail',
    });

    userScroll(el, 82);
    jest.advanceTimersByTime(500);
    expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();

    userScroll(el, 20);
    jest.advanceTimersByTime(500);

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'offers_rail_scrolled',
      properties: {
        section_name: 'offers_rail',
        direction: 'left',
      },
    });
  });
});
