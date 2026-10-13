import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductReviewSummary } from '@/components/product/ProductReviewSummary';

const mockIsProductFeatureEnabled = jest.fn((_feature: string) => false);

jest.mock('@/config/product/product.config', () => ({
  isProductFeatureEnabled: (feature: string) => mockIsProductFeatureEnabled(feature),
  productMessages: {
    reviews: {
      sectionTitle: 'Ratings & Reviews',
      formatBasedOnCount: (count: number) => `Based on ${count} reviews`,
      formatReviewCount: (count: number) => `${count} Reviews`,
      formatRatingFilterLabel: (stars: number, count: number) =>
        `Show ${count} reviews with ${stars} stars`,
      writeReview: 'Write a Review',
      clearRatingFilter: 'Show all ratings',
      a11y: { distribution: 'Rating distribution' },
    },
  },
}));

jest.mock('@/config/theme/product.tokens', () => ({
  productTokens: {
    ink: '#151515',
    reviews: {
      mobileSectionTitle:
        'font-sans min-w-0 flex-1 text-[16px] leading-normal font-normal text-[#151515] capitalize',
      mobileRating:
        'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#151515]',
      mobileStar: 'size-5 shrink-0',
      mobileCount:
        'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#4A4A4A]',
      desktopSectionTitle:
        'font-sans heading-preserve-case text-2xl leading-8 font-bold whitespace-nowrap text-[#151515]',
      feedCount:
        'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#151515] laptop:text-lg laptop:leading-7 laptop:font-semibold laptop:tracking-normal',
      feedHeaderBorder: 'border-b border-[#f1f1f1] laptop:border-b-0',
    },
  },
}));

const stats = {
  reviewsCount: 1012,
  averageRating: 4.7,
  ratingDistribution: [
    { stars: 5, count: 224 },
    { stars: 4, count: 2 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ],
};

describe('ProductReviewSummary', () => {
  beforeEach(() => {
    mockIsProductFeatureEnabled.mockReturnValue(false);
  });

  it('calls onRatingSelect when a distribution row with reviews is clicked', async () => {
    const onRatingSelect = jest.fn();

    render(
      <ProductReviewSummary stats={stats} selectedRating={undefined} onRatingSelect={onRatingSelect} />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /show 224 reviews with 5 stars/i }),
    );

    expect(onRatingSelect).toHaveBeenCalledWith(5);
  });

  it('clears rating filter when clear button is clicked', async () => {
    const onRatingSelect = jest.fn();

    render(
      <ProductReviewSummary stats={stats} selectedRating={5} onRatingSelect={onRatingSelect} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /show all ratings/i }));

    expect(onRatingSelect).toHaveBeenCalledWith(undefined);
  });

  it('renders compact mobile header with rating and review count', () => {
    render(
      <ProductReviewSummary stats={stats} selectedRating={undefined} onRatingSelect={jest.fn()} />,
    );

    expect(screen.getByRole('heading', { name: /ratings & reviews/i })).toBeInTheDocument();
    expect(screen.getAllByText('4.7').length).toBeGreaterThan(0);
    expect(screen.getByText('1012 reviews')).toBeInTheDocument();
  });

  it('hides distribution bars when ratingDistribution is null', () => {
    render(
      <ProductReviewSummary
        stats={{
          reviewsCount: 10,
          averageRating: 4.8,
          ratingDistribution: null,
        }}
        selectedRating={undefined}
        onRatingSelect={jest.fn()}
      />,
    );

    expect(screen.queryByLabelText(/rating distribution/i)).not.toBeInTheDocument();
  });

  it('hides write review when writeProductReview is disabled', () => {
    render(
      <ProductReviewSummary
        stats={stats}
        selectedRating={undefined}
        onRatingSelect={jest.fn()}
        onWriteReview={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /write a review/i })).not.toBeInTheDocument();
  });

  it('shows write review when writeProductReview is enabled', () => {
    mockIsProductFeatureEnabled.mockImplementation(
      (feature: string) => feature === 'writeProductReview',
    );

    render(
      <ProductReviewSummary
        stats={stats}
        selectedRating={undefined}
        onRatingSelect={jest.fn()}
        onWriteReview={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /write a review/i })).toBeInTheDocument();
  });
});
