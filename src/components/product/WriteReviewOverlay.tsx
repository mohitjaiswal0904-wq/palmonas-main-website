'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { WriteReviewForm } from '@/components/product/WriteReviewForm';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { productMessages } from '@/config/product/product.config';
import type { useRequireAuth } from '@/hooks/auth/useAuth';
import { useCreateProductReview } from '@/hooks/product/useCreateProductReview';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { CreateProductReviewInput } from '@/types/product/reviews';

interface WriteReviewOverlayProps {
  open: boolean;
  productId: string;
  onClose: () => void;
}

/**
 * Desktop modal / mobile bottomsheet shell for writing a product review.
 */
export function WriteReviewOverlay({ open, productId, onClose }: WriteReviewOverlayProps) {
  const isLaptop = useMediaQuery('laptop');
  const { createReview, isSubmitting } = useCreateProductReview(productId);

  // Close on Escape for the desktop dialog.
  useEffect(() => {
    if (!open || !isLaptop) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLaptop, onClose, open]);

  const handleSubmit = useCallback(
    async (input: CreateProductReviewInput) => {
      await createReview(input);
      onClose();
    },
    [createReview, onClose],
  );

  if (!open) {
    return null;
  }

  const form = (
    <WriteReviewForm isSubmitting={isSubmitting} onCancel={onClose} onSubmit={handleSubmit} />
  );

  if (!isLaptop) {
    return (
      <BottomSheet open={open} onClose={onClose} title={productMessages.reviews.writeReview}>
        <div className="-mx-4 -mt-4 -mb-4">{form}</div>
      </BottomSheet>
    );
  }

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="z-modal-backdrop fixed inset-0 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={productMessages.reviews.a11y.closeWriteReview}
        onClick={onClose}
      />
      <div
        className="z-modal relative flex max-h-[90dvh] w-full max-w-[496px] flex-col overflow-hidden rounded-2xl bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-dialog-title"
      >
        <div className="flex items-center justify-between border-b border-[#efefef] p-4">
          <h2 id="write-review-dialog-title" className="text-lg font-semibold text-[#151515]">
            {productMessages.reviews.writeReview}
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center text-[#151515]"
            aria-label={productMessages.reviews.a11y.closeWriteReview}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto">{form}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Open write-review after auth guard; used by summary / all-reviews CTAs.
 *
 * @param openWrite - Callback that sets write overlay open.
 * @param guard - Auth action guard from useRequireAuth.
 */
export function openWriteReviewGuarded(
  openWrite: () => void,
  guard: ReturnType<typeof useRequireAuth>['guard'],
): void {
  guard(openWrite, { actionId: 'reviews.write' });
}
