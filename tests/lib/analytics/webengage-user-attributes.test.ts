import {
  buildWebEngageUserAttributes,
  normalizeWebEngageGender,
} from '@/lib/analytics/webengage-user-attributes';

describe('normalizeWebEngageGender', () => {
  it('maps common gender values to WebEngage system values', () => {
    expect(normalizeWebEngageGender('female')).toBe('female');
    expect(normalizeWebEngageGender('Male')).toBe('male');
    expect(normalizeWebEngageGender('other')).toBe('other');
    expect(normalizeWebEngageGender('unknown')).toBeUndefined();
  });
});

describe('buildWebEngageUserAttributes', () => {
  it('maps auth profile fields to WebEngage system attributes', () => {
    expect(
      buildWebEngageUserAttributes({
        email: 'Shopper@Example.com',
        firstName: 'Asha',
        lastName: 'Sharma',
        phoneNumber: '9876543210',
        gender: 'female',
      }),
    ).toEqual({
      we_email: 'shopper@example.com',
      we_first_name: 'Asha',
      we_last_name: 'Sharma',
      we_phone: '+919876543210',
      we_gender: 'female',
    });
  });

  it('omits empty profile values', () => {
    expect(
      buildWebEngageUserAttributes({
        email: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        gender: '',
      }),
    ).toEqual({});
  });
});
