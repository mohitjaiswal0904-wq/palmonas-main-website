/** @jest-environment jsdom */

jest.mock('@/lib/analytics/bootstrap-webengage', () => ({
  bootstrapWebEngageIfReady: jest.fn(async () => true),
}));

jest.mock('@/lib/env', () => ({
  isWebEngageAnalyticsEnabled: jest.fn(),
}));

import { render, waitFor } from '@testing-library/react';

import { bootstrapWebEngageIfReady } from '@/lib/analytics/bootstrap-webengage';
import { isWebEngageAnalyticsEnabled } from '@/lib/env';

const mockBootstrapWebEngageIfReady = bootstrapWebEngageIfReady as jest.MockedFunction<
  typeof bootstrapWebEngageIfReady
>;
const mockIsWebEngageAnalyticsEnabled = isWebEngageAnalyticsEnabled as jest.MockedFunction<
  typeof isWebEngageAnalyticsEnabled
>;

describe('WebEngageAnalyticsScript', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(true);
  });

  it('bootstraps WebEngage after mount when analytics is enabled', async () => {
    const { WebEngageAnalyticsScript } = await import(
      '@/infrastructure/analytics/WebEngageAnalyticsScript'
    );

    render(<WebEngageAnalyticsScript />);

    await waitFor(() => {
      expect(mockBootstrapWebEngageIfReady).toHaveBeenCalledTimes(1);
    });
  });

  it('does not bootstrap when analytics is disabled', async () => {
    mockIsWebEngageAnalyticsEnabled.mockReturnValue(false);

    const { WebEngageAnalyticsScript } = await import(
      '@/infrastructure/analytics/WebEngageAnalyticsScript'
    );

    render(<WebEngageAnalyticsScript />);

    await waitFor(() => {
      expect(mockBootstrapWebEngageIfReady).not.toHaveBeenCalled();
    });
  });
});
