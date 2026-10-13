import { fireEvent, render, screen } from '@testing-library/react';

import { DiwaliShop } from '@/components/diwali/DiwaliShop';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => <article>{product.name}</article>,
}));

function product(id: string, name: string): Product {
  return {
    id,
    handle: id,
    name,
    description: '',
    price: 999,
    image: 'https://cdn.example.com/ring.jpg',
    images: ['https://cdn.example.com/ring.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [
      {
        id: `${id}-variant`,
        title: 'Default',
        price: 999,
        availableForSale: true,
        selectedOptions: [],
      },
    ],
  };
}

describe('DiwaliShop', () => {
  const productsByTabId = {
    'rupees-999': [product('ring', 'Sale Ring')],
    'buy-4': [product('bundle', 'Bundle Studs')],
    'flat-40': [],
    bestsellers: [product('best', 'Bestseller Hoops')],
  };

  it('shows the first offer tab and its products', () => {
    render(<DiwaliShop productsByTabId={productsByTabId} />);

    expect(screen.getByRole('tab', { name: '₹999', selected: true })).toBeInTheDocument();
    expect(screen.getByText('Sale Ring')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all ₹999' })).toHaveAttribute(
      'href',
      '/collections/diwali-collection-1',
    );
  });

  it('switches the grid and view-all link when another offer is selected', () => {
    render(<DiwaliShop productsByTabId={productsByTabId} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Bestsellers' }));

    expect(screen.getByRole('tab', { name: 'Bestsellers', selected: true })).toBeInTheDocument();
    expect(screen.getByText('Bestseller Hoops')).toBeInTheDocument();
    expect(screen.queryByText('Sale Ring')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all bestsellers' })).toHaveAttribute(
      'href',
      '/collections/best-sellers',
    );
  });

  it('keeps the tab when that offer has no products', () => {
    render(<DiwaliShop productsByTabId={productsByTabId} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Flat 40% off' }));

    expect(screen.getByRole('tab', { name: 'Flat 40% off', selected: true })).toBeInTheDocument();
    expect(screen.queryByText('Sale Ring')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all 40% off' })).toHaveAttribute(
      'href',
      '/collections/sale',
    );
  });

  it('renders no product names when every tab is empty', () => {
    render(
      <DiwaliShop
        productsByTabId={{
          'rupees-999': [],
          'buy-4': [],
          'flat-40': [],
          bestsellers: [],
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Diwali collection' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
