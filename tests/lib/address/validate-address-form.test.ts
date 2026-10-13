import {
  hasAddressFormErrors,
  sanitizeNumericAddressInput,
  validateAddressForm,
} from '@/lib/address/validate-address-form';

describe('validateAddressForm', () => {
  const validInput = {
    firstName: 'Jane',
    lastName: 'Doe',
    addressLine1: '12 Main Street',
    city: 'Mumbai',
    province: 'Maharashtra',
    country: 'India',
    zip: '400001',
    phone: '9876543210',
  };

  it('returns no errors for a complete valid address', () => {
    const errors = validateAddressForm(validInput);

    expect(hasAddressFormErrors(errors)).toBe(false);
  });

  it('flags missing mandatory fields', () => {
    const errors = validateAddressForm({
      ...validInput,
      firstName: '',
      lastName: ' ',
      addressLine1: '',
      city: '',
      province: '',
      country: '',
    });

    expect(errors.firstName).toBeTruthy();
    expect(errors.lastName).toBeTruthy();
    expect(errors.addressLine1).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.province).toBeTruthy();
    expect(errors.country).toBeTruthy();
  });

  it('rejects alphabetic pincode values', () => {
    const errors = validateAddressForm({
      ...validInput,
      zip: 'abc123',
    });

    expect(errors.zip).toBe('Enter a valid 6 digit pincode');
  });

  it('rejects alphabetic phone values', () => {
    const errors = validateAddressForm({
      ...validInput,
      phone: '98abcdef',
    });

    expect(errors.phone).toBe('Enter a valid 10 digit phone number');
  });

  it('rejects phone numbers with incorrect length', () => {
    const errors = validateAddressForm({
      ...validInput,
      phone: '12345',
    });

    expect(errors.phone).toBe('Enter a valid 10 digit phone number');
  });

  it('rejects mobile numbers not starting with 6–9', () => {
    const errors = validateAddressForm({
      ...validInput,
      phone: '1234567890',
    });

    expect(errors.phone).toBe('Enter a valid 10 digit phone number');
  });

  it('accepts phone numbers with a +91 prefix', () => {
    const errors = validateAddressForm({
      ...validInput,
      phone: '+919876543210',
    });

    expect(hasAddressFormErrors(errors)).toBe(false);
  });

  it('rejects pincodes starting with 0', () => {
    const errors = validateAddressForm({
      ...validInput,
      zip: '012345',
    });

    expect(errors.zip).toBe('Enter a valid 6 digit pincode');
  });
});

describe('sanitizeNumericAddressInput', () => {
  it('strips non-digits and enforces max length', () => {
    expect(sanitizeNumericAddressInput('12ab34cd567890', 6)).toBe('123456');
    expect(sanitizeNumericAddressInput('98 7654 3210', 10)).toBe('9876543210');
  });
});
