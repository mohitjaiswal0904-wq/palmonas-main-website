import { componentsConfig } from '@/config/components.config';
import { buildFallbackHeaderItems, transformHeaderSlotPayload } from '@/lib/utils/header';
import type { CmsSlotPayload } from '@/types/cms-slot';

describe('transformHeaderSlotPayload', () => {
  it('maps layout config and items to header view model', () => {
    const payload: CmsSlotPayload = {
      slot: 'header',
      layout: {
        items: [
          {
            id: 'logo-1',
            item_type: 'logo',
            label: 'Palmonas',
            action_value: '/',
            parent_id: null,
          },
          {
            id: 'link-1',
            item_type: 'link',
            label: 'Bestsellers',
            action_value: '/collections/bestsellers',
            parent_id: null,
          },
        ],
        config: {
          sticky: true,
          show_search: true,
          background_color: '#ffffff',
        },
      },
    };

    expect(transformHeaderSlotPayload(payload)).toEqual({
      config: expect.objectContaining({
        sticky: true,
        show_search: true,
        background_color: '#ffffff',
      }),
      items: payload.layout?.items,
    });
  });
});

describe('buildFallbackHeaderItems', () => {
  it('builds logo, nav links, and utility actions from static fallback config', () => {
    const items = buildFallbackHeaderItems(componentsConfig.header.fallback);

    expect(items.some((item) => item.item_type === 'logo')).toBe(true);
    expect(items.some((item) => item.item_type === 'link')).toBe(true);
    expect(items.some((item) => item.item_type === 'cart')).toBe(true);
  });

  it('uses collection action types for collection fallback links', () => {
    const items = buildFallbackHeaderItems(componentsConfig.header.fallback);
    const bestsellers = items.find((item) => item.label === 'Bestsellers');

    expect(bestsellers).toMatchObject({
      action_type: 'collection',
      action_value: 'best-sellers',
    });
  });
});
