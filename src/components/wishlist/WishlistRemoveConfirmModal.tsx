'use client';

import { AuthModalShell } from '@/components/auth/AuthModalShell';
import { Button } from '@/components/ui/Button';

interface WishlistRemoveConfirmModalProps {
  open: boolean;
  productName: string;
  isRemoving?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WishlistRemoveConfirmModal({
  open,
  productName,
  isRemoving = false,
  onConfirm,
  onCancel,
}: WishlistRemoveConfirmModalProps) {
  return (
    <AuthModalShell
      open={open}
      onClose={onCancel}
      aria-label="Confirm remove from wishlist"
      className="max-w-md text-left"
    >
      <h2 className="font-display text-xl text-[#151515]">Remove from wishlist?</h2>
      <p className="mt-2 text-sm text-[#62748E]">
        <span className="font-medium text-[#151515]">{productName}</span> will be removed from your
        saved items.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          aria-label="Keep item in wishlist"
          disabled={isRemoving}
          onClick={onCancel}
        >
          Keep it
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="w-full sm:w-auto"
          aria-label="Confirm remove from wishlist"
          isLoading={isRemoving}
          disabled={isRemoving}
          onClick={onConfirm}
        >
          Remove
        </Button>
      </div>
    </AuthModalShell>
  );
}
