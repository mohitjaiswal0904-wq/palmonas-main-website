import { render, screen } from '@testing-library/react';

import { ProductCardOfferPromo } from '@/components/product/ProductCardOfferPromo';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, width, height }: { alt: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
    <img alt={alt} width={width} height={height} />
  ),
}));

describe('ProductCardOfferPromo', () => {
  it('renders the original offer line when no effective price exists', () => {
    render(
      <ProductCardOfferPromo
        primaryText="Extra 25% OFF"
        moreOffersLabel="+ 2 more"
        effectivePrice={null}
        textClass="text-xs"
      />,
    );

    expect(screen.getByText(/Extra 25% OFF/)).toBeInTheDocument();
    expect(screen.getByText('+ 2 more')).toBeInTheDocument();
    expect(screen.queryByText(/Get it for/)).not.toBeInTheDocument();
  });

  it('cycles in the gold Get-it-for pill when a rupee price is available', () => {
    render(
      <ProductCardOfferPromo
        primaryText="Extra 25% OFF"
        moreOffersLabel="+ 2 more"
        effectivePrice={1111}
        textClass="text-xs"
      />,
    );

    expect(screen.getByText(/Extra 25% OFF/)).toBeInTheDocument();
    expect(screen.getByText(/Get it for/)).toBeInTheDocument();
    expect(screen.getByText('₹1,111')).toBeInTheDocument();
    expect(screen.getByText(/with offers/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('card-offer-cycle');
  });

  it('omits the more-offers suffix when additionalCount is zero', () => {
    render(
      <ProductCardOfferPromo
        primaryText="Extra 10% off"
        moreOffersLabel={null}
        effectivePrice={null}
        textClass="text-xs"
      />,
    );

    expect(screen.getByText(/Extra 10% off/)).toBeInTheDocument();
    expect(screen.queryByText(/more/)).not.toBeInTheDocument();
  });

  it('names both offer states for assistive tech', () => {
    render(
      <ProductCardOfferPromo
        primaryText="Extra 25% OFF"
        moreOffersLabel="+ 2 more"
        effectivePrice={1111}
        textClass="text-xs"
      />,
    );

    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Extra 25% OFF + 2 more. Get it for ₹1,111 with offers',
    );
  });
});
