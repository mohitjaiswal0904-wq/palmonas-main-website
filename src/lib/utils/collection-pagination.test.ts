import {
  collectionPageHasMore,
  getCollectionLoadMoreTriggerIndex,
  getNextCollectionPageParam,
} from '@/lib/utils/collection-pagination';
import type { ProductListResponse } from '@/types/product';

function createPage(overrides: Partial<ProductListResponse> = {}): ProductListResponse {
  return {
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    ...overrides,
  };
}

describe('collectionPageHasMore', () => {
  it('returns false when hasNext is explicitly false', () => {
    expect(collectionPageHasMore(createPage({ hasNext: false }))).toBe(false);
  });

  it('returns true when next cursor is present', () => {
    expect(collectionPageHasMore(createPage({ nextCursor: 'cursor-2' }))).toBe(true);
  });
});

describe('getNextCollectionPageParam', () => {
  it('includes cursor for the next page request', () => {
    expect(getNextCollectionPageParam(createPage({ nextCursor: 'cursor-2' }), 2)).toEqual({
      page: 2,
      cursor: 'cursor-2',
    });
  });
});

describe('getCollectionLoadMoreTriggerIndex', () => {
  it('places trigger halfway through the first loaded page', () => {
    expect(getCollectionLoadMoreTriggerIndex(24, 1, 24)).toBe(11);
  });

  it('places trigger halfway through the latest loaded page', () => {
    expect(getCollectionLoadMoreTriggerIndex(48, 2, 24)).toBe(35);
  });
});
