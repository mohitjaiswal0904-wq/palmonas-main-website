import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductGridEmptyState } from '@/components/global/product-listing/ProductGridEmptyState';
import { productListingMessages } from '@/config/product-listing/product-listing.config';

const clearFilters = jest.fn();

jest.mock('@/hooks/useProductListingControls', () => ({
  useProductListingControls: () => ({
    clearFilters,
  }),
}));

describe('ProductGridEmptyState', () => {
  beforeEach(() => {
    clearFilters.mockClear();
  });

  it('renders the empty filters message', () => {
    render(<ProductGridEmptyState />);

    expect(
      screen.getByRole('heading', { name: productListingMessages.emptyTitle }),
    ).toBeInTheDocument();
  });

  it('clears all filters when the CTA is clicked', async () => {
    const user = userEvent.setup();
    render(<ProductGridEmptyState />);

    await user.click(
      screen.getByRole('button', { name: productListingMessages.a11y.clearFilters }),
    );

    expect(clearFilters).toHaveBeenCalledTimes(1);
  });

  it('pads the empty state away from the left edge', () => {
    const { container } = render(<ProductGridEmptyState />);

    expect(container.firstChild).toHaveClass('px-4');
  });

  it('uses status role for the empty listing region', () => {
    render(<ProductGridEmptyState />);

    expect(
      screen.getByRole('status', { name: productListingMessages.a11y.emptyListing }),
    ).toBeInTheDocument();
  });
});
