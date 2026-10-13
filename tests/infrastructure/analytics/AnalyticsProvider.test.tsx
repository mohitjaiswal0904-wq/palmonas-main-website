/** @jest-environment jsdom */

import { render, waitFor } from '@testing-library/react';

const mockInitialize = jest.fn().mockResolvedValue(undefined);

jest.mock('@/infrastructure/analytics/AnalyticsScripts', () => ({
  AnalyticsScripts: () => null,
}));

jest.mock('@/infrastructure/analytics/AnalyticsPageViewTracker', () => ({
  AnalyticsPageViewTracker: () => null,
}));

jest.mock('@/infrastructure/analytics/AnalyticsInteractionTracker', () => ({
  AnalyticsInteractionTracker: () => null,
}));

jest.mock('@/infrastructure/analytics/AnalyticsScrollDepthTracker', () => ({
  AnalyticsScrollDepthTracker: () => null,
}));

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  analyticsClient: {
    initialize: (...args: unknown[]) => mockInitialize(...args),
  },
}));

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes analytics on mount', async () => {
    const { AnalyticsProvider } = await import('@/infrastructure/analytics/AnalyticsProvider');

    render(
      <AnalyticsProvider>
        <span>child</span>
      </AnalyticsProvider>,
    );

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });
  });
});
