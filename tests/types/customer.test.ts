import {
  normaliseIndianPhone,
  transformUserDetailsToPopPrefill,
  type UserApiResponse,
} from '@/types/customer';

const sampleUser: UserApiResponse = {
  id: 8717832552705,
  first_name: 'Pranav',
  last_name: 'Arya',
  email: 'pranavleo22@gmail.com',
  phone: '+919833290022',
  addresses: [
    {
      id: 10878577115393,
      first_name: 'Pranav',
      last_name: 'Arya',
      address1: 'CHS',
      address2: null,
      city: 'Navi Mumbai',
      zip: '400614',
      phone: '',
      default: true,
    },
    {
      id: 10719340691713,
      first_name: 'Other',
      last_name: 'Person',
      address1: 'Second street',
      address2: 'Apt 2',
      city: 'Mumbai',
      zip: '400001',
      phone: '9999999999',
      default: false,
    },
  ],
};

describe('normaliseIndianPhone', () => {
  it('strips country code and keeps last 10 digits', () => {
    expect(normaliseIndianPhone('+919833290022')).toBe('9833290022');
  });

  it('returns empty string for nullish or empty input', () => {
    expect(normaliseIndianPhone(null)).toBe('');
    expect(normaliseIndianPhone(undefined)).toBe('');
    expect(normaliseIndianPhone('')).toBe('');
  });
});

describe('transformUserDetailsToPopPrefill', () => {
  it('maps user and first address into form prefills', () => {
    expect(transformUserDetailsToPopPrefill({ data: sampleUser })).toEqual({
      name: 'Pranav Arya',
      phone: '9833290022',
      email: 'pranavleo22@gmail.com',
      addressLine1: 'CHS',
      addressLine2: '',
      city: 'Navi Mumbai',
      pincode: '400614',
    });
  });

  it('uses first address only and tolerates empty address fields', () => {
    const result = transformUserDetailsToPopPrefill({
      data: {
        ...sampleUser,
        addresses: [
          {
            address1: null,
            address2: null,
            city: '',
            zip: '',
            phone: '',
          },
        ],
      },
    });

    expect(result.addressLine1).toBe('');
    expect(result.city).toBe('');
    expect(result.pincode).toBe('');
    expect(result.phone).toBe('9833290022');
  });

  it('returns empty address fields when addresses are missing', () => {
    const result = transformUserDetailsToPopPrefill({
      data: {
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        phone: '9876543210',
      },
    });

    expect(result).toEqual({
      name: 'Ada Lovelace',
      phone: '9876543210',
      email: 'ada@example.com',
      addressLine1: '',
      addressLine2: '',
      city: '',
      pincode: '',
    });
  });

  it('falls back to address phone/name when user-level fields are absent', () => {
    const result = transformUserDetailsToPopPrefill({
      data: {
        addresses: [
          {
            name: 'Fallback Name',
            address1: 'Line 1',
            address2: 'Line 2',
            city: 'Pune',
            zip: '411001',
            phone: '+911234567890',
          },
        ],
      },
    });

    expect(result.name).toBe('Fallback Name');
    expect(result.phone).toBe('1234567890');
    expect(result.addressLine1).toBe('Line 1');
    expect(result.pincode).toBe('411001');
  });
});
