import { render, screen } from '@testing-library/react';

import { ProductGrid } from '@/components/global/product-listing/ProductGrid';
import { productListingMessages } from '@/config/product-listing/product-listing.config';
import type { Product } from '@/types/product';

jest.mock('@/hooks/useProductListingControls', () => ({
  useProductListingControls: () => ({
    clearFilters: jest.fn(),
  }),
}));

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <article data-testid={`product-${product.id}`}>{product.name}</article>
  ),
}));

function makeProduct(id: string): Product {
  return {
    id,
    handle: id,
    name: `Product ${id}`,
    description: '',
    price: 1000,
    image: '',
    images: [],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [],
  };
}

describe('ProductGrid', () => {
  it('keeps previously rendered products when more are appended', () => {
    const { rerender } = render(
      <ProductGrid products={[makeProduct('a'), makeProduct('b')]} />,
    );

    expect(screen.getByTestId('product-a')).toBeInTheDocument();
    expect(screen.getByTestId('product-b')).toBeInTheDocument();

    rerender(
      <ProductGrid products={[makeProduct('a'), makeProduct('b'), makeProduct('c')]} />,
    );

    expect(screen.getByTestId('product-a')).toBeInTheDocument();
    expect(screen.getByTestId('product-b')).toBeInTheDocument();
    expect(screen.getByTestId('product-c')).toBeInTheDocument();
  });

  it('renders the load-more trigger after the configured index', () => {
    render(
      <ProductGrid
        products={[makeProduct('a'), makeProduct('b'), makeProduct('c')]}
        loadMoreTriggerAfterIndex={1}
        renderLoadMoreTrigger={() => <div data-testid="load-more-trigger" />}
      />,
    );

    expect(screen.getByTestId('load-more-trigger')).toBeInTheDocument();
  });

  it('shows empty filters message with left padding when there are no products', () => {
    const { container } = render(<ProductGrid products={[]} />);

    expect(
      screen.getByRole('heading', { name: productListingMessages.emptyTitle }),
    ).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('px-4');
  });

  it('exposes a clear filters CTA on the empty state', () => {
    render(<ProductGrid products={[]} />);

    expect(
      screen.getByRole('button', { name: productListingMessages.a11y.clearFilters }),
    ).toBeInTheDocument();
  });

  it('renders trailing content after product cards', () => {
    render(
      <ProductGrid
        products={[makeProduct('a')]}
        trailingContent={<div data-testid="trailing">Loading…</div>}
      />,
    );

    expect(screen.getByTestId('trailing')).toBeInTheDocument();
  });

  it('stretches every product card to the same row height', () => {
    render(<ProductGrid products={[makeProduct('a'), makeProduct('b')]} />);

    expect(screen.getByRole('region', { name: 'Products' })).toHaveClass('items-stretch');
  });
});
