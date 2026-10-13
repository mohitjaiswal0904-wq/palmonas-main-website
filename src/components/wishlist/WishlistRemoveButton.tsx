'use client';

import { WishlistRemoveIcon } from '@/components/icons/WishlistRemoveIcon';
import { cn } from '@/lib/utils/cn';

interface WishlistRemoveButtonProps {
  productName: string;
  onRemoveRequest: () => void;
  className?: string;
}

export function WishlistRemoveButton({
  productName,
  onRemoveRequest,
  className,
}: WishlistRemoveButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'pointer-events-auto absolute top-[2px] right-[2px] z-10 flex h-11 w-11 touch-manipulation items-start justify-end p-1 text-[#151515] transition-colors active:opacity-70',
        className,
      )}
      aria-label={`Remove ${productName} from wishlist`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onRemoveRequest();
      }}
    >
      <WishlistRemoveIcon />
    </button>
  );
}
