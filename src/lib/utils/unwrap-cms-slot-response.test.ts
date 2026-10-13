import {
  sanitizeLayoutSpacingConfig,
  unwrapCmsSlotResponse,
} from '@/lib/utils/unwrap-cms-slot-response';

describe('sanitizeLayoutSpacingConfig', () => {
  it('drops null margin and padding sides', () => {
    expect(
      sanitizeLayoutSpacingConfig({
        heading_color: '#222222',
        margin: { top: 0, left: null, right: null, bottom: 0 },
        padding: { top: 40, left: 15, right: 15, bottom: 24 },
      }),
    ).toEqual({
      heading_color: '#222222',
      margin: { top: 0, bottom: 0 },
      padding: { top: 40, left: 15, right: 15, bottom: 24 },
    });
  });

  it('returns non-objects unchanged', () => {
    expect(sanitizeLayoutSpacingConfig(null)).toBeNull();
    expect(sanitizeLayoutSpacingConfig('x')).toBe('x');
  });
});

describe('unwrapCmsSlotResponse', () => {
  it('unwraps v2 API envelope', () => {
    const raw = {
      status: 200,
      message: 'Footer slot retrieved successfully',
      data: {
        slot: 'footer',
        environment: 'production',
        layout: {
          layout_id: 'b72d7594-43d3-42fe-a12c-80c95ced3c8c',
          config: {
            copyright: '© 2026 Palmonas. All rights reserved.',
            background_color: '#111111',
          },
          items: [],
        },
        layouts: [],
      },
      timestamp: '2026-06-28T08:24:15.756699+05:30',
    };

    expect(unwrapCmsSlotResponse(raw)).toEqual(raw.data);
  });

  it('accepts bare payload', () => {
    const payload = {
      slot: 'footer',
      layout: { items: [] },
    };

    expect(unwrapCmsSlotResponse(payload)).toEqual(payload);
  });

  it('accepts layout.rows null from production API', () => {
    const raw = {
      status: 200,
      message: 'Footer slot retrieved successfully',
      data: {
        slot: 'footer',
        layout: {
          config: { copyright: '© 2026 Palmonas' },
          items: [{ id: 'n1', item_type: 'newsletter', label: 'Subscribe' }],
          rows: null,
        },
      },
    };

    const payload = unwrapCmsSlotResponse(raw);

    expect(payload.layout?.rows).toBeUndefined();
    expect(payload.layout?.items).toHaveLength(1);
  });

  it('normalizes flat layout-detail shape on data', () => {
    const raw = {
      status: 200,
      message: 'Layout retrieved successfully',
      data: {
        layout_id: 'layout-1',
        slot: 'footer',
        config: { copyright: '© 2026 Palmonas' },
        items: [{ id: 'col-1', item_type: 'footer_column', label: 'Policy' }],
        rows: null,
      },
    };

    const payload = unwrapCmsSlotResponse(raw);

    expect(payload.slot).toBe('footer');
    expect(payload.layout?.config).toEqual({ copyright: '© 2026 Palmonas' });
    expect(payload.layout?.items).toHaveLength(1);
  });

  it('keeps footer heading_color when CMS margin sides are null', () => {
    const raw = {
      status: 200,
      message: 'Footer slot retrieved successfully',
      data: {
        slot: 'footer',
        layout: {
          config: {
            background_color: '#FFFFFF',
            text_color: '#FFFFFF',
            heading_color: '#222222',
            newsletter_heading: 'Subscribe to receive exciting offers!',
            margin: { top: 0, left: null, right: null, bottom: 0 },
            padding: { top: 40, left: 15, right: 15, bottom: 24 },
          },
          items: [
            {
              id: 'newsletter-1',
              item_type: 'newsletter',
              label: 'Subscribe to receive exciting offers!',
            },
          ],
        },
      },
    };

    const payload = unwrapCmsSlotResponse(raw);

    expect(payload.layout?.config).toEqual(
      expect.objectContaining({
        heading_color: '#222222',
        newsletter_heading: 'Subscribe to receive exciting offers!',
        text_color: '#FFFFFF',
      }),
    );
  });
});
