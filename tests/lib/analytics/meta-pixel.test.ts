/** @jest-environment jsdom */

import {
  buildMetaAdvancedMatchingParams,
  buildMetaFbcValue,
  buildMetaTrackPayload,
  captureMetaFbcFromUrl,
  generateMetaEventId,
  normalizeMetaEmail,
  normalizeMetaPhoneE164,
  readBrowserCookie,
} from '@/lib/analytics/meta-pixel';
import { META_STANDARD_PROPERTY } from '@/lib/analytics/sanitize-analytics-properties';

describe('normalizeMetaEmail', () => {
  it('lowercases and trims valid emails', () => {
    expect(normalizeMetaEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('returns undefined for invalid emails', () => {
    expect(normalizeMetaEmail('not-an-email')).toBeUndefined();
  });
});

describe('normalizeMetaPhoneE164', () => {
  it('formats 10-digit Indian numbers to E.164', () => {
    expect(normalizeMetaPhoneE164('9876543210')).toBe('+919876543210');
  });

  it('preserves explicit E.164 numbers', () => {
    expect(normalizeMetaPhoneE164('+919876543210')).toBe('+919876543210');
  });

  it('returns undefined when no digits are present', () => {
    expect(normalizeMetaPhoneE164('abc')).toBeUndefined();
  });
});

describe('buildMetaAdvancedMatchingParams', () => {
  it('maps auth profile fields to Meta advanced matching keys', () => {
    expect(
      buildMetaAdvancedMatchingParams({
        email: 'User@Example.com',
        phone: '9876543210',
        externalId: 'user-123',
        firstName: 'Asha',
        lastName: 'Sharma',
        city: 'Mumbai',
        state: 'MH',
        zip: '400001',
        country: 'IN',
        dateOfBirth: '1990-01-15',
        gender: 'female',
      }),
    ).toEqual({
      em: 'user@example.com',
      ph: '+919876543210',
      external_id: 'user-123',
      fn: 'asha',
      ln: 'sharma',
      ct: 'mumbai',
      st: 'mh',
      zp: '400001',
      country: 'in',
      db: '19900115',
      ge: 'f',
    });
  });

  it('omits empty or invalid values', () => {
    expect(buildMetaAdvancedMatchingParams({ email: 'bad', phone: '12' })).toEqual({});
  });
});

describe('Meta browser cookies', () => {
  beforeEach(() => {
    document.cookie = '';
  });

  it('writes and reads _fbc from fbclid', () => {
    captureMetaFbcFromUrl('?fbclid=abc123');

    const fbc = readBrowserCookie('_fbc');
    expect(fbc).toMatch(/^fb\.1\.\d+\.abc123$/);
  });

  it('builds a deterministic _fbc value', () => {
    expect(buildMetaFbcValue('click-id', 1_700_000_000_000)).toBe('fb.1.1700000000000.click-id');
  });
});

describe('buildMetaTrackPayload', () => {
  beforeEach(() => {
    document.cookie = '_fbp=; max-age=0; path=/';
    document.cookie = '_fbc=; max-age=0; path=/';
    document.cookie = '_fbp=fbp-value; path=/';
    document.cookie = '_fbc=fbc-value; path=/';
  });

  it('adds eventID, browser ids, and single-product commerce fields', () => {
    const payload = buildMetaTrackPayload({
      product_id: 'SKU123',
      product_name: 'Gold Ring',
      category: 'Rings',
      quantity: 2,
      price: 2499,
      value: 4998,
      currency: 'INR',
      is_guest: false,
      user_id: 'user-1',
      session_id: 'session-1',
      [META_STANDARD_PROPERTY]: true,
    });

    expect(payload.eventID).toEqual(expect.any(String));
    expect(payload.fbp).toBe('fbp-value');
    expect(payload.fbc).toBe('fbc-value');
    expect(payload.login_status).toBe('logged_in');
    expect(payload.content_ids).toEqual(['SKU123']);
    expect(payload.content_type).toBe('product');
    expect(payload.num_items).toBe(2);
    expect(payload.contents).toEqual([
      { id: 'SKU123', quantity: 2, item_price: 2499 },
    ]);
    expect(payload.content_name).toBe('Gold Ring');
    expect(payload.content_category).toBe('Rings');
    expect(payload.user_id).toBeUndefined();
    expect(payload.session_id).toBeUndefined();
  });

  it('maps checkout products_json into Meta contents', () => {
    const payload = buildMetaTrackPayload({
      value: 5498,
      currency: 'INR',
      order_id: 'ord-1',
      products_json: JSON.stringify([
        { product_id: 'SKU123', quantity: 1, price: 2499 },
        { product_id: 'SKU456', quantity: 2, price: 1500 },
      ]),
    });

    expect(payload.content_ids).toEqual(['SKU123', 'SKU456']);
    expect(payload.num_items).toBe(3);
    expect(payload.contents).toEqual([
      { id: 'SKU123', quantity: 1, item_price: 2499 },
      { id: 'SKU456', quantity: 2, item_price: 1500 },
    ]);
    expect(payload.order_id).toBe('ord-1');
    expect(payload.products_json).toBeUndefined();
  });
});

describe('generateMetaEventId', () => {
  it('returns a non-empty unique id', () => {
    expect(generateMetaEventId()).not.toEqual(generateMetaEventId());
  });
});
