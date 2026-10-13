import { ClockIcon, LightningIcon } from '@/components/icons';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { cn } from '@/lib/utils/cn';

interface ProductTagBadgeProps {
  /** Gold keeps the original selling-fast pill; demifine uses the shipping promise. */
  variant?: 'shipsIn24Hours' | 'sellingFast';
  /** API tag value for the gold selling-fast pill. */
  label?: string;
}

/** Renders the PDP header tag pill. */
export function ProductTagBadge({ variant = 'shipsIn24Hours', label }: ProductTagBadgeProps) {
  const isSellingFast = variant === 'sellingFast';
  const chrome = isSellingFast ? productTheme.sellingFastTag : productTheme.tagBadge;
  const text = isSellingFast
    ? label?.trim() || productMessages.sellingFast
    : productMessages.shipsIn24Hours;
  const ariaLabel = isSellingFast
    ? productMessages.a11y.sellingFastBadge
    : productMessages.a11y.shipsIn24Hours;

  return (
    <span
      className={chrome.wrapClass}
      style={{ backgroundImage: chrome.ringGradient }}
      aria-label={ariaLabel}
    >
      <span className={chrome.innerClass} style={{ backgroundImage: chrome.fillGradient }}>
        {isSellingFast ? (
          <LightningIcon className="h-3 w-2.5 shrink-0" />
        ) : (
          <ClockIcon className="h-3.5 w-3.5 shrink-0" style={{ color: chrome.text }} />
        )}
        <span
          className={cn(chrome.labelClass, themeFonts.sans.className)}
          style={{ color: chrome.text }}
        >
          {text}
        </span>
      </span>
    </span>
  );
}
