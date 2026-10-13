import fs from 'node:fs';
import path from 'node:path';

import { buildItemTree } from '@/lib/utils/footer-layout';
import { transformFooterSlotPayload } from '@/lib/utils/transform-footer';
import { unwrapCmsSlotResponse } from '@/lib/utils/unwrap-cms-slot-response';

/** CMS layout-detail envelope (flat layout on data, no data.layout wrapper). */
const cmsLayoutDetailEnvelope = {
  status: 200,
  message: 'Layout retrieved successfully',
  data: {
    layout_id: 'f1000001-0001-4001-8001-000000000001',
    name: 'Palmonas Desktop Footer',
    slot: 'footer',
    stack_order: 0,
    config: {
      copyright: '© 2026 Palmonas',
      background_color: '#FFFFFF',
      heading_color: '#222222',
      link_color: '#868686',
      show_newsletter: true,
      columns: 4,
    },
    items: [
      {
        id: 'newsletter-1',
        item_type: 'newsletter',
        label: 'Subscribe to receive exciting offers!',
        sort_order: 0,
        visibility: { web: true, app: false },
        parent_id: null,
        children: [],
      },
      {
        id: 'col-1',
        item_type: 'footer_column',
        label: 'Policy',
        sort_order: 10,
        parent_id: null,
        visibility: { web: true, app: true },
        children: [
          {
            id: 'link-1',
            item_type: 'link',
            label: 'Shipping Policy',
            action_type: 'navigate',
            action_value: '/pages/shipping-delivery-policy',
            sort_order: 0,
            parent_id: 'col-1',
            visibility: { web: true, app: true },
            children: [],
          },
        ],
      },
    ],
    rows: null,
  },
  timestamp: '2026-07-06T18:40:35.385083+05:30',
};

describe('footer pipeline with live API fixture', () => {
  it('parses slot API envelope and preserves items', () => {
    const fixturePath = path.join('/tmp', 'footer-api.json');
    if (!fs.existsSync(fixturePath)) {
      return;
    }

    const raw = JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as unknown;
    const payload = unwrapCmsSlotResponse(raw);
    const vm = transformFooterSlotPayload(payload);
    const tree = buildItemTree(vm.items);

    expect(vm.items.length).toBeGreaterThan(0);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.some((item) => item.item_type === 'footer_column')).toBe(true);
  });

  it('handles CMS layout-detail flat data shape', () => {
    const payload = unwrapCmsSlotResponse(cmsLayoutDetailEnvelope);
    const vm = transformFooterSlotPayload(payload);
    const tree = buildItemTree(vm.items);

    expect(vm.config).toEqual(
      expect.objectContaining({
        copyright: '© 2026 Palmonas',
        text_color: '#222222',
        show_newsletter: true,
      }),
    );
    expect(vm.items.length).toBe(2);
    expect(tree.some((item) => item.item_type === 'newsletter')).toBe(true);
    expect(tree.some((item) => item.item_type === 'footer_column')).toBe(true);
  });
});
