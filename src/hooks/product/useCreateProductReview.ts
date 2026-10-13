'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { productMessages } from '@/config/product/product.config';
import { useRequireAuth } from '@/hooks/auth/useAuth';
import { useToast } from '@/hooks/useToast';
import { isAppError } from '@/lib/errors';
import { queryKeys } from '@/lib/query/keys';
import { showErrorToast, showSuccessToast } from '@/lib/toast/app-toast';
import { createProductReview } from '@/services/product-reviews.service';
import type { CreateProductReviewInput, ProductReview } from '@/types/product/reviews';

/**
 * Authenticated mutation to create a product review and refresh review queries.
 *
 * @param productId - Product id for the reviews API path.
 */
export function useCreateProductReview(productId: string): {
  createReview: (input: CreateProductReviewInput) => Promise<ProductReview>;
  isSubmitting: boolean;
} {
  const queryClient = useQueryClient();
  const { guardApi } = useRequireAuth();
  const { show } = useToast();

  const mutation = useMutation({
    mutationFn: (input: CreateProductReviewInput) =>
      guardApi(() => createProductReview(productId, input), {
        apiId: 'reviews.create',
      }),
    onSuccess: () => {
      showSuccessToast(show, productMessages.reviews.successToast, { placement: 'top' });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.products.all, 'reviews', productId],
      });
    },
    onError: (error) => {
      const message =
        isAppError(error) && error.message ? error.message : productMessages.reviews.errorToast;
      showErrorToast(show, message, { placement: 'top' });
    },
  });

  return {
    createReview: (input) => mutation.mutateAsync(input),
    isSubmitting: mutation.isPending,
  };
}
