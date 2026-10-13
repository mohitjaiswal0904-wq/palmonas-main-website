import { render, screen } from '@testing-library/react';

import { OfferPercentStarIcon } from '@/components/icons/OfferPercentStarIcon';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, width, height }: { alt: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} width={width} height={height} />
  ),
}));

describe('OfferPercentStarIcon', () => {
  it('renders the Figma star at 11×11', () => {
    const { container } = render(<OfferPercentStarIcon />);
    const image = container.querySelector('img');

    expect(image).toHaveAttribute('width', '11');
    expect(image).toHaveAttribute('height', '11');
  });

  it('overlays a percent glyph on the star', () => {
    render(<OfferPercentStarIcon />);

    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('hides the seal from assistive tech', () => {
    const { container } = render(<OfferPercentStarIcon />);

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('clips the star to the 11px box', () => {
    const { container } = render(<OfferPercentStarIcon />);

    expect(container.firstElementChild).toHaveClass('h-[11px]', 'w-[11px]', 'overflow-hidden');
  });
});
