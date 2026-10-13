import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ProfileForm } from '@/components/account/profile/ProfileForm';

const updateProfileMock = jest.fn();
const closeToHubMock = jest.fn();

jest.mock('@/hooks/user', () => ({
  useUserProfile: () => ({
    profile: {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Old',
      lastName: 'Name',
      phone: '9876543210',
      verifiedEmail: true,
      acceptsMarketing: false,
      ordersCount: 0,
      totalSpent: '0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
  }),
  useUserWallet: () => ({
    wallet: { gender: 'Female', birthdate: '1990-05-15' },
  }),
  useUpdateUserProfile: () => ({
    updateProfile: updateProfileMock,
    isPending: false,
    error: null,
  }),
}));

jest.mock('@/providers/account/AccountShellNavProvider', () => ({
  useAccountShellNav: () => ({
    closeToHub: closeToHubMock,
  }),
}));

describe('ProfileForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateProfileMock.mockResolvedValue(undefined);
  });

  it('returns to account hub after saving profile changes', async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    await user.clear(screen.getByLabelText('First name'));
    await user.type(screen.getByLabelText('First name'), 'New');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(updateProfileMock).toHaveBeenCalledWith({
      firstName: 'New',
      lastName: 'Name',
      phone: '9876543210',
    });
    expect(closeToHubMock).toHaveBeenCalledTimes(1);
  });

  it('shows validation errors below fields when save fails validation', async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    await user.clear(screen.getByLabelText('First name'));
    await user.clear(screen.getByLabelText('Phone number'));
    await user.type(screen.getByLabelText('Phone number'), '123');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid 10 digit phone number')).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
    expect(closeToHubMock).not.toHaveBeenCalled();
  });

  it('accepts +91 prefixed phone numbers without validation errors', async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '+919876543210' },
    });
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(screen.queryByText('Enter a valid 10 digit phone number')).not.toBeInTheDocument();
    expect(updateProfileMock).toHaveBeenCalledWith({
      firstName: 'Old',
      lastName: 'Name',
      phone: '9876543210',
    });
  });
});
