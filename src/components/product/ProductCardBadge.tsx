import { productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { cn } from '@/lib/utils/cn';

interface ProductCardBadgeProps {
  label: string;
  className?: string;
  /** Overrides the default pink ribbon. Listing cards keep the theme color. */
  background?: string;
  /** Extra label classes, such as a darker gold-on-gold text color. */
  labelClassName?: string;
}

/**
 * Renders the listing-card ribbon badge with a looping shine sweep.
 *
 * @param label - Badge copy from the product payload.
 * @param className - Optional extra classes for placement overrides.
 * @param background - Optional ribbon fill. Defaults to the listing-card pink.
 * @param labelClassName - Optional label classes merged over the theme label style.
 */
export function ProductCardBadge({
  label,
  className,
  background,
  labelClassName,
}: ProductCardBadgeProps) {
  return (
    <span
      className={cn(productTheme.cardBadge.layoutClass, themeFonts.sans.className, className)}
      style={{ backgroundColor: background ?? productTheme.cardBadge.background }}
    >
      <span className={cn(productTheme.cardBadge.labelClass, labelClassName)}>{label}</span>
    </span>
  );
}
