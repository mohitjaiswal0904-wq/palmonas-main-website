import { render, screen } from '@testing-library/react';

import { ProductBundlesLoader } from '@/components/product/ProductBundlesLoader';
import { useProductBundles } from '@/hooks/useProducts';
import { AppError } from '@/lib/errors';
import type { Product } from '@/types/product';
import type { ProductBundle } from '@/types/product/bundles';

jest.mock('@/hooks/useProducts', () => ({
  useProductBundles: jest.fn(),
}));

jest.mock('@/components/product/RelatedProducts', () => ({
  RelatedProducts: ({
    title,
    headingId,
    products,
  }: {
    title?: string;
    headingId?: string;
    products: Array<{ name: string }>;
  }) => (
    <section aria-labelledby={headingId} data-testid={headingId}>
      <h2 id={headingId}>{title}</h2>
      {products.map((product) => (
        <p key={product.name}>{product.name}</p>
      ))}
    </section>
  ),
}));

const mockUseProductBundles = useProductBundles as jest.MockedFunction<typeof useProductBundles>;

const bundleProduct: Product = {
  id: 'p2',
  handle: 'look-ring',
  name: 'Look Ring',
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

const completeLook: ProductBundle = {
  key: 'complete_look_product',
  title: 'Complete Look',
  products: [bundleProduct],
};

const shopTheLook: ProductBundle = {
  key: 'shop_the_look',
  title: 'Shop the Look',
  products: [{ ...bundleProduct, id: 'p3', name: 'Look Earrings' }],
};

describe('ProductBundlesLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing while bundles are loading', () => {
    mockUseProductBundles.mockReturnValue({
      bundles: undefined,
      isLoading: true,
      error: null,
    });

    const { container } = render(<ProductBundlesLoader productHandle="gold-bracelet" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders each non-empty bundle rail', () => {
    mockUseProductBundles.mockReturnValue({
      bundles: [completeLook, shopTheLook],
      isLoading: false,
      error: null,
    });

    render(<ProductBundlesLoader productHandle="gold-bracelet" />);

    expect(screen.getByRole('heading', { name: 'Complete Look' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Shop the Look' })).toBeInTheDocument();
    expect(screen.getByText('Look Ring')).toBeInTheDocument();
    expect(screen.getByText('Look Earrings')).toBeInTheDocument();
    expect(mockUseProductBundles).toHaveBeenCalledWith('gold-bracelet');
  });

  it('renders nothing when the bundles request fails', () => {
    mockUseProductBundles.mockReturnValue({
      bundles: undefined,
      isLoading: false,
      error: new AppError('NETWORK', 'Failed'),
    });

    const { container } = render(<ProductBundlesLoader productHandle="gold-bracelet" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when every rail is empty', () => {
    mockUseProductBundles.mockReturnValue({
      bundles: [],
      isLoading: false,
      error: null,
    });

    const { container } = render(<ProductBundlesLoader productHandle="gold-bracelet" />);
    expect(container).toBeEmptyDOMElement();
  });
});
