'use client';

import { HeartIcon } from '@/components/icons';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils/cn';

interface ProductWishlistIconProps {
  productId: string;
  productName: string;
}

export function ProductWishlistIcon({ productId, productName }: ProductWishlistIconProps) {
  const { hasWishlistItem, toggleWishlist, isTogglingProduct } = useWishlist();
  const isWishlisted = hasWishlistItem(productId);
  const isDisabled = isTogglingProduct(productId);

  return (
    <button
      type="button"
      className={cn(
        'shrink-0 transition-colors',
        isWishlisted ? 'text-red-600' : 'text-stone-900',
        isDisabled && 'cursor-not-allowed',
      )}
      aria-label={
        isWishlisted ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`
      }
      aria-pressed={isWishlisted}
      disabled={isDisabled}
      onClick={() => {
        void toggleWishlist(productId);
      }}
    >
      <HeartIcon filled={isWishlisted} className="h-8 w-8" />
    </button>
  );
}
