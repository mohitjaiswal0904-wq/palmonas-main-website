import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { useProductReviews } from '@/hooks/product/useProductReviews';

jest.mock('@/hooks/product/useProductReviews', () => ({
  useProductReviews: jest.fn(),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useRequireAuth: () => ({
    guard: (action: () => void) => action(),
    guardApi: async <T,>(fn: () => Promise<T>) => fn(),
    guardModal: (open: () => void) => open(),
    isAuthenticated: true,
    openLogin: jest.fn(),
  }),
}));

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => true,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('@/hooks/product/useCreateProductReview', () => ({
  useCreateProductReview: () => ({
    createReview: jest.fn(),
    isSubmitting: false,
  }),
}));

jest.mock('@/components/product/WriteReviewOverlay', () => ({
  WriteReviewOverlay: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Write a Review">Write overlay</div> : null,
  openWriteReviewGuarded: (openWrite: () => void) => openWrite(),
}));

jest.mock('@/components/product/ProductAllReviewsOverlay', () => ({
  ProductAllReviewsOverlay: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="All Reviews">All reviews overlay</div> : null,
}));

jest.mock('@/config/product/product.config', () => ({
  isProductFeatureEnabled: jest.fn(() => true),
  productConfig: { reviews: { pageSize: 4, fullPageSize: 20 } },
  productMessages: {
    reviews: {
      sectionTitle: 'Ratings & Reviews',
      formatReviewCount: (count: number) => `${count} Reviews`,
      formatBasedOnCount: (count: number) => `Based on ${count} reviews`,
      formatRatingFilterLabel: (stars: number, count: number) =>
        `Show ${count} reviews with ${stars} stars`,
      formatStarRatingLabel: (stars: number) => `Show ${stars} star reviews`,
      formatRatingFilterTrigger: (stars: number) => `${stars}★`,
      mostRelevant: 'All',
      writeReview: 'Write a Review',
      viewAll: 'View All',
      allReviewsTitle: 'All Reviews',
      loadingMore: 'Loading…',
      noMatchingReviews: 'No reviews match these filters.',
      clearRatingFilter: 'Show all ratings',
      allRatings: 'All',
      periodSectionLabel: 'Time',
      ratingSectionLabel: 'Rating',
      helpful: 'Helpful',
      notHelpful: 'Not helpful',
      periods: {
        most_recent: 'Most Recent',
        last_3_months: 'Last 3 Months',
        last_6_months: 'Last 6 Months',
        all: 'All Time',
      },
      a11y: {
        distribution: 'Rating distribution',
        periodFilter: 'Filter reviews by time period',
        filterDropdown: 'Filter reviews',
        ratingFilterBar: 'Filter reviews by star rating',
        allRatings: 'Show all star ratings',
        starRating: 'Show {{stars}} star reviews',
        ratingFilter: 'Show {{count}} reviews with {{stars}} stars',
        closeAllReviews: 'Close all reviews',
        closeWriteReview: 'Close write review',
      },
    },
  },
  productTheme: {
    ink: '#151515',
    pdpRhythm: {
      reviewsSectionClass:
        'laptop:px-10 laptop:pb-14 laptop:pt-4 mx-auto max-w-[1200px] px-4 pt-4 pb-8',
    },
    reviews: {
      desktopSectionTitle:
        'heading-preserve-case text-2xl leading-8 font-bold whitespace-nowrap text-[#151515]',
    },
  },
}));

jest.mock('@/config/theme/product.tokens', () => ({
  productTokens: {
    ink: '#151515',
    reviews: {
      desktopSectionTitle:
        'font-sans heading-preserve-case text-2xl leading-8 font-bold whitespace-nowrap text-[#151515]',
      feedCount:
        'font-sans whitespace-nowrap text-[16px] leading-6 font-normal tracking-[-0.3125px] text-[#151515] laptop:text-lg laptop:leading-7 laptop:font-semibold laptop:tracking-normal',
      feedHeaderBorder: 'border-b border-[#f1f1f1] laptop:border-b-0',
    },
  },
}));

const mockUseProductReviews = useProductReviews as jest.MockedFunction<typeof useProductReviews>;

const stats = {
  reviewsCount: 592,
  averageRating: 4.7,
  ratingDistribution: [
    { stars: 5, count: 224 },
    { stars: 4, count: 2 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ],
};

const review = {
  id: 1,
  reviewerName: 'Meera Reddy',
  body: 'Perfect gift!',
  rating: 5,
  helpfulCount: 1,
  notHelpfulCount: 0,
  isVerifiedPurchase: false,
  createdAt: '2025-10-25T10:00:00.000Z',
};

function mockReviewsHook(
  overrides: Partial<ReturnType<typeof useProductReviews>> = {},
): ReturnType<typeof useProductReviews> {
  return {
    reviews: [review],
    stats,
    hasMoreReviews: true,
    totalCount: 592,
    isLoading: false,
    isFetchingReviews: false,
    isLoadingMoreReviews: false,
    loadMoreReviews: jest.fn(),
    error: null,
    ...overrides,
  };
}

describe('ProductReviewsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProductReviews.mockReturnValue(mockReviewsHook());
  });

  it('shows section skeleton while loading', () => {
    mockUseProductReviews.mockReturnValue(
      mockReviewsHook({ reviews: [], stats: undefined, isLoading: true }),
    );

    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);
    expect(screen.getAllByLabelText(/loading/i).length).toBeGreaterThan(0);
  });

  it('requests Most Relevant reviews by default', () => {
    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    expect(mockUseProductReviews).toHaveBeenCalledWith('8417236779265', 4, { kind: 'relevant' });
  });

  it('renders summary, period filter, review cards, and View All', () => {
    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    expect(screen.getAllByRole('heading', { name: /ratings & reviews/i }).length).toBeGreaterThan(0);
    expect(screen.getByText('592 Reviews')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter reviews/i })).toBeInTheDocument();
    expect(screen.getByText('Meera Reddy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
  });

  it('passes updated period filter to the reviews hook', async () => {
    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    await userEvent.click(screen.getByRole('button', { name: /filter reviews/i }));
    await userEvent.click(screen.getByRole('option', { name: /last 3 months/i }));

    expect(mockUseProductReviews).toHaveBeenCalledWith('8417236779265', 4, {
      kind: 'period',
      period: 'last_3_months',
    });
  });

  it('opens all-reviews overlay from View All', async () => {
    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    await userEvent.click(screen.getByRole('button', { name: /view all/i }));

    expect(screen.getByRole('dialog', { name: /all reviews/i })).toBeInTheDocument();
  });

  it('shows empty feed copy when filters return no reviews on PDP preview', () => {
    mockUseProductReviews.mockReturnValue(
      mockReviewsHook({ reviews: [], totalCount: 0, hasMoreReviews: false }),
    );

    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    expect(screen.getByText(/no reviews match these filters/i)).toBeInTheDocument();
  });

  it('opens write review when Write a Review is clicked', async () => {
    render(<ProductReviewsSection productId="8417236779265" productHandle="gold-ring" />);

    await userEvent.click(screen.getByRole('button', { name: /^write a review$/i }));

    expect(screen.getByRole('dialog', { name: /write a review/i })).toBeInTheDocument();
  });
});
