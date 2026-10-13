/** @jest-environment jsdom */

import { render, waitFor } from '@testing-library/react';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);
const mockUsePathname = jest.fn(() => '/products/ring');

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe('AnalyticsScrollDepthTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
  });

  it('fires page_scrolled at 25 percent depth once', async () => {
    const { AnalyticsScrollDepthTracker } = await import(
      '@/infrastructure/analytics/AnalyticsScrollDepthTracker'
    );

    render(<AnalyticsScrollDepthTracker />);

    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 375 });
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'page_scrolled',
        properties: {
          depth_percent: 25,
          page_name: 'Products Ring',
          path: '/products/ring',
        },
      });
    });

    window.dispatchEvent(new Event('scroll'));
    expect(
      mockTrackAnalyticsEvent.mock.calls.filter(
        (call) => (call[0] as { properties?: { depth_percent?: number } }).properties?.depth_percent === 25,
      ),
    ).toHaveLength(1);
  });

  it('skips tracking when the page is not scrollable', async () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 500,
    });

    const { AnalyticsScrollDepthTracker } = await import(
      '@/infrastructure/analytics/AnalyticsScrollDepthTracker'
    );

    render(<AnalyticsScrollDepthTracker />);
    window.dispatchEvent(new Event('scroll'));

    expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
  });
});
