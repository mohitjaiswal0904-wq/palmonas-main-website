import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProductRating } from '@/components/product/ProductRating';
import { productMessages } from '@/config/product/product.config';

const mockIsEnabled = jest.fn();

jest.mock('@/config/product/product.config', () => {
  const actual = jest.requireActual('@/config/product/product.config');
  return {
    ...actual,
    isProductFeatureEnabled: (feature: string) => mockIsEnabled(feature),
  };
});

describe('ProductRating', () => {
  beforeEach(() => {
    mockIsEnabled.mockImplementation((feature: string) => feature === 'ratingBadge');
  });

  it('renders rating from reviews when flag enabled', () => {
    render(<ProductRating reviews={{ avgRating: 4.5, reviewCount: 12 }} />);
    expect(screen.getByText('4.5')).toHaveClass('text-xs');
    expect(
      screen.getByLabelText(`${productMessages.a11y.rating}: 4.5 out of 5`),
    ).toBeInTheDocument();
  });

  it('shows five stars with yellow fill matching the average', () => {
    render(<ProductRating reviews={{ avgRating: 4.7, reviewCount: 599 }} />);
    const stars = screen.getAllByTestId('pdp-rating-star');

    expect(stars).toHaveLength(5);
    expect(stars.map((star) => star.getAttribute('data-fill'))).toEqual([
      '100',
      '100',
      '100',
      '100',
      '70',
    ]);
  });

  it('leaves the fifth star empty for a whole four-star average', () => {
    render(<ProductRating avgRating={4} reviewCount={3} />);
    const stars = screen.getAllByTestId('pdp-rating-star');

    expect(stars[4]).toHaveAttribute('data-fill', '0');
  });

  it('renders product-level avgRating when reviews missing', () => {
    render(<ProductRating avgRating={4} reviewCount={3} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('jumps to reviews when the rating row is clicked', async () => {
    const onReviewCountClick = jest.fn();
    render(
      <ProductRating
        reviews={{ avgRating: 4.5, reviewCount: 12 }}
        onReviewCountClick={onReviewCountClick}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /jump to 12 reviews/i }));
    expect(onReviewCountClick).toHaveBeenCalledTimes(1);
  });

  it('still jumps when the stars are clicked', async () => {
    const onReviewCountClick = jest.fn();
    render(
      <ProductRating
        reviews={{ avgRating: 4.7, reviewCount: 599 }}
        onReviewCountClick={onReviewCountClick}
      />,
    );

    await userEvent.click(screen.getAllByTestId('pdp-rating-star')[0]!);
    expect(onReviewCountClick).toHaveBeenCalledTimes(1);
  });

  it('hides the review-count jump when count is missing', () => {
    render(<ProductRating avgRating={4.5} />);
    expect(screen.queryByRole('button', { name: /jump to/i })).not.toBeInTheDocument();
  });

  it('hides when average rating is below 4', () => {
    const { container } = render(
      <ProductRating reviews={{ avgRating: 3.9, reviewCount: 12 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hides product-level ratings below 4', () => {
    const { container } = render(<ProductRating avgRating={3.5} reviewCount={8} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides when ratingBadge flag is off', () => {
    mockIsEnabled.mockReturnValue(false);
    const { container } = render(
      <ProductRating reviews={{ avgRating: 4.5, reviewCount: 12 }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('hides when no rating data is available', () => {
    const { container } = render(<ProductRating />);
    expect(container).toBeEmptyDOMElement();
  });
});
