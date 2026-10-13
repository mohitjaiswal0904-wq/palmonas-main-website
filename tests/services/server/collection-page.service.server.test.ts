import { getCollectionPageServerData } from '@/services/server/collection-page.service.server';
import {
  getCollectionByHandle,
  getCollectionProducts,
} from '@/services/server/collection.service.server';
import type { Collection } from '@/types/collection';
import type { ProductListResponse } from '@/types/product';
import type { ProductFilterGroup } from '@/types/product-listing';

jest.mock('@/services/server/collection.service.server', () => ({
  getCollectionByHandle: jest.fn(),
  getCollectionProducts: jest.fn(),
}));

const mockGetCollection = getCollectionByHandle as jest.MockedFunction<typeof getCollectionByHandle>;
const mockGetProducts = getCollectionProducts as jest.MockedFunction<typeof getCollectionProducts>;

const collection: Collection = {
  id: '1',
  handle: 'best-sellers',
  title: 'Best Sellers',
};

const colourGroup: ProductFilterGroup = {
  id: 'colour',
  label: 'Colour',
  options: [{ id: 'gold', value: 'gold', label: 'Gold' }],
};

function buildPage(overrides: Partial<ProductListResponse> = {}): ProductListResponse {
  return {
    items: [],
    filterGroups: [],
    offers: [],
    collectionMeta: undefined,
    total: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    nextCursor: undefined,
    ...overrides,
  };
}

describe('getCollectionPageServerData', () => {
  beforeEach(() => {
    mockGetCollection.mockReset();
    mockGetProducts.mockReset();
  });

  it('fetches collection and first products page with no filters applied', async () => {
    mockGetCollection.mockResolvedValue(collection);
    mockGetProducts.mockResolvedValue(buildPage({ filterGroups: [colourGroup] }));

    const result = await getCollectionPageServerData('best-sellers', { sort: 'featured' });

    expect(result.collection).toEqual(collection);
    expect(result.loadedPageCount).toBe(1);
    expect(result.filterGroups).toEqual([colourGroup]);
    // No filters means no bootstrap call — one products request only.
    expect(mockGetProducts).toHaveBeenCalledTimes(1);
  });

  it('bootstraps filter groups before requesting a filtered products page', async () => {
    mockGetCollection.mockResolvedValue(collection);
    mockGetProducts
      .mockResolvedValueOnce(buildPage({ filterGroups: [colourGroup] }))
      .mockResolvedValueOnce(buildPage({ hasNext: true }));

    const result = await getCollectionPageServerData('best-sellers', {
      filters: { colour: ['gold'] },
    });

    expect(mockGetProducts).toHaveBeenCalledTimes(2);
    expect(mockGetProducts.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ limit: 1, sortBy: 'featured' }),
    );
    // Filtered page must receive the bootstrapped groups, or filter params can't be built.
    expect(mockGetProducts.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({ filterGroups: [colourGroup] }),
    );
    expect(result.hasMoreProducts).toBe(true);
  });

  it('starts the collection fetch without waiting on the filter bootstrap', async () => {
    let releaseBootstrap = (): void => {};
    const bootstrapPending = new Promise<void>((resolve) => {
      releaseBootstrap = () => resolve();
    });

    mockGetCollection.mockResolvedValue(collection);
    mockGetProducts
      .mockImplementationOnce(async () => {
        await bootstrapPending;
        return buildPage({ filterGroups: [colourGroup] });
      })
      .mockResolvedValueOnce(buildPage());

    const pending = getCollectionPageServerData('best-sellers', { filters: { colour: ['gold'] } });

    // Bootstrap is still in flight; the collection request must already be running,
    // otherwise it is a serial round trip stacked behind the bootstrap.
    await Promise.resolve();
    expect(mockGetCollection).toHaveBeenCalledTimes(1);

    releaseBootstrap();
    await expect(pending).resolves.toMatchObject({ collection });
  });

  it('propagates a failing products request', async () => {
    mockGetCollection.mockResolvedValue(collection);
    mockGetProducts.mockRejectedValue(new Error('upstream down'));

    await expect(getCollectionPageServerData('best-sellers')).rejects.toThrow('upstream down');
  });

  it('propagates a failing collection request when the bootstrap also rejects', async () => {
    mockGetCollection.mockRejectedValue(new Error('collection missing'));
    mockGetProducts.mockRejectedValue(new Error('upstream down'));

    await expect(
      getCollectionPageServerData('missing', { filters: { colour: ['gold'] } }),
    ).rejects.toThrow(/collection missing|upstream down/);
  });
});
