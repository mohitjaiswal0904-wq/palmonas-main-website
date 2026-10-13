import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { useCreateProductReview } from '@/hooks/product/useCreateProductReview';
import { createProductReview } from '@/services/product-reviews.service';
import { AppError } from '@/lib/errors';

jest.mock('@/services/product-reviews.service', () => ({
  createProductReview: jest.fn(),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useRequireAuth: () => ({
    guardApi: async <T,>(fn: () => Promise<T>) => fn(),
  }),
}));

const show = jest.fn();

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ show }),
}));

jest.mock('@/config/product/product.config', () => ({
  productMessages: {
    reviews: {
      successToast: 'Review Added Successfully!',
      errorToast: 'Could not submit your review. Please try again.',
    },
  },
}));

const mockCreate = createProductReview as jest.MockedFunction<typeof createProductReview>;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCreateProductReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a review and shows success toast', async () => {
    mockCreate.mockResolvedValue({
      id: 1,
      reviewerName: 'Meera',
      body: 'Great product',
      rating: 5,
      helpfulCount: 0,
      notHelpfulCount: 0,
      isVerifiedPurchase: false,
      createdAt: '2025-10-25T10:00:00.000Z',
    });

    const { result } = renderHook(() => useCreateProductReview('123'), { wrapper });

    await result.current.createReview({ rating: 5, body: 'Great product' });

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith('123', { rating: 5, body: 'Great product' });
      expect(show).toHaveBeenCalledWith(
        'Review Added Successfully!',
        expect.objectContaining({ type: 'success' }),
      );
    });
  });

  it('shows error toast when create fails', async () => {
    mockCreate.mockRejectedValue(new AppError('VALIDATION', 'Bad review', 400));

    const { result } = renderHook(() => useCreateProductReview('123'), { wrapper });

    await expect(result.current.createReview({ rating: 5, body: 'Great product' })).rejects.toBeTruthy();

    await waitFor(() => {
      expect(show).toHaveBeenCalledWith('Bad review', expect.objectContaining({ type: 'danger' }));
    });
  });

  it('falls back to config error copy when error has no message', async () => {
    mockCreate.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() => useCreateProductReview('123'), { wrapper });

    await expect(result.current.createReview({ rating: 5, body: 'Great product' })).rejects.toBeTruthy();

    await waitFor(() => {
      expect(show).toHaveBeenCalledWith(
        'Could not submit your review. Please try again.',
        expect.objectContaining({ type: 'danger' }),
      );
    });
  });

  it('exposes isSubmitting while mutation is pending', async () => {
    let resolveCreate: (value: unknown) => void = () => undefined;
    mockCreate.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCreate = resolve as (value: unknown) => void;
        }) as never,
    );

    const { result } = renderHook(() => useCreateProductReview('123'), { wrapper });

    const pending = result.current.createReview({ rating: 5, body: 'Great product' });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    resolveCreate({
      id: 1,
      reviewerName: 'Meera',
      body: 'Great product',
      rating: 5,
      helpfulCount: 0,
      notHelpfulCount: 0,
      isVerifiedPurchase: false,
      createdAt: '2025-10-25T10:00:00.000Z',
    });

    await pending;

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
