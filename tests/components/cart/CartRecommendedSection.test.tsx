import { render, screen } from '@testing-library/react';

import { CartRecommendedSection } from '@/components/cart/CartRecommendedSection';
import { cartMessages } from '@/config/cart/cart.config';
import type { Product } from '@/types/product';

const mockUseCartRecommendedProducts = jest.fn();

jest.mock('@/config/cart/cart.config', () => {
  const actual = jest.requireActual('@/config/cart/cart.config');
  return {
    ...actual,
    isCartFeatureEnabled: jest.fn((feature: string) => feature === 'recommendedUpsell'),
  };
});

jest.mock('@/hooks/cart/useCartRecommendedProducts', () => ({
  useCartRecommendedProducts: (...args: unknown[]) => mockUseCartRecommendedProducts(...args),
}));

jest.mock('@/components/global/product-listing/ProductCarousel', () => ({
  ProductCarousel: ({
    products,
    ariaLabel,
    itemClassName,
    showOfferPromo = true,
    compactOfferPromo,
  }: {
    products: Product[];
    ariaLabel?: string;
    itemClassName?: string;
    showOfferPromo?: boolean;
    compactOfferPromo?: boolean;
  }) => (
    <div
      role="region"
      aria-label={ariaLabel}
      data-testid="product-carousel"
      data-item-class={itemClassName}
      data-show-offer-promo={String(showOfferPromo)}
      data-compact-offer-promo={String(compactOfferPromo)}
    >
      {products.map((product) => (
        <span key={product.id}>{product.name}</span>
      ))}
    </div>
  ),
}));

const { isCartFeatureEnabled } = jest.requireMock('@/config/cart/cart.config') as {
  isCartFeatureEnabled: jest.Mock;
};

/**
 * Builds a product fixture for recommended section tests.
 *
 * @param overrides - Partial product fields to merge.
 * @returns A typed Product ready for rendering.
 */
function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    handle: 'lunar-flow',
    name: 'Lunar Flow 9KT Gold Bracelet',
    description: '',
    price: 332_266,
    image: 'https://cdn.example.com/lunar.jpg',
    images: ['https://cdn.example.com/lunar.jpg'],
    category: 'bracelets',
    productCategory: 'gold',
    avgRating: 4.5,
    reviewCount: 125,
    colors: ['yellow gold', 'white gold', 'rose gold'],
    offers: [],
    variants: [
      {
        id: 'variant-1',
        title: 'Default',
        price: 332_266,
        availableForSale: true,
        selectedOptions: [],
      },
    ],
    ...overrides,
  };
}

describe('CartRecommendedSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isCartFeatureEnabled.mockImplementation((feature: string) => feature === 'recommendedUpsell');
    mockUseCartRecommendedProducts.mockReturnValue({
      products: [makeProduct()],
      isLoading: false,
      error: null,
    });
  });

  it('renders the heading and a standard product carousel', () => {
    render(<CartRecommendedSection />);

    expect(screen.getByTestId('cart-recommended-section')).toBeInTheDocument();
    const heading = screen.getByText(cartMessages.recommendedForYou);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass(
      'text-[15px]',
      'font-semibold',
      'px-[10px]',
      'tab:px-[5px]',
      'laptop:px-0',
    );
    expect(screen.getByTestId('product-carousel')).toBeInTheDocument();
    expect(screen.getByText('Lunar Flow 9KT Gold Bracelet')).toBeInTheDocument();
  });

  it('shows 2.2 cards per view in the cart column with compact offer promo', () => {
    render(<CartRecommendedSection />);

    const carousel = screen.getByTestId('product-carousel');
    expect(carousel).toHaveAttribute('data-item-class', 'w-[calc(500cqw/9)]');
    expect(carousel).toHaveAttribute('data-show-offer-promo', 'true');
    expect(carousel).toHaveAttribute('data-compact-offer-promo', 'true');
  });

  it('labels the section and carousel region for assistive tech', () => {
    render(<CartRecommendedSection />);

    expect(
      screen.getByRole('region', { name: cartMessages.recommendedForYou }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cart-recommended-section')).toHaveAttribute(
      'aria-label',
      cartMessages.a11y.recommendedSection,
    );
  });

  it('returns null when the feature is disabled', () => {
    isCartFeatureEnabled.mockReturnValue(false);
    const { container } = render(<CartRecommendedSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a loading skeleton while products load', () => {
    mockUseCartRecommendedProducts.mockReturnValue({
      products: [],
      isLoading: true,
      error: null,
    });

    render(<CartRecommendedSection />);
    expect(screen.getByTestId('cart-recommended-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('product-carousel')).not.toBeInTheDocument();
  });

  it('returns null when there are no products', () => {
    mockUseCartRecommendedProducts.mockReturnValue({
      products: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<CartRecommendedSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when the recommendations request fails', () => {
    mockUseCartRecommendedProducts.mockReturnValue({
      products: [makeProduct()],
      isLoading: false,
      error: { code: 'SERVER_ERROR', message: 'boom' },
    });

    const { container } = render(<CartRecommendedSection />);
    expect(container).toBeEmptyDOMElement();
  });
});
