import { render, screen, waitFor } from '@testing-library/react';

import { AccountGuestGuard } from '@/components/account/common/AccountGuestGuard';

const mockReplace = jest.fn();
let mockIsGuest = false;
let mockIsLoading = false;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    isGuest: mockIsGuest,
    isLoading: mockIsLoading,
  }),
}));

describe('AccountGuestGuard', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockIsGuest = false;
    mockIsLoading = false;
  });

  it('shows account children when the session is authenticated', () => {
    render(
      <AccountGuestGuard>
        <p>Account hub</p>
      </AccountGuestGuard>,
    );

    expect(screen.getByText('Account hub')).toBeVisible();
    expect(screen.queryByLabelText('Loading account section')).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('keeps children mounted while auth is loading', () => {
    mockIsLoading = true;

    render(
      <AccountGuestGuard>
        <p>Account hub</p>
      </AccountGuestGuard>,
    );

    expect(screen.getByLabelText('Loading account section')).toBeInTheDocument();
    expect(screen.getByText('Account hub')).toBeInTheDocument();
    expect(screen.getByText('Account hub')).not.toBeVisible();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('hides account children and redirects a guest after load', async () => {
    mockIsGuest = true;

    render(
      <AccountGuestGuard>
        <p>Account hub</p>
      </AccountGuestGuard>,
    );

    expect(screen.getByLabelText('Loading account section')).toBeInTheDocument();
    expect(screen.getByText('Account hub')).not.toBeVisible();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/?login=1&redirect=%2Faccount');
    });
  });

  it('does not redirect a guest while auth is still loading', () => {
    mockIsGuest = true;
    mockIsLoading = true;

    render(
      <AccountGuestGuard>
        <p>Account hub</p>
      </AccountGuestGuard>,
    );

    expect(screen.getByText('Account hub')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
