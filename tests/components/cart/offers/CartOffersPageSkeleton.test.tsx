import { render, screen } from '@testing-library/react';

import { CartOffersPageSkeleton } from '@/components/cart/offers/CartOffersPageSkeleton';
import { cartMessages } from '@/config/cart/cart.config';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

describe('CartOffersPageSkeleton', () => {
  it('renders the all-offers heading', () => {
    render(<CartOffersPageSkeleton />);

    expect(screen.getByText(cartMessages.allOffers)).toBeInTheDocument();
  });

  it('renders four offer card placeholders', () => {
    render(<CartOffersPageSkeleton />);

    expect(screen.getAllByTestId('offer-list-card-skeleton')).toHaveLength(4);
  });

  it('marks the grid as busy with loading copy', () => {
    render(<CartOffersPageSkeleton />);

    const grid = screen.getByTestId('all-offers-skeleton');
    expect(grid).toHaveAttribute('aria-busy', 'true');
    expect(grid).toHaveAttribute('aria-label', cartMessages.discounts.loading);
  });

  it('does not render apply actions while loading', () => {
    render(<CartOffersPageSkeleton />);

    expect(screen.queryByRole('button', { name: cartMessages.applyCode })).not.toBeInTheDocument();
    expect(screen.queryByTestId('offer-list-card')).not.toBeInTheDocument();
  });
});
