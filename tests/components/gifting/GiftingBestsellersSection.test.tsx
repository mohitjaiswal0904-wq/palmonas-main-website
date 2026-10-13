import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GiftingBestsellersSection } from '@/components/gifting/GiftingBestsellersSection';
import { GIFTING_BESTSELLERS } from '@/config/gifting/gifting.config';
import { getCollectionProducts } from '@/services/collection.service';
import type { Product, ProductListResponse } from '@/types/product';

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ product }: { product: Product }) => (
    <a href={`/products/${product.handle}`}>View {product.name}</a>
  ),
}));

jest.mock('@/services/collection.service', () => ({
  getCollectionProducts: jest.fn(),
}));

const mockGetCollectionProducts = getCollectionProducts as jest.MockedFunction<
  typeof getCollectionProducts
>;

function makeProduct(id: string): Product {
  return {
    id,
    handle: id,
    name: `Product ${id}`,
    description: '',
    price: 1000,
    image: `https://cdn.example.com/${id}.jpg`,
    images: [`https://cdn.example.com/${id}.jpg`],
    category: 'rings',
    productCategory: 'demifine',
    variants: [],
    offers: [],
  };
}

function makePage(page: number, ids: string[], hasNext = true): ProductListResponse {
  return {
    items: ids.map(makeProduct),
    total: 20,
    page,
    totalPages: 5,
    hasNext,
  };
}

describe('GiftingBestsellersSection', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('renders SSR-seeded products with the shared product card UI', () => {
    render(<GiftingBestsellersSection initialPage={makePage(1, ['a', 'b'], false)} />);

    expect(screen.getByRole('heading', { name: 'Demifine Bestsellers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Product a' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all Demifine bestsellers' })).toHaveAttribute(
      'href',
      `/collections/${GIFTING_BESTSELLERS.collectionHandle}`,
    );
  });

  it('loads the next page when the rail is scrolled near the end', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(2, ['c'], false));

    render(<GiftingBestsellersSection initialPage={makePage(1, ['a', 'b'])} />);

    const rail = screen.getByRole('region', { name: 'Demifine bestsellers' });
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 920 });

    fireEvent.scroll(rail);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'View Product c' })).toBeInTheDocument();
    });
    expect(mockGetCollectionProducts).toHaveBeenCalledWith(
      GIFTING_BESTSELLERS.collectionHandle,
      expect.objectContaining({ page: 2 }),
    );
  });

  it('does not fetch more when hasNext is false', () => {
    render(<GiftingBestsellersSection initialPage={makePage(1, ['a'], false)} />);

    const rail = screen.getByRole('region', { name: 'Demifine bestsellers' });
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 920 });

    fireEvent.scroll(rail);

    expect(mockGetCollectionProducts).not.toHaveBeenCalled();
  });

  it('shows loading copy when SSR seed is missing until the client fetch settles', async () => {
    let resolvePage: ((page: ProductListResponse) => void) | undefined;
    mockGetCollectionProducts.mockImplementationOnce(
      () =>
        new Promise<ProductListResponse>((resolve) => {
          resolvePage = resolve;
        }),
    );

    render(<GiftingBestsellersSection initialPage={null} />);

    expect(screen.getByText('Loading products…')).toBeInTheDocument();

    resolvePage?.(makePage(1, ['seeded'], false));

    expect(await screen.findByRole('link', { name: 'View Product seeded' })).toBeInTheDocument();
  });
});
