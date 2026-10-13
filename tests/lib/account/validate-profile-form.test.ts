import {
  hasProfileFormErrors,
  validateProfileForm,
} from '@/lib/account/validate-profile-form';

describe('validateProfileForm', () => {
  const validInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '9876543210',
  };

  it('returns no errors for a complete valid profile', () => {
    const errors = validateProfileForm(validInput);

    expect(hasProfileFormErrors(errors)).toBe(false);
  });

  it('flags missing mandatory name fields', () => {
    const errors = validateProfileForm({
      ...validInput,
      firstName: '',
      lastName: ' ',
    });

    expect(errors.firstName).toBe('First name is required');
    expect(errors.lastName).toBe('Last name is required');
  });

  it('rejects invalid phone numbers', () => {
    const errors = validateProfileForm({
      ...validInput,
      phone: '12345',
    });

    expect(errors.phone).toBe('Enter a valid 10 digit phone number');
  });

  it('accepts phone numbers with a +91 prefix', () => {
    const errors = validateProfileForm({
      ...validInput,
      phone: '+919876543210',
    });

    expect(hasProfileFormErrors(errors)).toBe(false);
  });
});
