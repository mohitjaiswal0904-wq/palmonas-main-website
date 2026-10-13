import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

describe('resolveCollectionPagePath', () => {
  it('sends the Diwali menu handle to the sale landing page', () => {
    expect(resolveCollectionPagePath('diwali')).toBe('/diwali');
  });

  it('keeps the Emily in Paris collection on its landing page', () => {
    expect(resolveCollectionPagePath('emily-paris-collection')).toBe('/emily-in-paris');
  });

  it('builds a collection path for an unknown handle', () => {
    expect(resolveCollectionPagePath('sale')).toBe('/collections/sale');
  });

  it('returns home when the handle is empty', () => {
    expect(resolveCollectionPagePath('  ')).toBe('/');
  });
});
