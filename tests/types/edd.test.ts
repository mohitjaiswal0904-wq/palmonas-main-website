import { transformEdd } from '@/types/edd';

describe('transformEdd', () => {
  it('maps order_within separately from ships_in', () => {
    expect(
      transformEdd({
        status: 'success',
        pincode: '400614',
        edd: '2026-07-28',
        ships_in: 'Ships in 1 days.',
        order_within: '0 hours 59 minutes',
      }),
    ).toEqual({
      status: 'success',
      pincode: '400614',
      edd: '2026-07-28',
      shipsIn: 'Ships in 1 days.',
      orderWithin: '0 hours 59 minutes',
      store: null,
    });
  });

  it('leaves orderWithin empty when the API omits order_within', () => {
    expect(
      transformEdd({
        status: 'success',
        pincode: '400614',
        edd: '2026-07-28',
        ships_in: 'Ships in 1 days.',
      }).orderWithin,
    ).toBe('');
  });

  it('ignores non-string order_within values from the API', () => {
    expect(
      transformEdd({
        status: 'success',
        pincode: '400614',
        edd: '2026-07-28',
        ships_in: 'Ships in 1 days.',
        order_within: null,
      }).orderWithin,
    ).toBe('');
  });

  it('returns null store when store_details has found false and store null', () => {
    expect(
      transformEdd({
        status: 'success',
        pincode: '221007',
        edd: '2026-10-03',
        ships_in: 'Ships in 1 days',
        store_details: {
          district_prefix: '221',
          error: 'No active store found in the district for the given pin code',
          found: false,
          pincode: '221007',
          store: null,
        },
      }).store,
    ).toBeNull();
  });

  it('maps nested store payload when store_details is found', () => {
    expect(
      transformEdd({
        status: 'success',
        pincode: '221002',
        edd: '2026-10-03',
        store_details: {
          found: true,
          store: {
            store_name: 'Koregaon Park',
            phone: '9876543210',
            map_link: 'https://maps.example.com',
          },
        },
      }).store,
    ).toEqual({
      address: '',
      found: true,
      mapLink: 'https://maps.example.com',
      matchType: '',
      phone: '9876543210',
      pincode: '',
      storeName: 'Koregaon Park',
    });
  });
});
