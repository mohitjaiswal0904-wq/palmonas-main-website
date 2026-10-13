import { toCollectionSortParam, toSearchSortParam } from '@/lib/utils/product-filters';

describe('toCollectionSortParam', () => {
  it.each([
    ['price-asc', 'price-ascending'],
    ['price-desc', 'price-descending'],
    ['name-asc', 'title-ascending'],
    ['name-desc', 'title-descending'],
    ['new-arrivals', 'created-descending'],
    ['best-selling', 'best-selling'],
    ['price-low-high', 'price-ascending'],
    ['price_asc', 'price-ascending'],
    ['price-high-low', 'price-descending'],
    ['price_desc', 'price-descending'],
    ['a-z', 'title-ascending'],
    ['name_asc', 'title-ascending'],
    ['z-a', 'title-descending'],
    ['name_desc', 'title-descending'],
    ['newest', 'created-descending'],
    ['just_launched', 'created-descending'],
    ['best-sellers', 'best-selling'],
    ['best_selling', 'best-selling'],
    ['trending', 'best-selling'],
    ['rating', 'best-selling'],
  ] as const)('maps %s to the backend sort value', (sort, expected) => {
    expect(toCollectionSortParam(sort)).toBe(expected);
  });

  it('omits the featured sort so the backend uses its default order', () => {
    expect(toCollectionSortParam('featured')).toBeUndefined();
  });
});

describe('toSearchSortParam', () => {
  it.each([
    ['price-asc', 'price-asc'],
    ['price-desc', 'price-desc'],
    ['name-asc', 'name-asc'],
    ['name-desc', 'name-desc'],
    ['best-selling', 'best-selling'],
    ['new-arrivals', 'newest'],
    ['price_asc', 'price-asc'],
    ['price_desc', 'price-desc'],
    ['name_asc', 'name-asc'],
    ['name_desc', 'name-desc'],
    ['newest', 'newest'],
    ['rating', 'rating-desc'],
  ] as const)('maps %s to the search API sort value', (sort, expected) => {
    expect(toSearchSortParam(sort)).toBe(expected);
  });

  it('omits featured so the search API uses relevance', () => {
    expect(toSearchSortParam('featured')).toBeUndefined();
  });
});
