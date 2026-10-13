import { render, screen } from '@testing-library/react';

import { ProductReviewCard } from '@/components/product/ProductReviewCard';

const mockIsProductFeatureEnabled = jest.fn();

jest.mock('@/config/product/product.config', () => {
  const actual = jest.requireActual('@/config/product/product.config');
  return {
    ...actual,
    isProductFeatureEnabled: (feature: string) => mockIsProductFeatureEnabled(feature),
  };
});

const review = {
  id: 1,
  reviewerName: 'Meera Reddy',
  body: 'Perfect gift!',
  rating: 5,
  helpfulCount: 2,
  notHelpfulCount: 1,
  isVerifiedPurchase: false,
  createdAt: '2025-10-25T10:00:00.000Z',
};

describe('ProductReviewCard', () => {
  beforeEach(() => {
    mockIsProductFeatureEnabled.mockImplementation((feature: string) => feature === 'reviewVotes');
  });

  it('renders reviewer initials, name, body, and helpful counts when votes are enabled', () => {
    render(<ProductReviewCard review={review} />);

    expect(screen.getByText('MR')).toBeInTheDocument();
    expect(screen.getByText('Meera Reddy')).toBeInTheDocument();
    expect(screen.getByText('Perfect gift!')).toBeInTheDocument();
    expect(screen.getByLabelText('Helpful: 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Not helpful: 1')).toBeInTheDocument();
  });

  it('hides helpful vote counts when reviewVotes is disabled', () => {
    mockIsProductFeatureEnabled.mockReturnValue(false);

    render(<ProductReviewCard review={review} />);

    expect(screen.getByText('Meera Reddy')).toBeInTheDocument();
    expect(screen.queryByLabelText(/helpful/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/not helpful/i)).not.toBeInTheDocument();
  });

  it('shows five stars when rating is null (Loox import fallback)', () => {
    const { container } = render(
      <ProductReviewCard
        review={{
          id: 2,
          reviewerName: 'Aseem G.',
          body: 'Nice product',
          rating: null,
          helpfulCount: 0,
          notHelpfulCount: 0,
          isVerifiedPurchase: false,
          createdAt: '2025-10-25T10:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByText('Aseem G.')).toBeInTheDocument();
    expect(container.querySelectorAll('svg[aria-hidden="true"]').length).toBeGreaterThanOrEqual(5);
  });
});
