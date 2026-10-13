import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useCreatePopSubscription } from '@/hooks/pop/useCreatePopSubscription';
import { AppError } from '@/lib/errors';
import { createPopSubscription } from '@/services/pop.service';

jest.mock('@/services/pop.service', () => ({
  createPopSubscription: jest.fn(),
}));

const mockCreate = createPopSubscription as jest.MockedFunction<typeof createPopSubscription>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const input = {
  amount: 3000,
  callbackUrl: 'https://palmonas.com/pop',
  details: {
    name: 'Pranav',
    phone: '9833290022',
    email: 'p@example.com',
    addressLine1: 'Line 1',
    addressLine2: '',
    city: 'Pune',
    pincode: '411001',
    enrollmentMethod: 'online' as const,
    storeId: '',
    autopay: true,
    acceptedTerms: true,
  },
};

describe('useCreatePopSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exposes createSubscription and clears loading after success', async () => {
    mockCreate.mockResolvedValue({
      id: '1',
      paymentUrl: 'https://pay.example',
      raw: { id: '1', payment_url: 'https://pay.example' },
    });

    const { result } = renderHook(() => useCreatePopSubscription(), {
      wrapper: createWrapper(),
    });

    await result.current.createSubscription(input);

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });

    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(result.current.error).toBeNull();
  });

  it('surfaces AppError when create fails', async () => {
    mockCreate.mockRejectedValue(new AppError('NETWORK', 'offline'));

    const { result } = renderHook(() => useCreatePopSubscription(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.createSubscription(input)).rejects.toBeInstanceOf(AppError);

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });

    expect(result.current.error?.code).toBe('NETWORK');
  });
});
