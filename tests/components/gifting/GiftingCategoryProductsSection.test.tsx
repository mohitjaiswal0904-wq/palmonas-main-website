import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { GiftingCategoryProductsSection } from '@/components/gifting/GiftingCategoryProductsSection';
import {
  GIFTING_CATEGORY_COLLECTION_HANDLE,
  GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
} from '@/config/gifting/gifting.config';
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

describe('GiftingCategoryProductsSection', () => {
  beforeEach(() => {
    mockGetCollectionProducts.mockReset();
  });

  it('renders SSR-seeded All products and view-all for best-sellers', () => {
    render(
      <GiftingCategoryProductsSection
        initialHandle={GIFTING_CATEGORY_COLLECTION_HANDLE}
        initialPage={makePage(1, ['a', 'b'], false)}
        pageSize={GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE}
      />,
    );

    expect(screen.getByRole('link', { name: 'View Product a' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'All gift products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all All gift products' })).toHaveAttribute(
      'href',
      '/collections/best-sellers',
    );
  });

  it('fetches a different collection when a category tab is selected', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(1, ['ring-1'], false));

    render(
      <GiftingCategoryProductsSection
        initialHandle={GIFTING_CATEGORY_COLLECTION_HANDLE}
        initialPage={makePage(1, ['a'], false)}
      />,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Rings' }));

    await waitFor(() => {
      expect(mockGetCollectionProducts).toHaveBeenCalledWith(
        'rings',
        expect.objectContaining({ page: 1 }),
      );
    });
    expect(await screen.findByRole('link', { name: 'View Product ring-1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all Rings gift products' })).toHaveAttribute(
      'href',
      '/collections/rings',
    );
  });

  it('loads the next page when the rail is scrolled near the end', async () => {
    mockGetCollectionProducts.mockResolvedValueOnce(makePage(2, ['c', 'd'], false));

    render(
      <GiftingCategoryProductsSection
        initialHandle={GIFTING_CATEGORY_COLLECTION_HANDLE}
        initialPage={makePage(1, ['a', 'b'])}
      />,
    );

    const rail = screen.getByRole('region', { name: 'All gift products' });
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 920 });

    fireEvent.scroll(rail);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'View Product c' })).toBeInTheDocument();
    });
    expect(mockGetCollectionProducts).toHaveBeenCalledWith(
      GIFTING_CATEGORY_COLLECTION_HANDLE,
      expect.objectContaining({ page: 2 }),
    );
  });

  it('does not fetch more when the active collection has no next page', () => {
    render(
      <GiftingCategoryProductsSection
        initialHandle={GIFTING_CATEGORY_COLLECTION_HANDLE}
        initialPage={makePage(1, ['a'], false)}
      />,
    );

    const rail = screen.getByRole('region', { name: 'All gift products' });
    Object.defineProperty(rail, 'scrollWidth', { configurable: true, value: 1000 });
    Object.defineProperty(rail, 'clientWidth', { configurable: true, value: 400 });
    Object.defineProperty(rail, 'scrollLeft', { configurable: true, value: 920 });

    fireEvent.scroll(rail);

    expect(mockGetCollectionProducts).not.toHaveBeenCalled();
  });
});
