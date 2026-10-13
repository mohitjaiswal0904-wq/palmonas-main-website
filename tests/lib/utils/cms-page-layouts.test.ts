import {
  resolveShellFooterData,
  resolveShellHeaderData,
  shellLayoutToSlotPayload,
  transformShellAnnouncementBars,
  transformShellFooterLayout,
  transformShellHeaderLayout,
} from '@/lib/utils/cms-page-layouts';
import type { CmsPageShellResponse } from '@/types/cms-page';
import { DEFAULT_FOOTER_CONFIG, DEFAULT_HEADER_CONFIG } from '@/types/layout';

const shellHeaderLayout = {
  layout_id: 'header-shell-1',
  name: 'Home Header',
  slot: 'header',
  config: {
    sticky: true,
    background_color: '#ffffff',
    show_search: true,
  },
  items: [
    {
      id: 'logo-1',
      item_type: 'logo',
      label: 'Palmonas',
      action_value: '/',
      parent_id: null,
      resolved_image_url: 'https://cdn.example.com/logo.png',
    },
    {
      id: 'link-1',
      item_type: 'link',
      label: 'Bestsellers',
      action_value: '/collections/best-sellers',
      parent_id: null,
    },
  ],
};

const shellFooterLayout = {
  layout_id: 'footer-shell-1',
  slot: 'footer',
  config: {
    copyright: '© 2026 Palmonas',
    background_color: '#111111',
  },
  items: [
    {
      id: 'col-1',
      item_type: 'footer_column',
      label: 'Shop',
      parent_id: null,
      children: [
        {
          id: 'link-1',
          item_type: 'link',
          label: 'Rings',
          action_value: '/collections/rings',
          parent_id: 'col-1',
        },
      ],
    },
  ],
};

const shellAnnouncementBar = {
  layout_id: 'announcement-1',
  slot: 'announcement_bar',
  config: {
    background_color: '#111111',
    text_color: '#ffffff',
  },
  items: [
    {
      id: 'announcement-item-1',
      item_type: 'text',
      label: 'Free shipping on orders above ₹999',
      parent_id: null,
    },
  ],
};

describe('shellLayoutToSlotPayload', () => {
  it('wraps a flat shell layout into a slot payload', () => {
    expect(shellLayoutToSlotPayload(shellHeaderLayout, 'header')).toEqual({
      slot: 'header',
      layout: expect.objectContaining({
        layout_id: 'header-shell-1',
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'logo-1', item_type: 'logo' }),
        ]),
      }),
    });
  });

  it('returns null for invalid layout input', () => {
    expect(shellLayoutToSlotPayload(null, 'header')).toBeNull();
    expect(shellLayoutToSlotPayload({ items: 'invalid' }, 'header')).toBeNull();
  });
});

describe('transformShellHeaderLayout', () => {
  it('maps shell header layout to the header view model', () => {
    const result = transformShellHeaderLayout(shellHeaderLayout);

    expect(result).toEqual(
      expect.objectContaining({
        config: expect.objectContaining({
          sticky: true,
          show_search: true,
        }),
        items: expect.arrayContaining([
          expect.objectContaining({ id: 'logo-1' }),
          expect.objectContaining({ id: 'link-1' }),
        ]),
      }),
    );
  });

  it('accepts null image_sources and icon_sources from the shell API', () => {
    const result = transformShellHeaderLayout({
      ...shellHeaderLayout,
      items: [
        {
          id: 'logo-1',
          item_type: 'logo',
          label: 'Palmonas',
          parent_id: null,
          image_sources: null,
          icon_sources: null,
          children: null,
        },
      ],
      rows: null,
    });

    expect(result).not.toBeNull();
    expect(result?.items).toEqual([expect.objectContaining({ id: 'logo-1' })]);
  });
});

describe('transformShellFooterLayout', () => {
  it('maps shell footer layout to the footer view model', () => {
    const result = transformShellFooterLayout(shellFooterLayout);

    expect(result).toEqual(
      expect.objectContaining({
        config: expect.objectContaining({
          copyright: '© 2026 Palmonas',
        }),
        items: expect.arrayContaining([expect.objectContaining({ id: 'col-1' })]),
      }),
    );
  });
});

describe('transformShellAnnouncementBars', () => {
  it('maps shell announcement bar layouts', () => {
    const bars = transformShellAnnouncementBars([shellAnnouncementBar]);

    expect(bars).toEqual([
      expect.objectContaining({
        id: 'announcement-1',
        items: [expect.objectContaining({ label: 'Free shipping on orders above ₹999' })],
      }),
    ]);
  });

  it('skips announcement bars without items', () => {
    expect(transformShellAnnouncementBars([{ slot: 'announcement_bar', items: [] }])).toEqual([]);
  });
});

describe('resolveShellHeaderData', () => {
  const fallback = {
    config: DEFAULT_HEADER_CONFIG,
    items: [],
  };

  const shell = {
    page: { id: 'p1', slug: 'home-page', name: 'Home', is_active: true },
    version: { id: 'v1', version_number: 1, environment: 'production' as const },
    layouts: {
      announcement_bars: [],
      header: shellHeaderLayout,
      footer: null,
      bottom_nav: null,
    },
    chunks: {
      chunk_ids: [],
      total_chunks: 0,
      total_sections: 0,
      manifest: [],
    },
  } satisfies CmsPageShellResponse;

  it('prefers shell header layout over fallback', () => {
    const result = resolveShellHeaderData(shell, fallback);

    expect(result.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'logo-1' })]),
    );
  });

  it('falls back when shell header is null', () => {
    expect(
      resolveShellHeaderData(
        {
          ...shell,
          layouts: { ...shell.layouts, header: null },
        },
        fallback,
      ),
    ).toBe(fallback);
  });
});

describe('resolveShellFooterData', () => {
  const fallback = {
    config: DEFAULT_FOOTER_CONFIG,
    items: [],
  };

  const shell = {
    page: { id: 'p1', slug: 'home-page', name: 'Home', is_active: true },
    version: { id: 'v1', version_number: 1, environment: 'production' as const },
    layouts: {
      announcement_bars: [shellAnnouncementBar],
      header: null,
      footer: shellFooterLayout,
      bottom_nav: null,
    },
    chunks: {
      chunk_ids: [],
      total_chunks: 0,
      total_sections: 0,
      manifest: [],
    },
  } satisfies CmsPageShellResponse;

  it('prefers shell footer layout over fallback', () => {
    const result = resolveShellFooterData(shell, fallback);

    expect(result.config).toEqual(
      expect.objectContaining({
        copyright: '© 2026 Palmonas',
      }),
    );
  });

  it('keeps heading_color when shell footer margin sides are null', () => {
    const result = resolveShellFooterData(
      {
        ...shell,
        layouts: {
          ...shell.layouts,
          footer: {
            ...shellFooterLayout,
            config: {
              background_color: '#FFFFFF',
              text_color: '#FFFFFF',
              heading_color: '#222222',
              newsletter_heading: 'Subscribe to receive exciting offers!',
              margin: { top: 0, left: null, right: null, bottom: 0 },
            },
          },
        },
      },
      fallback,
    );

    expect(result.config).toEqual(
      expect.objectContaining({
        heading_color: '#222222',
        newsletter_heading: 'Subscribe to receive exciting offers!',
      }),
    );
  });
});
