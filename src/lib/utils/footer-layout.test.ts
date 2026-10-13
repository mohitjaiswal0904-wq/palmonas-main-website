import {
  buildItemTree,
  itemLabel,
  linkGroupChildOrder,
  resolveLinkGroupLabel,
} from '@/lib/utils/footer-layout';
import type { LayoutItem } from '@/types/layout';

describe('itemLabel', () => {
  it('prefers label, then title, then name', () => {
    expect(itemLabel({ id: '1', item_type: 'link', label: 'Shop' })).toBe('Shop');
    expect(itemLabel({ id: '1', item_type: 'link', title: 'About' })).toBe('About');
    expect(itemLabel({ id: '1', item_type: 'link', name: 'Contact' })).toBe('Contact');
    expect(itemLabel({ id: '1', item_type: 'link' })).toBe('');
  });
});

describe('resolveLinkGroupLabel', () => {
  it('returns trimmed CMS label only', () => {
    expect(
      resolveLinkGroupLabel({
        id: 'group-1',
        item_type: 'link_group',
        label: '  For Women  ',
      }),
    ).toBe('For Women');
  });

  it('ignores title and name fallbacks', () => {
    expect(
      resolveLinkGroupLabel({
        id: 'group-1',
        item_type: 'link_group',
        title: 'Title',
        name: 'Name',
      }),
    ).toBe('');
  });
});

describe('linkGroupChildOrder', () => {
  it('prefers stack_order then sort_order', () => {
    expect(linkGroupChildOrder({ id: '1', item_type: 'link', stack_order: 2 })).toBe(2);
    expect(linkGroupChildOrder({ id: '1', item_type: 'link', sort_order: 3 })).toBe(3);
    expect(linkGroupChildOrder({ id: '1', item_type: 'link' })).toBe(0);
  });
});

describe('buildItemTree', () => {
  it('nests items by parent_id and sorts by stack_order', () => {
    const items: LayoutItem[] = [
      {
        id: 'col-1',
        item_type: 'footer_column',
        label: 'Shop',
        parent_id: null,
        stack_order: 0,
      },
      {
        id: 'link-2',
        item_type: 'link',
        label: 'Second',
        parent_id: 'col-1',
        stack_order: 1,
      },
      {
        id: 'link-1',
        item_type: 'link',
        label: 'First',
        parent_id: 'col-1',
        stack_order: 0,
      },
    ];

    const tree = buildItemTree(items);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children?.map((child) => child.label)).toEqual(['First', 'Second']);
  });

  it('flattens pre-nested CMS items before building the tree', () => {
    const items: LayoutItem[] = [
      {
        id: 'f2dfd8ee-20a3-4373-a2a0-f0054fbb67fb',
        item_type: 'footer_column',
        label: 'test',
        parent_id: null,
        visibility: { web: true, app: false },
        children: [
          {
            id: 'f9888d82-8e29-4c14-a97e-b0d4ba03f054',
            item_type: 'link',
            label: 'about',
            parent_id: 'f2dfd8ee-20a3-4373-a2a0-f0054fbb67fb',
            action_value: '/about',
            visibility: { web: true, app: false },
            children: [],
          },
        ],
      },
    ];

    const tree = buildItemTree(items);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.label).toBe('test');
    expect(tree[0]?.children).toHaveLength(1);
    expect(tree[0]?.children?.[0]).toMatchObject({
      label: 'about',
      action_value: '/about',
    });
  });
});
