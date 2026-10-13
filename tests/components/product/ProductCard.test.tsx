import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { ProductCard } from '@/components/product/ProductCard';
import { wishlistMessages } from '@/config/wishlist';
import type { Product } from '@/types/product';

const mockShowWarning = jest.fn();

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: jest.fn(),
    clearNavigation: jest.fn(),
  }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showWarning: mockShowWarning }),
}));

jest.mock('@/components/product/AddToCartButton', () => ({
  AddToCartButton: () => <button type="button">ATC</button>,
}));

jest.mock('@/components/product/ProductCardMedia', () => ({
  ProductCardMedia: () => <div data-testid="media" />,
}));

jest.mock('@/components/product/PriceBlock', () => ({
  PriceBlock: ({
    price,
    compareAtPrice,
    isNewArrival,
    disabled,
    statusLabel,
    showPlatinumPlated,
  }: {
    price?: number;
    compareAtPrice?: number;
    isNewArrival?: boolean;
    disabled?: boolean;
    statusLabel?: string;
    showPlatinumPlated?: boolean;
  }) => (
    <div
      data-testid="price"
      data-price={price}
      data-compare={compareAtPrice ?? ''}
      data-disabled={disabled ? 'true' : undefined}
    >
      {statusLabel ? (
        <span data-testid="product-out-of-stock">{statusLabel}</span>
      ) : showPlatinumPlated ? (
        'Platinum Plated'
      ) : isNewArrival ? (
        'New Arrivals'
      ) : (
        'price'
      )}
    </div>
  ),
}));

const product: Product = {
  id: 'prod-1',
  handle: 'demo-ring',
  name: 'Demo Ring',
  description: '',
  price: 1000,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-1',
      title: 'Default',
      price: 1000,
      availableForSale: true,
      selectedOptions: [],
    },
  ],
};

describe('ProductCard', () => {
  beforeEach(() => {
    mockShowWarning.mockClear();
  });

  it('renders a link to the product PDP', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('link', { name: 'View Demo Ring' })).toHaveAttribute(
      'href',
      '/products/demo-ring',
    );
    expect(screen.getByTestId('product-card')).toHaveAttribute('data-product-handle', 'demo-ring');
  });

  it('renders price and add-to-cart for in-stock products', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByTestId('price')).toHaveTextContent('price');
    expect(screen.getByRole('button', { name: 'ATC' })).toBeInTheDocument();
    expect(screen.getByTestId('price').parentElement).toHaveClass('grid');
  });

  it('shows the product name', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByText('Demo Ring')).toHaveClass('text-xs');
  });

  it('shows Platinum Plated on platinum listing cards', () => {
    render(
      <ProductCard
        product={{
          ...product,
          productCategory: 'platinum',
        }}
      />,
    );

    expect(screen.getByText('Platinum Plated')).toBeInTheDocument();
    expect(screen.queryByText('New Arrivals')).not.toBeInTheDocument();
  });

  it('keeps out of stock ahead of the platinum plated pill', () => {
    render(
      <ProductCard
        product={{
          ...product,
          productCategory: 'platinum',
          availableForSale: false,
          variants: [{ ...product.variants[0]!, availableForSale: false }],
        }}
      />,
    );

    expect(screen.getByTestId('product-out-of-stock')).toHaveTextContent(
      wishlistMessages.labels.outOfStock,
    );
    expect(screen.queryByText('Platinum Plated')).not.toBeInTheDocument();
  });

  it('shows New Arrivals when the parent collection is new-arrivals', () => {
    render(<ProductCard product={product} collectionHandle="new-arrivals" />);

    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
  });

  it('shows New Arrivals when the product is tagged as new arrivals', () => {
    render(
      <ProductCard
        product={{
          ...product,
          filterAttributes: { tags: ['new-arrival'] },
        }}
      />,
    );

    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
  });

  it('stretches to the row height and anchors its title at the bottom', () => {
    const { container } = render(<ProductCard product={product} />);

    expect(container.querySelector('article')).toHaveClass('h-full');
    expect(screen.getByText('Demo Ring')).toHaveClass('mt-auto');
    expect(screen.getByTestId('media').nextElementSibling).toHaveClass('flex-1');
  });

  it('shows out of stock status and disabled add when unavailable', () => {
    render(
      <ProductCard
        product={{
          ...product,
          availableForSale: false,
          variants: [{ ...product.variants[0]!, availableForSale: false }],
        }}
      />,
    );

    expect(screen.getByTestId('product-out-of-stock')).toHaveTextContent(
      wishlistMessages.labels.outOfStock,
    );
    expect(screen.getByTestId('price')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByTestId('product-card')).toHaveAttribute('data-out-of-stock', 'true');
    expect(screen.getByText('Demo Ring')).toHaveClass('opacity-50');
    expect(screen.queryByRole('button', { name: 'ATC' })).not.toBeInTheDocument();
  });

  it('toasts when the disabled add control is pressed on an out of stock card', async () => {
    const user = userEvent.setup();
    render(
      <ProductCard
        product={{
          ...product,
          availableForSale: false,
          variants: [{ ...product.variants[0]!, availableForSale: false }],
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock }));

    expect(mockShowWarning).toHaveBeenCalledWith(wishlistMessages.toasts.outOfStock);
  });

  it('renders listing API selling and compare-at prices on gold cards', () => {
    render(
      <ProductCard
        product={{
          ...product,
          productCategory: 'gold',
          price: 10_000,
          compareAtPrice: 11_765,
        }}
      />,
    );

    expect(screen.getByTestId('price')).toHaveAttribute('data-price', '10000');
    expect(screen.getByTestId('price')).toHaveAttribute('data-compare', '11765');
  });

  it('does not invent a strikethrough when gold listing SP equals MRP', () => {
    render(
      <ProductCard
        product={{
          ...product,
          productCategory: 'gold',
          price: 29_844,
          compareAtPrice: 29_844,
        }}
      />,
    );

    expect(screen.getByTestId('price')).toHaveAttribute('data-price', '29844');
    expect(screen.getByTestId('price')).toHaveAttribute('data-compare', '29844');
  });
});
