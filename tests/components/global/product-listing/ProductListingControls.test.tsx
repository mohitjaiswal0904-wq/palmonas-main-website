import { render, screen, waitFor } from '@testing-library/react';
import { Activity } from 'react';

import { ProductListingControls } from '@/components/global/product-listing/ProductListingControls';
import { scrollProductListingIntoView } from '@/lib/utils/product-listing-scroll';
import type { Product } from '@/types/product';
import type { ProductFilterGroup } from '@/types/product-listing';

jest.mock('@/lib/utils/product-listing-scroll', () => ({
  scrollProductListingIntoView: jest.fn(() => true),
}));

jest.mock('@/hooks/layout/useSiteHeaderStickyOffset', () => ({
  useSiteHeaderStickyOffset: () => 64,
}));

jest.mock('@/components/global/product-listing/ProductGrid', () => ({
  ProductGrid: ({ products }: { products: Product[] }) => (
    <div data-testid="product-grid">{products.length} products</div>
  ),
}));

jest.mock('@/components/global/product-listing/ProductGridSkeleton', () => ({
  ProductGridSkeleton: () => <div data-testid="product-grid-skeleton" />,
}));

jest.mock('@/components/global/product-listing/MobileFilterSortBar', () => ({
  MobileFilterSortBar: () => null,
}));

jest.mock('@/components/global/product-listing/ProductFilterSidebar', () => ({
  ProductFilterSidebar: () => null,
}));

jest.mock('@/components/global/product-listing/ProductListingToolbar', () => ({
  ProductListingToolbar: () => null,
}));

const mockScrollProductListingIntoView = scrollProductListingIntoView as jest.MockedFunction<
  typeof scrollProductListingIntoView
>;

const filterGroups: ProductFilterGroup[] = [
  {
    id: 'price',
    label: 'Price',
    options: [{ id: 'under-5k', label: 'Under 5k' }],
  },
];

const emptyFilters = { price: [] as string[] };
const priceFilter = { price: ['under-5k'] };

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

describe('ProductListingControls scroll to listing top', () => {
  beforeEach(() => {
    mockScrollProductListingIntoView.mockClear();

    let frame = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frame += 1;
      callback(frame);
      return frame;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not scroll on initial mount', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    expect(mockScrollProductListingIntoView).not.toHaveBeenCalled();
  });

  it('scrolls to listing top when refetch starts and again when it ends', async () => {
    const { rerender } = render(
      <ProductListingControls
        products={[makeProduct('a'), makeProduct('b')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    rerender(
      <ProductListingControls
        products={[makeProduct('a'), makeProduct('b')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={true}
      />,
    );

    expect(mockScrollProductListingIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollProductListingIntoView).toHaveBeenCalledWith(expect.any(HTMLElement), 64);

    rerender(
      <ProductListingControls
        products={[]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    await waitFor(() => {
      expect(mockScrollProductListingIntoView).toHaveBeenCalledTimes(2);
    });
  });

  it('scrolls to listing top when URL filters change', async () => {
    const { rerender } = render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    mockScrollProductListingIntoView.mockClear();

    rerender(
      <ProductListingControls
        products={[]}
        filterGroups={filterGroups}
        filters={priceFilter}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    await waitFor(() => {
      expect(mockScrollProductListingIntoView.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not scroll when only products change', () => {
    const { rerender } = render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    rerender(
      <ProductListingControls
        products={[makeProduct('a'), makeProduct('b')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    expect(mockScrollProductListingIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when an <Activity> boundary is re-shown with the same query', async () => {
    // `cacheComponents` keeps visited collections mounted in a hidden <Activity>. Re-showing
    // replays effects with unchanged deps; scrolling there hid the collection banner.
    function Listing({ mode }: { mode: 'visible' | 'hidden' }) {
      return (
        <Activity mode={mode}>
          <ProductListingControls
            products={[makeProduct('a')]}
            filterGroups={filterGroups}
            filters={emptyFilters}
            sort="featured"
            onFiltersChange={jest.fn()}
            onSortChange={jest.fn()}
            isRefetchingProducts={false}
          />
        </Activity>
      );
    }

    const { rerender } = render(<Listing mode="visible" />);

    rerender(<Listing mode="hidden" />);
    rerender(<Listing mode="visible" />);

    await waitFor(() => {
      expect(mockScrollProductListingIntoView).not.toHaveBeenCalled();
    });
  });

  it('applies sticky header offset as scroll-margin on the listing anchor', () => {
    const { container } = render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts={false}
      />,
    );

    const anchor = container.querySelector('[style*="scroll-margin-top"]');
    expect(anchor).toHaveStyle({ scrollMarginTop: '64px' });
  });

  it('pins the desktop filters column under the site header', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={[
          {
            id: 'color',
            label: 'Color',
            options: [{ id: 'gold', label: 'Gold' }],
          },
        ]}
        filters={{ color: [] }}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
      />,
    );

    const filters = screen.getByTestId('product-listing-filters');
    expect(filters).toHaveClass('laptop:sticky', 'laptop:self-start', 'laptop:pt-4');
    expect(filters).toHaveStyle({ top: '64px' });
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
  });

  it('pins the desktop toolbar row under the site header while scrolling', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
      />,
    );

    const toolbar = screen.getByTestId('product-listing-toolbar');
    expect(toolbar).toHaveClass('laptop:sticky', 'bg-white');
    expect(toolbar).toHaveStyle({ top: '64px' });
  });

  it('keeps the sticky toolbar padded so cards do not show through under the header', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
      />,
    );

    const toolbar = screen.getByTestId('product-listing-toolbar');
    expect(toolbar).toHaveClass('laptop:pt-4', 'bg-white');
    expect(toolbar).toHaveStyle({ top: '64px' });
  });

  it('keeps the toolbar above the refetch skeleton overlay', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={filterGroups}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
        isRefetchingProducts
      />,
    );

    expect(screen.getByTestId('product-listing-toolbar')).toHaveClass('laptop:z-20');
    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
  });

  it('does not render a sticky filters column when there are no desktop filters', () => {
    render(
      <ProductListingControls
        products={[makeProduct('a')]}
        filterGroups={[]}
        filters={emptyFilters}
        sort="featured"
        onFiltersChange={jest.fn()}
        onSortChange={jest.fn()}
      />,
    );

    expect(screen.queryByTestId('product-listing-filters')).not.toBeInTheDocument();
  });
});
