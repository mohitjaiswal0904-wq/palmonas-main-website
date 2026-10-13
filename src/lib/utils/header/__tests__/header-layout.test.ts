import {
  applyTabOverflow,
  buildHeaderRows,
  isTabItem,
  isUtilityItem,
  justifyClass,
  shouldUseMultiRowLayout,
} from '@/lib/utils/header';
import type { HeaderConfig, LayoutItem } from '@/types/layout';

function makeItem(
  overrides: Partial<LayoutItem> & Pick<LayoutItem, 'id' | 'item_type'>,
): LayoutItem {
  return {
    parent_id: null,
    ...overrides,
  };
}

describe('isUtilityItem', () => {
  it('treats analytics-key links as utilities', () => {
    const item = makeItem({
      id: 'pincode',
      item_type: 'link',
      extra_metadata: { analytics_key: 'header_pincode' },
    });

    expect(isUtilityItem(item)).toBe(true);
    expect(isTabItem(item)).toBe(false);
  });

  it('treats high sort_order links as tabs', () => {
    const item = makeItem({
      id: 'nav',
      item_type: 'link',
      label: 'New Arrivals',
      sort_order: 10,
    });

    expect(isUtilityItem(item)).toBe(false);
    expect(isTabItem(item)).toBe(true);
  });
});

describe('shouldUseMultiRowLayout', () => {
  it('returns true when utilities and tabs coexist', () => {
    const items: LayoutItem[] = [
      makeItem({ id: 'logo', item_type: 'logo', sort_order: 0 }),
      makeItem({ id: 'nav', item_type: 'link', label: 'Shop', sort_order: 10 }),
    ];

    expect(shouldUseMultiRowLayout(items)).toBe(true);
  });
});

describe('buildHeaderRows', () => {
  it('splits utilities and tabs into two rows', () => {
    const items: LayoutItem[] = [
      makeItem({ id: 'logo', item_type: 'logo', sort_order: 0 }),
      makeItem({ id: 'search', item_type: 'search', sort_order: 1 }),
      makeItem({ id: 'nav', item_type: 'link', label: 'Shop', sort_order: 10 }),
    ];

    const rows = buildHeaderRows(items);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.items.map((item) => item.id)).toEqual(['logo', 'search']);
    expect(rows[1]?.items.map((item) => item.id)).toEqual(['nav']);
  });
});

describe('justifyClass', () => {
  it('defaults to justify-evenly', () => {
    expect(justifyClass()).toBe('justify-evenly');
    expect(justifyClass(null)).toBe('justify-evenly');
  });
});

describe('applyTabOverflow', () => {
  it('moves overflow tabs into more item bucket', () => {
    const items: LayoutItem[] = [
      makeItem({ id: 'a', item_type: 'link', label: 'A', sort_order: 10 }),
      makeItem({ id: 'b', item_type: 'link', label: 'B', sort_order: 11 }),
      makeItem({ id: 'more', item_type: 'more', label: 'More', sort_order: 12 }),
    ];

    const config: HeaderConfig = { max_visible_tabs: 1 };
    const { items: visible, overflowTabs } = applyTabOverflow(items, config.max_visible_tabs);

    expect(visible.map((item) => item.id)).toEqual(['a', 'more']);
    expect(overflowTabs.map((item) => item.id)).toEqual(['b']);
  });
});
