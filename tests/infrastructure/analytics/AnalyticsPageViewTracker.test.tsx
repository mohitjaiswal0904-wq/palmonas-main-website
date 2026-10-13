/** @jest-environment jsdom */

import { render, waitFor } from '@testing-library/react';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);
const mockSetAnalyticsSuperProperties = jest.fn();
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
  setAnalyticsSuperProperties: (...args: unknown[]) => mockSetAnalyticsSuperProperties(...args),
}));

describe('AnalyticsPageViewTracker', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    const { resetRouteAnalyticsDedupe } =
      await import('@/infrastructure/analytics/AnalyticsPageViewTracker');
    resetRouteAnalyticsDedupe();
  });

  it('tracks home_viewed and page_view on mount', async () => {
    const { AnalyticsPageViewTracker } =
      await import('@/infrastructure/analytics/AnalyticsPageViewTracker');

    render(<AnalyticsPageViewTracker />);

    await waitFor(() => {
      expect(mockSetAnalyticsSuperProperties).toHaveBeenCalledWith({
        platform: 'web',
        page_name: 'Home',
      });
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'home_viewed',
        properties: {
          path: '/',
          screen_name: 'Home',
          collections_shown_count: 0,
        },
      });
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'page_view',
        properties: { path: '/' },
        value: 1,
        currency: 'INR',
      });
    });
  });

  it('tracks semantic view events when the route changes', async () => {
    const { AnalyticsPageViewTracker } =
      await import('@/infrastructure/analytics/AnalyticsPageViewTracker');

    const { rerender } = render(<AnalyticsPageViewTracker />);

    mockUsePathname.mockReturnValue('/cart');
    mockUseSearchParams.mockReturnValue(new URLSearchParams('step=1'));
    rerender(<AnalyticsPageViewTracker />);

    await waitFor(() => {
      // home (semantic + page_view) + cart (semantic + page_view)
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(4);
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'cart_viewed',
        properties: {
          path: '/cart',
          search: 'step=1',
          screen_name: 'Cart',
          items_count: 0,
          previous_screen: 'Home',
        },
      });
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'page_view',
        properties: { path: '/cart', search: 'step=1' },
        value: 1,
        currency: 'INR',
      });
    });
  });

  it('does not send the same route view twice after remount', async () => {
    const { AnalyticsPageViewTracker } =
      await import('@/infrastructure/analytics/AnalyticsPageViewTracker');

    const first = render(<AnalyticsPageViewTracker />);
    first.unmount();
    render(<AnalyticsPageViewTracker />);

    await waitFor(() => {
      // semantic + page_view once for the same route key
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(2);
    });
  });
});
