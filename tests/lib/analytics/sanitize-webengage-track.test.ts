import {
  buildWebEngageTrackPayload,
  sanitizeWebEngageEventName,
  sanitizeWebEngageTrackProperties,
} from '@/lib/analytics/sanitize-webengage-track';

describe('sanitizeWebEngageTrackProperties', () => {
  it('drops reserved we_ attributes and truncates long strings', () => {
    expect(
      sanitizeWebEngageTrackProperties({
        path: '/cart',
        we_internal: 'ignored',
        label: 'a'.repeat(1200),
        quantity: 2,
        discounted: true,
      }),
    ).toEqual({
      path: '/cart',
      label: 'a'.repeat(1000),
      Quantity: 2,
      discounted: true,
    });
  });
});

describe('sanitizeWebEngageEventName', () => {
  it('truncates event names longer than 50 characters', () => {
    expect(sanitizeWebEngageEventName(` ${'Added To Cart'.padEnd(60, '!')} `)).toHaveLength(50);
  });
});

describe('buildWebEngageTrackPayload', () => {
  it('maps add_to_cart style payloads to WebEngage custom event shape', () => {
    expect(
      buildWebEngageTrackPayload('Added To Cart', {
        product_id: 'sku-1',
        price: 999,
        currency: 'INR',
      }),
    ).toEqual({
      eventName: 'Added To Cart',
      properties: {
        'Product ID': 'sku-1',
        Price: 999,
        Currency: 'INR',
      },
    });
  });
});
