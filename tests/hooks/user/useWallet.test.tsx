import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useWallet } from '@/hooks/user/useWallet';
import { fetchWalletDetails } from '@/services/user/wallet.service';

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/services/user/wallet.service', () => ({
  fetchWalletDetails: jest.fn(),
}));

import { useAuth } from '@/hooks/auth/useAuth';

const mockUseAuth = useAuth as jest.Mock;
const mockFetchWalletDetails = fetchWalletDetails as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchWalletDetails.mockResolvedValue({
      balance: 200,
      loyaltyPoints: 150,
      refundCredit: 50,
      currency: 'INR',
      customerEmail: 'user@example.com',
      customerName: 'Test User',
      phoneNumber: '9876543210',
      referralCode: 'REF1',
      shopifyCustomerId: 123,
    });
  });

  it('fetches wallet when authenticated and enabled', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useWallet(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchWalletDetails).toHaveBeenCalledTimes(1);
    expect(result.current.balance).toBe(200);
    expect(result.current.wallet?.customerName).toBe('Test User');
  });

  it('does not fetch when guest', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { result } = renderHook(() => useWallet(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchWalletDetails).not.toHaveBeenCalled();
    expect(result.current.balance).toBe(0);
  });

  it('respects enabled override when authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useWallet({ enabled: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetchWalletDetails).not.toHaveBeenCalled();
  });

  it('does not refetch on remount when cache is fresh', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const wrapper = createWrapper();
    const { unmount } = renderHook(() => useWallet(), { wrapper });

    await waitFor(() => {
      expect(mockFetchWalletDetails).toHaveBeenCalledTimes(1);
    });

    unmount();
    renderHook(() => useWallet(), { wrapper });

    await waitFor(() => {
      expect(mockFetchWalletDetails).toHaveBeenCalledTimes(1);
    });
  });
});
