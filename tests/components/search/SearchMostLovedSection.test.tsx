import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { SearchMostLovedSection } from '@/components/search/SearchMostLovedSection';
import { AppError } from '@/lib/errors';
import type { Product } from '@/types/product';

const mockGetCollectionProducts = jest.fn();

jest.mock('@/services/collection.service', () => ({
  getCollectionProducts: (...args: unknown[]) => mockGetCollectionProducts(...args),
}));

jest.mock('@/components/global/product-listing/ProductCarousel', () => ({
  ProductCarousel: ({
    products,
    itemClassName,
    className,
  }: {
    products: Product[];
    itemClassName?: string;
    className?: string;
  }) => (
    <div
      data-testid="product-carousel"
      data-item-class={itemClassName}
      data-class={className}
    >
      {products.map((product) => product.name).join(', ')}
    </div>
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const product = {
  id: '1',
  name: 'Lunar Flow',
  handle: 'lunar-flow',
} as Product;

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('SearchMostLovedSection', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('renders products and a view-all link when the collection loads', async () => {
    mockGetCollectionProducts.mockResolvedValue({ items: [product], total: 1 });

    renderWithQuery(<SearchMostLovedSection />);

    expect(screen.getByLabelText('Loading most loved products')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Most Loved' })).toBeInTheDocument();
    });

    const carousel = screen.getByTestId('product-carousel');
    expect(carousel).toHaveTextContent('Lunar Flow');
    expect(carousel).toHaveAttribute('data-item-class', expect.stringContaining('laptop:w-[20vw]'));
    expect(carousel).toHaveAttribute('data-class', expect.stringContaining('laptop:w-full'));
    expect(screen.getByRole('link', { name: 'View all most loved products' })).toHaveAttribute(
      'href',
      expect.stringContaining('/collections/'),
    );
  });

  it('renders nothing when the collection is empty', async () => {
    mockGetCollectionProducts.mockResolvedValue({ items: [], total: 0 });

    const { container } = renderWithQuery(<SearchMostLovedSection />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('renders nothing when the collection request fails', async () => {
    mockGetCollectionProducts.mockRejectedValue(new AppError('NOT_FOUND', 'fail'));

    const { container } = renderWithQuery(<SearchMostLovedSection />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it('shows a loading skeleton before products arrive', () => {
    mockGetCollectionProducts.mockImplementation(() => new Promise(() => undefined));

    renderWithQuery(<SearchMostLovedSection />);

    expect(screen.getByLabelText('Loading most loved products')).toBeInTheDocument();
  });
});
