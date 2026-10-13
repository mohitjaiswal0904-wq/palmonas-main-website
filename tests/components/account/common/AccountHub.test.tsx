import { render, screen } from '@testing-library/react';

import { AccountHub } from '@/components/account/common/AccountHub';
import type { AuthUser } from '@/types/auth/auth.types';
import type { UserProfile } from '@/types/user';

const mockUser: AuthUser = {
  id: 'user-1',
  firstName: 'Pranav',
  lastName: 'Arya',
  email: 'pranav@example.com',
  phoneNumber: '9833290022',
  profilePicture: null,
  gender: 'prefer-not-to-say',
  isGuest: false,
};

const mockProfile: UserProfile = {
  id: 'user-1',
  email: 'priya@example.com',
  firstName: 'Priya',
  lastName: 'Shah',
  phone: '9000000000',
  verifiedEmail: true,
  acceptsMarketing: false,
  ordersCount: 0,
  totalSpent: '0',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

let mockIsAuthLoading = false;
let mockUserState: AuthUser | null = mockUser;
let mockProfileState: UserProfile | undefined;
let mockIsProfileLoading = false;

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => ({
    user: mockUserState,
    isLoading: mockIsAuthLoading,
  }),
}));

jest.mock('@/hooks/user', () => ({
  useUserProfile: () => ({
    profile: mockProfileState,
    isLoading: mockIsProfileLoading,
  }),
}));

jest.mock('@/components/account/common/AccountMenuCard', () => ({
  AccountMenuCard: () => <div>Account menu</div>,
}));

jest.mock('@/components/account/common/AccountOthersSection', () => ({
  AccountOthersSection: () => <div>Other account options</div>,
}));

describe('AccountHub', () => {
  const onSelectPanel = jest.fn();
  const onSelectProfile = jest.fn();

  beforeEach(() => {
    mockIsAuthLoading = false;
    mockUserState = mockUser;
    mockProfileState = undefined;
    mockIsProfileLoading = false;
    onSelectPanel.mockReset();
    onSelectProfile.mockReset();
  });

  it('shows a skeleton while auth is bootstrapping', () => {
    mockIsAuthLoading = true;

    render(<AccountHub onSelectPanel={onSelectPanel} onSelectProfile={onSelectProfile} />);

    expect(screen.getByLabelText('Loading account section')).toBeInTheDocument();
    expect(screen.queryByText('Account menu')).not.toBeInTheDocument();
  });

  it('renders the hub from the session user while profile is still loading', () => {
    mockIsProfileLoading = true;

    render(<AccountHub onSelectPanel={onSelectPanel} onSelectProfile={onSelectProfile} />);

    expect(screen.getByRole('heading', { name: 'Pranav Arya' })).toBeInTheDocument();
    expect(screen.getByText('Account menu')).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading account section')).not.toBeInTheDocument();
  });

  it('prefers the profile name once it loads', () => {
    mockProfileState = mockProfile;

    render(<AccountHub onSelectPanel={onSelectPanel} onSelectProfile={onSelectProfile} />);

    expect(screen.getByRole('heading', { name: 'Priya Shah' })).toBeInTheDocument();
  });

  it('falls back to Guest User when no name is available', () => {
    mockUserState = { ...mockUser, firstName: null, lastName: null };

    render(<AccountHub onSelectPanel={onSelectPanel} onSelectProfile={onSelectProfile} />);

    expect(screen.getByRole('heading', { name: 'Guest User' })).toBeInTheDocument();
  });
});
