import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useUpdateUserProfile } from '@/hooks/user/useUser';
import { queryKeys } from '@/lib/query/keys';
import { updateUserProfile } from '@/services/user.service';
import type { UserProfile } from '@/types/user';

const patchSessionUserMock = jest.fn();

jest.mock('@/hooks/auth/useAuth', () => ({
  useRequireAuth: () => ({
    guardApi: <T,>(fn: () => Promise<T>) => fn(),
  }),
}));

jest.mock('@/providers/auth/auth.context', () => ({
  useAuthContext: () => ({
    patchSessionUser: patchSessionUserMock,
  }),
}));

jest.mock('@/services/user.service', () => ({
  updateUserProfile: jest.fn(),
}));

const mockUpdateUserProfile = updateUserProfile as jest.MockedFunction<typeof updateUserProfile>;

const updatedProfile: UserProfile = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Priya',
  lastName: 'Sharma',
  phone: '9876543210',
  verifiedEmail: true,
  acceptsMarketing: false,
  ordersCount: 2,
  totalSpent: '5000',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2026-07-30T00:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return {
    queryClient,
    Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  };
}

describe('useUpdateUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateUserProfile.mockResolvedValue(updatedProfile);
  });

  it('updates profile cache and auth session snapshot on success', async () => {
    const { queryClient, Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateUserProfile(), { wrapper: Wrapper });

    await result.current.updateProfile({
      firstName: 'Priya',
      lastName: 'Sharma',
      phone: '9876543210',
    });

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith({
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '9876543210',
      });
    });

    expect(queryClient.getQueryData(queryKeys.user.profile())).toEqual(updatedProfile);
    expect(patchSessionUserMock).toHaveBeenCalledWith({
      firstName: 'Priya',
      lastName: 'Sharma',
      phoneNumber: '9876543210',
    });
  });

  it('surfaces API errors without patching auth session', async () => {
    mockUpdateUserProfile.mockRejectedValue(new Error('Update failed'));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateUserProfile(), { wrapper: Wrapper });

    await expect(
      result.current.updateProfile({
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '9876543210',
      }),
    ).rejects.toThrow('Update failed');

    expect(patchSessionUserMock).not.toHaveBeenCalled();
  });
});
