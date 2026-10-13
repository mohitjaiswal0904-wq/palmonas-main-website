/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';

const mockAttach = jest.fn(() => jest.fn());

jest.mock('@/lib/analytics/named-horizontal-scroll', () => ({
  attachNamedHorizontalScrollTracking: mockAttach,
}));

describe('NamedHorizontalScrollTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a labeled scroll region and attaches tracking', async () => {
    const { NamedHorizontalScrollTrack } = await import(
      '@/components/analytics/NamedHorizontalScrollTrack'
    );

    render(
      <NamedHorizontalScrollTrack
        eventName="carousel_scrolled"
        sectionName="product_carousel"
        role="region"
        ariaLabel="Products"
      >
        <span>card</span>
      </NamedHorizontalScrollTrack>,
    );

    expect(screen.getByRole('region', { name: 'Products' })).toBeInTheDocument();
    expect(mockAttach).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        eventName: 'carousel_scrolled',
        sectionName: 'product_carousel',
      }),
    );
  });

  it('detaches tracking on unmount', async () => {
    const cleanup = jest.fn();
    mockAttach.mockReturnValueOnce(cleanup);
    const { NamedHorizontalScrollTrack } = await import(
      '@/components/analytics/NamedHorizontalScrollTrack'
    );

    const { unmount } = render(
      <NamedHorizontalScrollTrack eventName="offers_rail_scrolled" sectionName="offers_rail">
        <span>offer</span>
      </NamedHorizontalScrollTrack>,
    );

    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
