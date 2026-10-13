import {
  hasPopPersonalDetailsErrors,
  validatePopPersonalDetails,
} from '@/lib/pop/validate-pop-personal-details';

describe('validatePopPersonalDetails', () => {
  const validInput = {
    name: 'Jane Doe',
    phone: '9876543210',
    email: 'jane@example.com',
    addressLine1: '12 Main Street',
    city: 'Pune',
    pincode: '411001',
    enrollmentMethod: 'online' as const,
    storeId: '',
    acceptedTerms: true,
  };

  it('returns no errors for valid details', () => {
    const errors = validatePopPersonalDetails(validInput);

    expect(hasPopPersonalDetailsErrors(errors)).toBe(false);
  });

  it('rejects invalid mobile numbers', () => {
    const errors = validatePopPersonalDetails({
      ...validInput,
      phone: '1234567890',
    });

    expect(errors.phone).toBe('Enter a valid 10-digit mobile number');
  });

  it('rejects invalid pincodes', () => {
    const errors = validatePopPersonalDetails({
      ...validInput,
      pincode: '012345',
    });

    expect(errors.pincode).toBe('Enter a valid 6-digit pincode');
  });

  it('requires terms acceptance before submit', () => {
    const errors = validatePopPersonalDetails({
      ...validInput,
      acceptedTerms: false,
    });

    expect(errors.acceptedTerms).toBe('Please accept the terms & conditions');
  });

  it('requires a store when enrolling at store', () => {
    const errors = validatePopPersonalDetails({
      ...validInput,
      enrollmentMethod: 'at_store',
      storeId: '',
    });

    expect(errors.storeId).toBe('Please select a store');
  });
});
