import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { usePincode } from '@/hooks/usePincode';
import { checkEdd, validatePincode } from '@/services/pincode.service';

jest.mock('@/services/pincode.service', () => ({
  validatePincode: jest.fn(),
  checkEdd: jest.fn(),
}));

const mockValidatePincode = validatePincode as jest.MockedFunction<typeof validatePincode>;
const mockCheckEdd = checkEdd as jest.MockedFunction<typeof checkEdd>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('usePincode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates pincode via service', async () => {
    mockValidatePincode.mockResolvedValue({
      valid: true,
      pincode: '110001',
      message: 'Number of pincode(s) found:1',
      postOffices: [],
    });

    const { result } = renderHook(() => usePincode(), {
      wrapper: createWrapper(),
    });

    await result.current.validatePincode('110001');

    await waitFor(() => {
      expect(mockValidatePincode).toHaveBeenCalledWith('110001');
      expect(result.current.isValidating).toBe(false);
    });
  });

  it('checks EDD via service', async () => {
    mockCheckEdd.mockResolvedValue({
      edd: '3-5 days',
      pincode: '110001',
      shipsIn: '2 days',
      orderWithin: '',
      status: 'success',
      store: null,
    });

    const { result } = renderHook(() => usePincode(), {
      wrapper: createWrapper(),
    });

    await result.current.checkEdd({
      pincode: '110001',
      inStock: true,
      type: 'demifine',
    });

    await waitFor(() => {
      expect(mockCheckEdd).toHaveBeenCalledWith({
        pincode: '110001',
        inStock: true,
        type: 'demifine',
      });
      expect(result.current.result?.edd).toBe('3-5 days');
    });
  });
});
