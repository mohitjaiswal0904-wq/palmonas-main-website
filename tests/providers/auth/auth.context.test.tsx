import { renderHook } from '@testing-library/react';

import { useAuthContext } from '@/providers/auth/auth.context';

describe('auth.context', () => {
  it('throws when useAuthContext is used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuthContext())).toThrow(
      'useAuthContext must be used within AuthProvider',
    );
  });
});
