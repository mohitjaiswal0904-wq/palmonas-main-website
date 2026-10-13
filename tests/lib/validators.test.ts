import {
  indianMobileValidator,
  normalizeIndianPhoneDigits,
  pincodeValidator,
  sanitizeIndianPhoneInput,
} from '@/lib/validators';

describe('pincodeValidator', () => {
  it('accepts a valid 6-digit Indian pincode', () => {
    expect(pincodeValidator.safeParse('411001').success).toBe(true);
    expect(pincodeValidator.safeParse('400614').success).toBe(true);
  });

  it('rejects pincodes starting with 0', () => {
    expect(pincodeValidator.safeParse('012345').success).toBe(false);
    expect(pincodeValidator.safeParse('000000').success).toBe(false);
  });

  it('rejects pincodes with incorrect length or non-digits', () => {
    expect(pincodeValidator.safeParse('12345').success).toBe(false);
    expect(pincodeValidator.safeParse('abc123').success).toBe(false);
  });
});

describe('indianMobileValidator', () => {
  it('accepts valid Indian mobile numbers', () => {
    expect(indianMobileValidator.safeParse('9876543210').success).toBe(true);
    expect(indianMobileValidator.safeParse('6123456789').success).toBe(true);
  });

  it('rejects numbers not starting with 6–9', () => {
    expect(indianMobileValidator.safeParse('1234567890').success).toBe(false);
    expect(indianMobileValidator.safeParse('5123456789').success).toBe(false);
    expect(indianMobileValidator.safeParse('0000000000').success).toBe(false);
  });

  it('rejects numbers with incorrect length', () => {
    expect(indianMobileValidator.safeParse('987654321').success).toBe(false);
    expect(indianMobileValidator.safeParse('98765432101').success).toBe(false);
  });
});

describe('normalizeIndianPhoneDigits', () => {
  it('extracts 10-digit mobile from +91 prefixed values', () => {
    expect(normalizeIndianPhoneDigits('+919876543210')).toBe('9876543210');
    expect(normalizeIndianPhoneDigits('919876543210')).toBe('9876543210');
  });

  it('returns plain 10-digit numbers unchanged', () => {
    expect(normalizeIndianPhoneDigits('9876543210')).toBe('9876543210');
  });
});

describe('sanitizeIndianPhoneInput', () => {
  it('collapses +91 prefixed numbers to 10 national digits while typing', () => {
    expect(sanitizeIndianPhoneInput('+919876543210')).toBe('9876543210');
    expect(sanitizeIndianPhoneInput('919876543210')).toBe('9876543210');
  });

  it('caps plain numbers at 10 digits', () => {
    expect(sanitizeIndianPhoneInput('9876543210')).toBe('9876543210');
    expect(sanitizeIndianPhoneInput('98765432101')).toBe('9876543210');
  });
});
