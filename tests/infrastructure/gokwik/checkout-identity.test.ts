import {
  clearGokwikCheckoutIdentity,
  normalizePhoneForGokwikCheckout,
  syncGokwikCheckoutIdentity,
} from '@/infrastructure/gokwik/checkout-identity';

describe('gokwik checkout-identity', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.cookie = '';
  });

  it('normalizePhoneForGokwikCheckout returns last 10 digits', () => {
    expect(normalizePhoneForGokwikCheckout('+919833290022')).toBe('9833290022');
  });

  it('syncGokwikCheckoutIdentity writes phone to localStorage and sessionStorage', () => {
    syncGokwikCheckoutIdentity({ phone: '+919833290022', email: 'test@example.com' });

    expect(window.localStorage.getItem('kp-login-no')).toBe('9833290022');
    expect(window.sessionStorage.getItem('kp-login-no')).toBe('9833290022');
    expect(window.localStorage.getItem('kp_email')).toBe('test@example.com');
  });

  it('syncGokwikCheckoutIdentity overwrites a stale phone number', () => {
    window.localStorage.setItem('kp-login-no', '9999999999');
    window.sessionStorage.setItem('kp-login-no', '9999999999');

    syncGokwikCheckoutIdentity({ phone: '+919833290022' });

    expect(window.localStorage.getItem('kp-login-no')).toBe('9833290022');
    expect(window.sessionStorage.getItem('kp-login-no')).toBe('9833290022');
  });

  it('clearGokwikCheckoutIdentity removes stored identity keys', () => {
    syncGokwikCheckoutIdentity({ phone: '+919833290022', email: 'test@example.com' });

    clearGokwikCheckoutIdentity();

    expect(window.localStorage.getItem('kp-login-no')).toBeNull();
    expect(window.sessionStorage.getItem('kp-login-no')).toBeNull();
    expect(window.localStorage.getItem('kp_email')).toBeNull();
  });
});
