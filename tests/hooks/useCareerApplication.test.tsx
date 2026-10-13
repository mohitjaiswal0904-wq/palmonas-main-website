import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import {
  useGeneralCareerApplication,
  useJobCareerApplication,
} from '@/hooks/useCareerApplication';
import {
  submitGeneralCareerApplication,
  submitJobCareerApplication,
} from '@/services/careers.service';
import { AppError } from '@/lib/errors';

jest.mock('@/services/careers.service', () => ({
  submitGeneralCareerApplication: jest.fn(),
  submitJobCareerApplication: jest.fn(),
}));

const mockedGeneral = submitGeneralCareerApplication as jest.MockedFunction<
  typeof submitGeneralCareerApplication
>;
const mockedJob = submitJobCareerApplication as jest.MockedFunction<
  typeof submitJobCareerApplication
>;

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe('useCareerApplication', () => {
  beforeEach(() => {
    mockedGeneral.mockReset();
    mockedJob.mockReset();
  });

  it('submits a general application successfully', async () => {
    mockedGeneral.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useGeneralCareerApplication(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({
        name: 'Ada',
        phone: '9876543210',
        email: 'ada@example.com',
        lookingFor: '',
        coverLetter: '',
        website: '',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedGeneral).toHaveBeenCalled();
  });

  it('surfaces AppError for failed general submissions', async () => {
    mockedGeneral.mockRejectedValueOnce(new AppError('NETWORK', 'Network error'));
    const { result } = renderHook(() => useGeneralCareerApplication(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.submit({
          name: 'Ada',
          phone: '9876543210',
          email: 'ada@example.com',
          lookingFor: '',
          coverLetter: '',
          website: '',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('NETWORK'));
  });

  it('submits a job application successfully', async () => {
    mockedJob.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useJobCareerApplication(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({
        jobId: '1',
        jobTitle: 'SOFTWARE DEVELOPMENT ENGINEER',
        jobDescription: 'About the role',
        application: {
          name: 'Ada',
          phone: '9876543210',
          email: 'ada@example.com',
          linkedin: 'https://linkedin.com/in/ada',
          website: '',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('surfaces AppError for failed job submissions', async () => {
    mockedJob.mockRejectedValueOnce(new AppError('SERVER_ERROR', 'Server error'));
    const { result } = renderHook(() => useJobCareerApplication(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.submit({
          jobId: '1',
          jobTitle: 'SOFTWARE DEVELOPMENT ENGINEER',
          jobDescription: 'About the role',
          application: {
            name: 'Ada',
            phone: '9876543210',
            email: 'ada@example.com',
            linkedin: 'https://linkedin.com/in/ada',
            website: '',
          },
        }),
      ).rejects.toBeInstanceOf(AppError);
    });

    await waitFor(() => expect(result.current.error?.code).toBe('SERVER_ERROR'));
  });
});
