import { render, screen } from '@testing-library/react';

import { ProductRelatedProductsLoader } from '@/components/product/ProductRelatedProductsLoader';
import { useRelatedProducts } from '@/hooks/useProducts';
import { AppError } from '@/lib/errors';
import type { Product } from '@/types/product';

jest.mock('@/hooks/useProducts', () => ({
  useRelatedProducts: jest.fn(),
}));

jest.mock('@/components/product/RelatedProducts', () => ({
  RelatedProducts: ({
    products,
    showOfferPromo = true,
  }: {
    products: Array<{ name: string }>;
    showOfferPromo?: boolean;
  }) => (
    <section
      aria-labelledby="similar-products-heading"
      data-testid="similar-products"
      data-show-offer-promo={String(showOfferPromo)}
    >
      <h2 id="similar-products-heading">Similar Products</h2>
      {products.map((product) => (
        <p key={product.name}>{product.name}</p>
      ))}
    </section>
  ),
}));

const mockUseRelatedProducts = useRelatedProducts as jest.MockedFunction<typeof useRelatedProducts>;

const relatedProduct: Product = {
  id: 'p2',
  handle: 'related-ring',
  name: 'Related Ring',
  description: '',
  price: 999,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-2',
      title: 'Default',
      price: 999,
      availableForSale: true,
      selectedOptions: [],
    },
  ],
};

describe('ProductRelatedProductsLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing while related products are loading', () => {
    mockUseRelatedProducts.mockReturnValue({
      products: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<ProductRelatedProductsLoader productId="p1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders similar products when data is available', () => {
    mockUseRelatedProducts.mockReturnValue({
      products: [relatedProduct],
      isLoading: false,
      error: null,
    });

    render(<ProductRelatedProductsLoader productId="p1" />);
    expect(screen.getByRole('heading', { name: /similar products/i })).toBeInTheDocument();
    expect(screen.getByText('Related Ring')).toBeInTheDocument();
    expect(screen.getByTestId('similar-products')).toHaveAttribute('data-show-offer-promo', 'true');
  });

  it('renders nothing when the related-products request fails', () => {
    mockUseRelatedProducts.mockReturnValue({
      products: undefined,
      isLoading: false,
      error: new AppError('NETWORK', 'Failed'),
    });

    const { container } = render(<ProductRelatedProductsLoader productId="p1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when related products list is empty', () => {
    mockUseRelatedProducts.mockReturnValue({
      products: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<ProductRelatedProductsLoader productId="p1" />);
    expect(container).toBeEmptyDOMElement();
  });
});
