'use client';

import { AuthModalShell } from '@/components/auth/AuthModalShell';
import { TrashIcon } from '@/components/icons/cart-icons';
import { Button } from '@/components/ui/Button';
import { cartMessages } from '@/config/cart/cart.config';

export type CartRemoveLoadingAction = 'remove' | 'wishlist' | null;

interface CartRemoveConfirmModalProps {
  open: boolean;
  loadingAction?: CartRemoveLoadingAction;
  onRemove: () => void;
  onMoveToWishlist: () => void;
  onCancel: () => void;
}

/** Confirms cart line removal with option to move item to wishlist. */
export function CartRemoveConfirmModal({
  open,
  loadingAction = null,
  onRemove,
  onMoveToWishlist,
  onCancel,
}: CartRemoveConfirmModalProps) {
  const isBusy = loadingAction !== null;

  return (
    <AuthModalShell
      open={open}
      onClose={onCancel}
      aria-label={cartMessages.a11y.confirmRemove}
      className="max-w-[309px] p-3 text-center"
    >
      <div className="mx-auto mt-2 mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#E5E5E5]">
        <TrashIcon className="h-5 w-5" />
      </div>
      <p className="mb-6 px-2 text-base font-bold text-[#151515]">
        {cartMessages.removeConfirm.title}
      </p>
      <div className="flex w-full gap-3">
        <Button
          type="button"
          variant="secondary"
          className="h-auto min-h-[42px] flex-1 rounded-md border border-[#151515] bg-white py-3 text-xs font-normal text-[#151515]"
          isLoading={loadingAction === 'remove'}
          disabled={isBusy}
          onClick={onRemove}
        >
          {cartMessages.removeConfirm.remove}
        </Button>
        <Button
          type="button"
          variant="primary"
          className="h-auto min-h-[42px] flex-1 rounded-md bg-[#151515] py-3 text-xs font-normal text-white"
          isLoading={loadingAction === 'wishlist'}
          disabled={isBusy}
          onClick={onMoveToWishlist}
        >
          {cartMessages.removeConfirm.moveToWishlist}
        </Button>
      </div>
    </AuthModalShell>
  );
}
