import wishlistRemove from '@/components/icons/svg/wishlist-remove.svg';
import { cn } from '@/lib/utils/cn';

interface WishlistRemoveIconProps {
  className?: string;
}

function resolveSvgSrc(asset: string | { src: string }): string {
  return typeof asset === 'string' ? asset : asset.src;
}

/** Wishlist card remove control — trash/delete bin (Figma 16×16). */
export function WishlistRemoveIcon({ className }: WishlistRemoveIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG asset import
    <img
      src={resolveSvgSrc(wishlistRemove)}
      alt=""
      width={16}
      height={16}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    />
  );
}
