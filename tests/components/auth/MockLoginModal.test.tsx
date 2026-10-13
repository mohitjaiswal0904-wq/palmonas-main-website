import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { MockLoginModal } from '@/components/auth/mock-auth/MockLoginModal';
import { authMessages } from '@/config/auth/auth.config';
import { completeMockLogin } from '@/repositories/auth/auth.repository';
import type { AuthSession } from '@/types/auth/auth.types';

jest.mock('@/repositories/auth/auth.repository', () => ({
  completeMockLogin: jest.fn(),
}));

jest.mock('@/repositories/cart/cart.repository', () => ({
  resolveCartIdForLoginFlow: jest.fn().mockResolvedValue('gid://shopify/Cart/guest-1'),
}));

const mockCompleteMockLogin = completeMockLogin as jest.MockedFunction<typeof completeMockLogin>;

const session: AuthSession = {
  user: {
    id: 'user-1',
    firstName: 'Test',
    lastName: null,
    email: 'test@example.com',
    phoneNumber: '+919999999999',
    profilePicture: null,
    gender: 'prefer-not-to-say',
    isGuest: false,
  },
  claims: {
    userId: 'user-1',
    sessionId: 'sess-1',
    isGuest: false,
    shopifyCustomerId: '123',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  },
};

describe('MockLoginModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows phone step and advances to OTP after delay', async () => {
    render(
      <MockLoginModal open loginType="checkout" onClose={jest.fn()} onComplete={jest.fn()} />,
    );

    expect(screen.getByText('Login with phone')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Sending OTP…')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText('Enter OTP')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verify OTP' })).toBeInTheDocument();
  });

  it('completes login on successful OTP verification', async () => {
    const onComplete = jest.fn();
    const onClose = jest.fn();
    mockCompleteMockLogin.mockResolvedValue(session);

    render(
      <MockLoginModal open loginType="checkout" onClose={onClose} onComplete={onComplete} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockCompleteMockLogin).toHaveBeenCalledWith('checkout', {
        cartId: 'gid://shopify/Cart/guest-1',
      });
      expect(onComplete).toHaveBeenCalledWith(session);
      expect(screen.getByText(authMessages.success.login)).toBeInTheDocument();
    });

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error step and allows retry after failed verification', async () => {
    mockCompleteMockLogin.mockRejectedValue(new Error('Login failed'));

    render(
      <MockLoginModal open loginType="checkout" onClose={jest.fn()} onComplete={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Verify OTP' }));
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Login failed');
    });

    fireEvent.click(screen.getByRole('button', { name: authMessages.retryLogin }));
    expect(screen.getByText('Login with phone')).toBeInTheDocument();
  });
});
