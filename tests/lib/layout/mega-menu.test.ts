import { groupMegaMenuColumns, resolveMegaMenuVariant } from '@/lib/layout/mega-menu';
import type { LayoutItem } from '@/types/layout';

function menuColumn(id: string, label: string): LayoutItem {
  return {
    id,
    item_type: 'mini_menu',
    title: label,
    children: [],
  };
}

describe('resolveMegaMenuVariant', () => {
  it('uses compact chrome for fewer than five columns', () => {
    expect(resolveMegaMenuVariant(3)).toBe('compact');
    expect(resolveMegaMenuVariant(4)).toBe('compact');
  });

  it('uses wide chrome for five or more columns', () => {
    expect(resolveMegaMenuVariant(5)).toBe('wide');
    expect(resolveMegaMenuVariant(6)).toBe('wide');
  });
});

describe('groupMegaMenuColumns', () => {
  it('keeps four sections side by side without stacking', () => {
    const columns = [
      menuColumn('1', 'Category'),
      menuColumn('2', 'Collection'),
      menuColumn('3', 'Gender'),
      menuColumn('4', 'Occasion'),
    ];

    expect(groupMegaMenuColumns(columns)).toEqual([
      [columns[0]],
      [columns[1]],
      [columns[2]],
      [columns[3]],
    ]);
  });

  it('keeps each section in its own column for five sections', () => {
    const columns = [
      menuColumn('1', 'Gender'),
      menuColumn('2', 'Category'),
      menuColumn('3', 'Collection'),
      menuColumn('4', 'Occasion'),
      menuColumn('5', 'Offers'),
    ];

    expect(groupMegaMenuColumns(columns)).toEqual([
      [columns[0]],
      [columns[1]],
      [columns[2]],
      [columns[3]],
      [columns[4]],
    ]);
  });

  it('returns an empty grid for no columns', () => {
    expect(groupMegaMenuColumns([])).toEqual([]);
  });

  it('keeps three columns side by side', () => {
    const columns = [menuColumn('1', 'A'), menuColumn('2', 'B'), menuColumn('3', 'C')];

    expect(groupMegaMenuColumns(columns)).toEqual([[columns[0]], [columns[1]], [columns[2]]]);
  });
});
