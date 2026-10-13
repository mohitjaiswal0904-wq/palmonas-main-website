import { render, screen } from '@testing-library/react';

import { ProductReviewsFeed } from '@/components/product/ProductReviewsFeed';
import type { ProductReview } from '@/types/product/reviews';

jest.mock('@/components/product/ProductReviewCard', () => ({
  ProductReviewCard: ({ review }: { review: ProductReview }) => <div>{review.reviewerName}</div>,
}));

jest.mock('@/components/product/ProductReviewsFilterDropdown', () => ({
  ProductReviewsFilterDropdown: () => <div data-testid="reviews-filter" />,
}));

const review: ProductReview = {
  id: 1,
  reviewerName: 'Meera Reddy',
  body: 'Perfect gift!',
  rating: 5,
  helpfulCount: 1,
  notHelpfulCount: 0,
  isVerifiedPurchase: false,
  createdAt: '2025-10-25T10:00:00.000Z',
};

function renderFeed(overrides: Partial<Parameters<typeof ProductReviewsFeed>[0]> = {}) {
  return render(
    <ProductReviewsFeed
      filter={{ kind: 'period', period: 'most_recent' }}
      onFilterChange={jest.fn()}
      displayCount={4}
      reviews={[review]}
      isFetchingReviews={false}
      {...overrides}
    />,
  );
}

describe('ProductReviewsFeed', () => {
  it('uses a tight mobile top margin matching the summary stack', () => {
    const { container } = renderFeed();
    const root = container.firstElementChild;

    expect(root).toHaveClass('mt-3', 'laptop:mt-0');
    expect(root?.className.split(' ').includes('mt-8')).toBe(false);
  });

  it('renders the review count and cards', () => {
    renderFeed({ displayCount: 4 });

    expect(screen.getByText('4 Reviews')).toBeInTheDocument();
    expect(screen.getByText('Meera Reddy')).toBeInTheDocument();
  });

  it('shows empty copy when no reviews match the filter', () => {
    renderFeed({ reviews: [], displayCount: 0 });

    expect(screen.getByText(/no reviews match these filters/i)).toBeInTheDocument();
  });

  it('shows skeletons while a filter request is in flight', () => {
    renderFeed({ isFetchingReviews: true, reviews: [] });

    expect(screen.queryByText('Meera Reddy')).not.toBeInTheDocument();
  });
});
