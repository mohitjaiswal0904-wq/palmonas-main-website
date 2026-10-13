import { headerItemLabel, normalizeLayoutItems, resolveLayoutItemHref } from '@/lib/utils/header';
import type { LayoutItem } from '@/types/layout';

describe('resolveLayoutItemHref', () => {
  it('maps collection actions to collection routes', () => {
    const item: LayoutItem = {
      id: '1',
      item_type: 'link',
      action_type: 'collection',
      action_value: 'new-arrivals',
    };

    expect(resolveLayoutItemHref(item)).toBe('/collections/new-arrivals');
  });

  it('keeps curated collection actions on collection routes', () => {
    expect(
      resolveLayoutItemHref({
        id: '2',
        item_type: 'link',
        action_type: 'collection',
        action_value: 'shraddhas-favourite',
      }),
    ).toBe('/collections/shraddhas-favourite');

    expect(
      resolveLayoutItemHref({
        id: '3',
        item_type: 'link',
        action_type: 'collection',
        action_value: 'emily-paris-collection',
      }),
    ).toBe('/collections/emily-paris-collection');
  });

  it('canonicalises legacy about CMS paths for header/footer links', () => {
    expect(
      resolveLayoutItemHref({
        id: '6',
        item_type: 'link',
        action_type: 'navigate',
        action_value: '/pages/about-us',
      }),
    ).toBe('/about');
  });

  it('returns null for open actions without a path', () => {
    const item: LayoutItem = {
      id: '1',
      item_type: 'link',
      action_type: 'open',
      action_value: 'pincode-modal',
    };

    expect(resolveLayoutItemHref(item)).toBeNull();
  });
});

describe('headerItemLabel', () => {
  it('falls back to icon_key labels when CMS label is null', () => {
    expect(
      headerItemLabel({
        id: '1',
        item_type: 'search',
        icon_key: 'search',
        label: null as unknown as undefined,
      }),
    ).toBe('Search');
  });
});

describe('normalizeLayoutItems', () => {
  it('maps sort_order to stack_order', () => {
    const [item] = normalizeLayoutItems([
      {
        id: '1',
        item_type: 'link',
        sort_order: 12,
        label: 'Offers',
      },
    ]);

    expect(item?.stack_order).toBe(12);
  });
});
