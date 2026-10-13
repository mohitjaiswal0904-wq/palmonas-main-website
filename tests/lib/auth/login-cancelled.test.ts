import { LoginCancelledError, isLoginCancelledError } from '@/lib/auth/login-cancelled';

describe('login-cancelled', () => {
  it('identifies LoginCancelledError instances', () => {
    const err = new LoginCancelledError();
    expect(isLoginCancelledError(err)).toBe(true);
    expect(err.message).toBe('LOGIN_CANCELLED');
  });

  it('returns false for unrelated errors', () => {
    expect(isLoginCancelledError(new Error('nope'))).toBe(false);
    expect(isLoginCancelledError('LOGIN_CANCELLED')).toBe(false);
  });
});
