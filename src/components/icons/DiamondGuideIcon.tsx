import diamondGuide from '@/components/icons/svg/diamond-guide.svg';
import { cn } from '@/lib/utils/cn';

interface DiamondGuideIconProps {
  className?: string;
}

function resolveSvgSrc(asset: string | { src: string }): string {
  return typeof asset === 'string' ? asset : asset.src;
}

/** Gold PDP diamond guide CTA icon (Figma 16×16). */
export function DiamondGuideIcon({ className }: DiamondGuideIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG asset import
    <img
      src={resolveSvgSrc(diamondGuide)}
      alt=""
      width={16}
      height={16}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    />
  );
}
