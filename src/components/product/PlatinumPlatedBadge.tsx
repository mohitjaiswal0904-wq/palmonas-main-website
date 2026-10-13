import { PlatinumPlatedIcon } from '@/components/icons/PlatinumPlatedIcon';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';
import { cn } from '@/lib/utils/cn';

/**
 * Listing-card platinum plated pill under the price (Figma 4092:54369).
 * Fill sits on the inner pill; the 0.5px ring only carries the fading stroke.
 */
export function PlatinumPlatedBadge() {
  const chrome = productTheme.platinumPlated;

  return (
    <span
      className={chrome.strokeClass}
      style={{
        borderRadius: chrome.radius,
        background: chrome.strokeGradient,
      }}
    >
      <span
        className={cn(chrome.layoutClass, themeFonts.sans.className)}
        style={{
          color: chrome.text,
          borderRadius: chrome.radius,
          background: chrome.gradient,
        }}
      >
        <PlatinumPlatedIcon className={chrome.iconClass} />
        <span className={cn(chrome.labelClass, themeFonts.sans.className)}>
          {productMessages.platinumPlated}
        </span>
      </span>
    </span>
  );
}
