import Link from 'next/link';

import {
  demifinePreDealsConfig,
  productMessages,
  productTheme,
} from '@/config/product/product.config';
import { formatPrice } from '@/lib/format-price';
import { cn } from '@/lib/utils/cn';

/**
 * Replaces `{{token}}` placeholders in configured copy strings.
 *
 * @param template - Message template containing optional placeholders.
 * @param values - Token values to inject.
 * @returns Interpolated copy string.
 */
function fillMessageTemplate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (message, [token, value]) => message.replaceAll(`{{${token}}}`, value),
    template,
  );
}

/** Free-gift product card shown below the demifine delivery checker. */
export function DemifineCashbackBanner() {
  const gift = demifinePreDealsConfig.freeGift;
  const theme = productTheme.freeGiftBanner;
  const worth = formatPrice(gift.worthAmount).replace(/\s/g, '');
  const minOrder = formatPrice(gift.minOrderAmount).replace(/\s/g, '');
  const threshold = fillMessageTemplate(productMessages.freeGiftOnOrdersAbove, { minOrder });
  const ariaLabel = fillMessageTemplate(productMessages.a11y.freeGiftProduct, {
    name: gift.name,
    worth,
  });

  return (
    <Link
      href={`/products/${gift.handle}`}
      className={theme.wrapClass}
      style={{
        backgroundImage: theme.gradient,
        borderColor: theme.border,
        boxShadow: theme.shadow,
      }}
      data-testid="pdp-free-gift-banner"
      aria-label={ariaLabel}
    >
      <span
        className={theme.badgeClass}
        style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
      >
        {productMessages.freeGiftBadge}
      </span>
      <span className={theme.imageWrapClass}>
        {/* Configured gift thumb — local img so Shopify CDN works without next/image sizing. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={gift.imageUrl} alt="" width={64} height={64} className={theme.imageClass} />
      </span>
      <div className="min-w-0 flex-1 pr-16">
        <p
          className={cn(productTheme.typography.pdpMetaClass, 'truncate text-[13px] font-semibold')}
          style={{ color: productTheme.ink }}
        >
          {gift.name}
        </p>
        <p className="mt-0.5 flex items-baseline gap-2">
          <span className={theme.worthClass} style={{ color: productTheme.titleMuted }}>
            {worth}
          </span>
          <span className={theme.freeClass} style={{ color: productTheme.coupon }}>
            {productMessages.freeGiftFree}
          </span>
        </p>
        <p
          className={cn(productTheme.typography.pdpMetaClass, 'mt-0.5 leading-normal')}
          style={{ color: productTheme.titleMuted }}
        >
          {threshold}
        </p>
      </div>
    </Link>
  );
}
