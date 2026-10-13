import { render, screen } from '@testing-library/react';

import { CollectionPageContent } from '@/components/collection/CollectionPageContent';
import { useCollection, type CollectionInitialData } from '@/hooks/useCollection';
import type { Collection } from '@/types/collection';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/hooks/useCollection', () => ({
  useCollection: jest.fn(),
}));

jest.mock('@/components/global/product-listing', () => ({
  ProductListingControls: ({ productGridClassName }: { productGridClassName?: string }) => (
    <div data-testid="listing" data-grid-class={productGridClassName ?? ''} />
  ),
}));

const mockUseCollection = useCollection as jest.MockedFunction<typeof useCollection>;

function makeCollection(image?: string): Collection {
  return {
    id: 'col-1',
    handle: 'earrings',
    title: 'Earrings',
    image,
  };
}

function makeInitialData(collection: Collection): CollectionInitialData {
  return {
    collection,
    productsPages: [],
    productsPageSize: 20,
    loadedPageCount: 1,
    hasMoreProducts: false,
    filters: {},
    sort: 'featured',
    filterGroups: [],
  };
}

function stubCollection(collection: Collection, offers: string[] = []): void {
  mockUseCollection.mockReturnValue({
    collection,
    products: [],
    filterGroups: [],
    offers,
    hasMoreProducts: false,
    isLoadingMoreProducts: false,
    loadedPageCount: 1,
    loadMoreProducts: jest.fn(),
  });
}

describe('CollectionPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes mt-0 to the listing grid', () => {
    const collection = makeCollection();
    stubCollection(collection);

    render(
      <CollectionPageContent
        handle="earrings"
        initialFilters={{}}
        initialSort="featured"
        initialData={makeInitialData(collection)}
      />,
    );

    expect(screen.getByTestId('listing')).toHaveAttribute('data-grid-class', 'mt-0');
  });

  it('keeps the listing grid flush when a banner image is present', () => {
    const collection = makeCollection('https://cdn.example/banner.jpg');
    stubCollection(collection);

    render(
      <CollectionPageContent
        handle="earrings"
        initialFilters={{}}
        initialSort="featured"
        initialData={makeInitialData(collection)}
      />,
    );

    expect(screen.getByTestId('listing')).toHaveAttribute('data-grid-class', 'mt-0');
  });

  it('renders offer filter chips after the listing mounts', () => {
    const collection = makeCollection('https://cdn.example/banner.jpg');
    stubCollection(collection, ['Buy 1 Get 1']);

    render(
      <CollectionPageContent
        handle="earrings"
        initialFilters={{}}
        initialSort="featured"
        initialData={makeInitialData(collection)}
      />,
    );

    expect(screen.getByRole('button', { name: 'Buy 1 Get 1' })).toBeInTheDocument();
  });

  it('hides offer chips when the collection has no offers', () => {
    const collection = makeCollection('https://cdn.example/banner.jpg');
    stubCollection(collection);

    render(
      <CollectionPageContent
        handle="earrings"
        initialFilters={{}}
        initialSort="featured"
        initialData={makeInitialData(collection)}
      />,
    );

    expect(screen.queryByRole('toolbar', { name: 'Offer filters' })).not.toBeInTheDocument();
  });
});
