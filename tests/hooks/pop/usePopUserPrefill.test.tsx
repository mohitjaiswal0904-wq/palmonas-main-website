import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { usePopUserPrefill } from '@/hooks/pop/usePopUserPrefill';
import { AppError } from '@/lib/errors';
import { getUserDetailsForPopPrefill } from '@/services/customer.service';

jest.mock('@/services/customer.service', () => ({
  getUserDetailsForPopPrefill: jest.fn(),
}));

const mockGetPrefill = getUserDetailsForPopPrefill as jest.MockedFunction<
  typeof getUserDetailsForPopPrefill
>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePopUserPrefill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns prefill data on success', async () => {
    mockGetPrefill.mockResolvedValue({
      name: 'Pranav Arya',
      phone: '9833290022',
      email: 'pranavleo22@gmail.com',
      addressLine1: 'CHS',
      addressLine2: '',
      city: 'Navi Mumbai',
      pincode: '400614',
    });

    const { result } = renderHook(() => usePopUserPrefill(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.prefill?.name).toBe('Pranav Arya');
    expect(result.current.error).toBeNull();
  });

  it('surfaces AppError when the request fails without blocking callers', async () => {
    mockGetPrefill.mockRejectedValue(new AppError('NETWORK', 'offline'));

    const { result } = renderHook(() => usePopUserPrefill(true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.prefill).toBeUndefined();
    expect(result.current.error?.code).toBe('NETWORK');
  });

  it('does not fetch when disabled', async () => {
    const { result } = renderHook(() => usePopUserPrefill(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockGetPrefill).not.toHaveBeenCalled();
  });
});
