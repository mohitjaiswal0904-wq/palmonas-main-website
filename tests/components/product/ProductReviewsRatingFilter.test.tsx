import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductReviewsRatingFilter } from '@/components/product/ProductReviewsRatingFilter';

jest.mock('@/config/product/product.config', () => ({
  productMessages: {
    reviews: {
      allRatings: 'All',
      formatStarRatingLabel: (stars: number) => `Show ${stars} star reviews`,
      a11y: {
        ratingFilterBar: 'Filter reviews by star rating',
        allRatings: 'Show all star ratings',
      },
    },
  },
}));

describe('ProductReviewsRatingFilter', () => {
  it('renders All and star rating buttons', () => {
    render(<ProductReviewsRatingFilter value={undefined} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: /show all star ratings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show 5 star reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show 1 star reviews/i })).toBeInTheDocument();
  });

  it('calls onChange with selected star rating', async () => {
    const onChange = jest.fn();
    render(<ProductReviewsRatingFilter value={undefined} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /show 4 star reviews/i }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('clears filter when the active star button is clicked again', async () => {
    const onChange = jest.fn();
    render(<ProductReviewsRatingFilter value={5} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /show 5 star reviews/i }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('clears filter when All is clicked', async () => {
    const onChange = jest.fn();
    render(<ProductReviewsRatingFilter value={3} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: /show all star ratings/i }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
