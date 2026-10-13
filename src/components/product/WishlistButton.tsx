'use client';

import { HeartIcon } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils/cn';

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  variant?: 'default' | 'card';
  className?: string;
}

export function WishlistButton({
  productId,
  productName,
  variant = 'default',
  className,
}: WishlistButtonProps) {
  const { hasWishlistItem, toggleWishlist, isTogglingProduct } = useWishlist();
  const isSelected = hasWishlistItem(productId);
  const labelName = productName ?? 'product';
  const isDisabled = isTogglingProduct(productId);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    void toggleWishlist(productId);
  };

  if (variant === 'card') {
    return (
      <button
        type="button"
        className={cn(
          'absolute top-[5px] right-[5px] z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-colors',
          isSelected ? 'text-red-600' : 'text-[#151515]',
          isDisabled && 'cursor-not-allowed',
          className,
        )}
        aria-label={
          isSelected ? `Remove ${labelName} from wishlist` : `Add ${labelName} to wishlist`
        }
        aria-pressed={isSelected}
        disabled={isDisabled}
        onClick={handleClick}
      >
        <HeartIcon filled={isSelected} className="h-7 w-7" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      aria-label={isSelected ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={isSelected}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {isSelected ? 'Wishlisted' : 'Wishlist'}
    </Button>
  );
}
