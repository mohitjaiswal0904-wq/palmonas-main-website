import { popPersonalDetailsMessages } from '@/config/pop/pop-personal-details.config';

describe('popPersonalDetailsMessages', () => {
  it('exports validation copy for the personal-details form', () => {
    expect(popPersonalDetailsMessages.validation.phoneInvalid).toBe(
      'Enter a valid 10-digit mobile number',
    );
    expect(popPersonalDetailsMessages.validation.pincodeInvalid).toBe(
      'Enter a valid 6-digit pincode',
    );
    expect(popPersonalDetailsMessages.a11y.termsCheckbox).toBe('Accept terms and conditions');
  });
});
