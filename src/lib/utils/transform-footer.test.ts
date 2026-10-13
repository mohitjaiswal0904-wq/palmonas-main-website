import { componentsConfig, cmsSlotIds, pageIds } from '@/config/components.config';
import { resolveCmsSlotApiPath, resolvePageApiPath } from '@/lib/utils/resolve-component-api';
import { buildFallbackFooterItems, transformFooterSlotPayload } from '@/lib/utils/transform-footer';
import type { CmsSlotPayload } from '@/types/cms-slot';

describe('resolveCmsSlotApiPath', () => {
  it('builds v2 slot default path for footer on web', () => {
    const path = resolveCmsSlotApiPath(componentsConfig.footer.api, cmsSlotIds.footer);
    expect(path).toBe('/api/v2/cms/slots/footer/default');
    expect(componentsConfig.footer.api.params.platform).toBe('web');
  });
});

describe('resolvePageApiPath', () => {
  it('builds v1 page path for home sections', () => {
    const path = resolvePageApiPath(componentsConfig.homeSections.api, pageIds.home);
    expect(path).toBe('/api/v1/cms/pages/slug/home-page-web/app');
  });
});

describe('transformFooterSlotPayload', () => {
  it('maps layout config and items to footer view model', () => {
    const payload: CmsSlotPayload = {
      slot: 'footer',
      layout: {
        items: [
          {
            id: 'col-1',
            item_type: 'footer_column',
            label: 'Shop',
            parent_id: null,
          },
          {
            id: 'link-1',
            item_type: 'link',
            label: 'Bestsellers',
            action_value: '/collections/bestsellers',
            parent_id: 'col-1',
          },
        ],
        config: {
          copyright: '© 2026 Palmonas. All rights reserved.',
          background_color: '#111111',
        },
      },
    };

    const result = transformFooterSlotPayload(payload);

    expect(result).toEqual({
      config: expect.objectContaining({
        copyright: '© 2026 Palmonas. All rights reserved.',
        background_color: '#111111',
      }),
      items: expect.arrayContaining([
        expect.objectContaining({ id: 'col-1' }),
        expect.objectContaining({ id: 'link-1' }),
      ]),
    });
  });

  it('maps heading_color to text_color and normalizes items', () => {
    const payload: CmsSlotPayload = {
      slot: 'footer',
      layout: {
        items: [
          {
            id: 'col-1',
            item_type: 'footer_column',
            label: 'Shop',
            parent_id: null,
            sort_order: 10,
          },
        ],
        config: {
          copyright: '© 2026 Palmonas. All rights reserved.',
          background_color: '#FFFFFF',
          heading_color: '#222222',
          link_color: '#868686',
        },
      },
    };

    const result = transformFooterSlotPayload(payload);

    expect(result.config.text_color).toBe('#222222');
    expect(result.items[0]?.stack_order).toBe(10);
  });

  it('keeps empty items when the CMS layout has no items', () => {
    const payload: CmsSlotPayload = {
      slot: 'footer',
      layout: {
        items: [],
        config: {
          copyright: '© 2026 Palmonas. All rights reserved.',
          background_color: '#111111',
          text_color: '#FFFFFF',
          link_color: '#AAAAAA',
        },
      },
    };

    expect(transformFooterSlotPayload(payload)).toEqual({
      config: expect.objectContaining({
        copyright: '© 2026 Palmonas. All rights reserved.',
        background_color: '#111111',
        text_color: '#FFFFFF',
        link_color: '#AAAAAA',
      }),
      items: [],
    });
  });

  it('corrects known CMS labels without changing their destinations', () => {
    const payload: CmsSlotPayload = {
      slot: 'footer',
      layout: {
        items: [
          {
            id: 'faq',
            item_type: 'link',
            label: "FAQ's",
            action_value: '/pages/faq',
          },
          {
            id: 'earrings',
            item_type: 'link',
            label: 'Daily Wear Earrings',
            action_value: 'statement-earrings',
          },
        ],
      },
    };

    const result = transformFooterSlotPayload(payload);

    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'FAQs',
          action_value: '/pages/faq',
        }),
        expect.objectContaining({
          label: 'Statement Earrings',
          action_value: 'statement-earrings',
        }),
      ]),
    );
  });

  it('corrects stale CMS labels nested under a footer column', () => {
    const payload: CmsSlotPayload = {
      slot: 'footer',
      layout: {
        items: [
          {
            id: 'policies',
            item_type: 'footer_column',
            children: [
              {
                id: 'buy-back',
                item_type: 'link',
                label: 'Lifetime BuyBack Policy',
              },
            ],
          },
        ],
      },
    };

    const result = transformFooterSlotPayload(payload);

    expect(result.items[0]?.children?.[0]?.label).toBe('Lifetime Buy-Back Policy');
  });
});

describe('buildFallbackFooterItems', () => {
  it('builds footer_column items from static fallback columns', () => {
    const items = buildFallbackFooterItems(componentsConfig.footer.fallback.columns);

    expect(items.some((item) => item.item_type === 'footer_column')).toBe(true);
    expect(items.some((item) => item.item_type === 'link')).toBe(true);
  });
});

describe('CMS slot URL', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_APP_ENV: 'development',
      NEXT_PUBLIC_API_DEV: 'http://localhost:8000',
      NEXT_PUBLIC_API_PROD: 'https://api.palmonas.tech',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses NEXT_PUBLIC_API_DEV as base for v2 slot requests', async () => {
    const { getApiBaseUrl } = await import('@/lib/env');
    const path = resolveCmsSlotApiPath(componentsConfig.footer.api, cmsSlotIds.footer);

    expect(`${getApiBaseUrl()}${path}?platform=web`).toBe(
      'http://localhost:8000/api/v2/cms/slots/footer/default?platform=web',
    );
  });
});
