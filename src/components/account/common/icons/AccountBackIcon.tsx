import accountBack from '@/components/icons/svg/account-back.svg';
import { cn } from '@/lib/utils/cn';

interface AccountBackIconProps {
  className?: string;
}

function resolveSvgSrc(asset: string | { src: string }): string {
  return typeof asset === 'string' ? asset : asset.src;
}

/** Account shell back control — rounded tile + chevron (Figma 40×40). */
export function AccountBackIcon({ className }: AccountBackIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG asset import
    <img
      src={resolveSvgSrc(accountBack)}
      alt=""
      width={40}
      height={40}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    />
  );
}
