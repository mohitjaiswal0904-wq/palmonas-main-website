import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductReviewsFilterDropdown } from '@/components/product/ProductReviewsFilterDropdown';
import { DEFAULT_PRODUCT_REVIEWS_FILTER } from '@/lib/product/product-reviews-path';

jest.mock('@/config/product/product.config', () => {
  const periods = {
    most_recent: 'Most Recent',
    last_3_months: 'Last 3 Months',
    last_6_months: 'Last 6 Months',
    all: 'All Time',
  };

  return {
    productMessages: {
      reviews: {
        allRatings: 'All',
        periodSectionLabel: 'Time',
        ratingSectionLabel: 'Rating',
        formatStarRatingLabel: (stars: number) => `Show ${stars} star reviews`,
        formatRatingFilterTrigger: (stars: number) => `${stars}★`,
        mostRelevant: 'All',
        periods,
        a11y: {
          filterDropdown: 'Filter reviews',
          periodFilter: 'Filter reviews by time period',
          ratingFilterBar: 'Filter reviews by star rating',
          allRatings: 'Show all star ratings',
        },
      },
    },
  };
});

describe('ProductReviewsFilterDropdown', () => {
  it('shows All as the default trigger label', () => {
    render(
      <ProductReviewsFilterDropdown
        filter={DEFAULT_PRODUCT_REVIEWS_FILTER}
        onFilterChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /filter reviews/i })).toHaveTextContent('All');
  });

  it('opens panel with period options and star rating buttons', async () => {
    render(
      <ProductReviewsFilterDropdown
        filter={DEFAULT_PRODUCT_REVIEWS_FILTER}
        onFilterChange={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));

    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^all$/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: /most recent/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('button', { name: /show 5 star reviews/i })).toBeInTheDocument();
  });

  it('calls onFilterChange with period-only filter when a period is selected', async () => {
    const onFilterChange = jest.fn();
    render(
      <ProductReviewsFilterDropdown
        filter={{ kind: 'rating', rating: 5 }}
        onFilterChange={onFilterChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));
    await userEvent.click(screen.getByRole('option', { name: /last 3 months/i }));

    expect(onFilterChange).toHaveBeenCalledWith({ kind: 'period', period: 'last_3_months' });
    expect(screen.queryByRole('dialog', { name: /filter reviews/i })).not.toBeInTheDocument();
  });

  it('calls onFilterChange with rating-only filter when a star is selected', async () => {
    const onFilterChange = jest.fn();
    render(
      <ProductReviewsFilterDropdown
        filter={DEFAULT_PRODUCT_REVIEWS_FILTER}
        onFilterChange={onFilterChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));
    await userEvent.click(screen.getByRole('button', { name: /show 4 star reviews/i }));

    expect(onFilterChange).toHaveBeenCalledWith({ kind: 'rating', rating: 4 });
    expect(screen.queryByRole('dialog', { name: /filter reviews/i })).not.toBeInTheDocument();
  });

  it('calls onFilterChange with relevant filter when All is selected', async () => {
    const onFilterChange = jest.fn();
    render(
      <ProductReviewsFilterDropdown
        filter={{ kind: 'period', period: 'most_recent' }}
        onFilterChange={onFilterChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));
    await userEvent.click(screen.getByRole('option', { name: /^all$/i }));

    expect(onFilterChange).toHaveBeenCalledWith({ kind: 'relevant' });
    expect(screen.queryByRole('dialog', { name: /filter reviews/i })).not.toBeInTheDocument();
  });

  it('closes dropdown after selecting All while already on All', async () => {
    render(
      <ProductReviewsFilterDropdown
        filter={DEFAULT_PRODUCT_REVIEWS_FILTER}
        onFilterChange={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));
    expect(screen.getByRole('dialog', { name: /filter reviews/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('option', { name: /^all$/i }));

    expect(screen.queryByRole('dialog', { name: /filter reviews/i })).not.toBeInTheDocument();
  });

  it('shows rating-only label in trigger when star filter is active', () => {
    render(
      <ProductReviewsFilterDropdown
        filter={{ kind: 'rating', rating: 5 }}
        onFilterChange={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /filter reviews/i })).toHaveTextContent('5★');
  });
});
