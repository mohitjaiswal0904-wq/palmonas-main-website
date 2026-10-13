import {
  isFilterApplyCommit,
  withFilterApplyCommit,
} from '@/lib/utils/filter-apply-commit';

describe('filter-apply-commit', () => {
  it('reports false outside an Apply commit', () => {
    expect(isFilterApplyCommit()).toBe(false);
  });

  it('reports true inside withFilterApplyCommit', () => {
    withFilterApplyCommit(() => {
      expect(isFilterApplyCommit()).toBe(true);
    });
    expect(isFilterApplyCommit()).toBe(false);
  });

  it('restores false after nested commits finish', () => {
    withFilterApplyCommit(() => {
      withFilterApplyCommit(() => {
        expect(isFilterApplyCommit()).toBe(true);
      });
      expect(isFilterApplyCommit()).toBe(true);
    });
    expect(isFilterApplyCommit()).toBe(false);
  });

  it('restores false when the commit callback throws', () => {
    expect(() =>
      withFilterApplyCommit(() => {
        throw new Error('apply failed');
      }),
    ).toThrow('apply failed');
    expect(isFilterApplyCommit()).toBe(false);
  });
});
