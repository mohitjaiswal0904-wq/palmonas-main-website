/** @jest-environment jsdom */

import { renderHook, act } from '@testing-library/react';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks canonical events via track()', async () => {
    const { useAnalytics } = await import('@/hooks/analytics/useAnalytics');
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.track({
        name: 'search',
        properties: { query: 'ring' },
      });
    });

    await Promise.resolve();

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'search',
      properties: { query: 'ring' },
    });
  });

  it('tracks labeled clicks via trackClick()', async () => {
    const { useAnalytics } = await import('@/hooks/analytics/useAnalytics');
    const { result } = renderHook(() => useAnalytics());

    act(() => {
      result.current.trackClick('checkout-cta', {
        eventName: 'checkout_started',
        properties: { path: '/cart' },
      });
    });

    await Promise.resolve();

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'checkout_started',
      properties: {
        label: 'checkout-cta',
        path: '/cart',
      },
    });
  });
});
