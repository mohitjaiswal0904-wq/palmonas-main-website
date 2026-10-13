/** @jest-environment jsdom */

import { fireEvent, render, waitFor } from '@testing-library/react';

const mockTrackAnalyticsEvent = jest.fn().mockResolvedValue(undefined);

jest.mock('next/navigation', () => ({
  usePathname: () => '/products/ring',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('@/infrastructure/analytics/analytics-client', () => ({
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}));

describe('AnalyticsInteractionTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('tracks semantic add-to-cart clicks with route context', async () => {
    const { AnalyticsInteractionTracker } = await import(
      '@/infrastructure/analytics/AnalyticsInteractionTracker'
    );

    render(
      <>
        <AnalyticsInteractionTracker />
        <button type="button">Add to cart</button>
      </>,
    );

    fireEvent.click(document.querySelector('button') as HTMLButtonElement);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'add_to_cart_clicked',
          properties: expect.objectContaining({
            label: 'Add to cart',
            path: '/products/ring',
            product_id: 'ring',
          }),
        }),
      );
    });
  });

  it('does not track unclassified button clicks', async () => {
    const { AnalyticsInteractionTracker } = await import(
      '@/infrastructure/analytics/AnalyticsInteractionTracker'
    );

    render(
      <>
        <AnalyticsInteractionTracker />
        <button type="button">Dismiss</button>
      </>,
    );

    fireEvent.click(document.querySelector('button') as HTMLButtonElement);

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
    });
  });

  it('does not track modified clicks', async () => {
    const { AnalyticsInteractionTracker } = await import(
      '@/infrastructure/analytics/AnalyticsInteractionTracker'
    );

    render(
      <>
        <AnalyticsInteractionTracker />
        <button type="button">Add to cart</button>
      </>,
    );

    fireEvent.click(document.querySelector('button') as HTMLButtonElement, {
      ctrlKey: true,
    });

    await waitFor(() => {
      expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled();
    });
  });
});
